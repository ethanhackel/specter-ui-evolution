import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { playSendSound, playReceiveSound, playVanishSound, playConnectSound } from "@/lib/sounds";

export type ChatState = "idle" | "picking" | "searching" | "connected" | "rating";

export type ChatMessage = {
  id: string;
  type: "me" | "them" | "system";
  text: string;
  time: string;
  isSticker?: boolean;
  stickerKey?: string;
  unsent?: boolean;
  reaction?: string;
  replyTo?: { text: string; sender: string };
  dbId?: string; // actual DB message id
};

type UseChatOptions = {
  userId: string | undefined;
  username: string;
};

export const useChat = ({ userId, username }: UseChatOptions) => {
  const [state, setState] = useState<ChatState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [timer, setTimer] = useState(0);
  const [partnerName, setPartnerName] = useState("");
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());

  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const queuePollingRef = useRef<ReturnType<typeof setInterval>>();
  const partnerNameRef = useRef("");
  const messagesRef = useRef<ChatMessage[]>([]);

  // Keep refs in sync
  useEffect(() => { partnerNameRef.current = partnerName; }, [partnerName]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const now = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Timer
  useEffect(() => {
    if (state === "connected") {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  // Subscribe to messages in a room
  const subscribeToRoom = useCallback(
    (roomId: string) => {
      // Clean up previous subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase
        .channel(`room:${roomId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            const msg = payload.new as any;
            if (msg.sender_id === userId) return; // skip own messages (already in state)

            const chatMsg: ChatMessage = {
              id: `db-${msg.id}`,
              dbId: msg.id,
              type: "them",
              text: msg.content || "",
              time: new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isSticker: msg.is_sticker,
              stickerKey: msg.sticker_key,
              unsent: msg.is_unsent,
              reaction: msg.reaction,
            };
            setMessages((prev) => [...prev, chatMsg]);
            playReceiveSound();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            const msg = payload.new as any;
            setMessages((prev) =>
              prev.map((m) =>
                m.dbId === msg.id
                  ? {
                      ...m,
                      unsent: msg.is_unsent,
                      reaction: msg.reaction,
                      text: msg.is_unsent ? "" : m.text,
                      isSticker: msg.is_unsent ? false : m.isSticker,
                    }
                  : m
              )
            );
          }
        )
        .subscribe();

      channelRef.current = channel;

      // Typing indicator channel
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
      }
      const typingChannel = supabase.channel(`typing:${roomId}`);
      typingChannel
        .on("broadcast", { event: "typing" }, (payload) => {
          if (payload.payload?.user_id !== userId) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 2000);
          }
        })
        .subscribe();
      typingChannelRef.current = typingChannel;
    },
    [userId]
  );

  // Listen for room status changes (partner disconnected)
  useEffect(() => {
    if (!roomId || state !== "connected") return;

    const roomChannel = supabase
      .channel(`room_status:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const room = payload.new as any;
          if (room.status === "ended" && room.ended_by !== userId) {
            // Partner left
            playVanishSound();
            setMessages((prev) => [
              ...prev,
              {
                id: `sys-${Date.now()}`,
                type: "system",
                text: `${partnerName} vanished into the void... 👻`,
                time: now(),
              },
            ]);
            setState("rating");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [roomId, state, userId, partnerName]);

  // Find a match
  const findMatch = useCallback(async () => {
    if (!userId) return;

    // Check if user is banned
    const { data: banCheck } = await supabase.rpc("is_user_banned", { _user_id: userId });
    if (banCheck === true) {
      setMessages([{
        id: `sys-banned`,
        type: "system",
        text: "⛔ Your account has been suspended. You cannot start new chats.",
        time: now(),
      }]);
      return;
    }

    setState("searching");
    setMessages([]);
    setTimer(0);
    setMessages([]);
    setTimer(0);

    const interestsArr = Array.from(selectedInterests);

    // Add to queue
    await supabase.from("matchmaking_queue").insert({
      user_id: userId,
      interests: interestsArr,
      status: "waiting" as const,
    });

    // Try to find match via RPC
    const tryMatch = async (): Promise<boolean> => {
      const { data, error } = await supabase.rpc("find_and_create_match", {
        _user_id: userId,
        _interests: interestsArr,
      });

      if (error || !data || data.length === 0) return false;

      const match = data[0];
      setRoomId(match.room_id);
      setPartnerId(match.partner_id);
      setPartnerName(match.partner_username || `Ghost#${match.partner_id.substring(0, 4)}`);
      setState("connected");
      playConnectSound();

      // Update own queue entry
      await supabase
        .from("matchmaking_queue")
        .update({ status: "matched" as const, matched_room_id: match.room_id })
        .eq("user_id", userId)
        .eq("status", "waiting" as const);

      setMessages([
        {
          id: `sys-connect`,
          type: "system",
          text: `Connected with ${match.partner_username || "Ghost#" + match.partner_id.substring(0, 4)} — say hello! 👋`,
          time: now(),
        },
      ]);

      subscribeToRoom(match.room_id);
      return true;
    };

    // Try immediately
    const found = await tryMatch();
    if (found) return;

    // Poll every 2 seconds
    queuePollingRef.current = setInterval(async () => {
      // Check if our queue entry was matched by someone else
      const { data: queueEntry } = await supabase
        .from("matchmaking_queue")
        .select("*, matched_room_id")
        .eq("user_id", userId)
        .eq("status", "matched" as const)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (queueEntry?.matched_room_id) {
        clearInterval(queuePollingRef.current!);

        // Fetch room details
        const { data: room } = await supabase
          .from("chat_rooms")
          .select("*")
          .eq("id", queueEntry.matched_room_id)
          .single();

        if (room) {
          const pId = room.user1_id === userId ? room.user2_id : room.user1_id;
          const { data: partnerUsername } = await supabase
            .rpc("get_username", { _user_id: pId });

          setRoomId(room.id);
          setPartnerId(pId);
          setPartnerName(partnerUsername || `Ghost#${pId.substring(0, 4)}`);
          setState("connected");
          playConnectSound();

          setMessages([
            {
              id: `sys-connect`,
              type: "system",
              text: `Connected with ${partnerUsername || "Ghost#" + pId.substring(0, 4)} — say hello! 👋`,
              time: now(),
            },
          ]);

          subscribeToRoom(room.id);
        }
        return;
      }

      // Also try to match someone else
      const matched = await tryMatch();
      if (matched) {
        clearInterval(queuePollingRef.current!);
      }
    }, 2500);
  }, [userId, selectedInterests, subscribeToRoom]);

  const cancelSearch = useCallback(async () => {
    if (queuePollingRef.current) clearInterval(queuePollingRef.current);
    // Cancel queue entry
    if (userId) {
      await supabase
        .from("matchmaking_queue")
        .update({ status: "cancelled" as const })
        .eq("user_id", userId)
        .eq("status", "waiting" as const);
    }
    setState("idle");
  }, [userId]);

  const leaveChat = useCallback(async () => {
    if (queuePollingRef.current) clearInterval(queuePollingRef.current);
    playVanishSound();

    if (roomId && userId) {
      await supabase
        .from("chat_rooms")
        .update({ status: "ended" as const, ended_by: userId, ended_at: new Date().toISOString() })
        .eq("id", roomId);

      // Update presence
      await supabase
        .from("presence")
        .update({ is_in_chat: false, current_room_id: null })
        .eq("user_id", userId);
    }

    // Clean up channels
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    if (typingChannelRef.current) supabase.removeChannel(typingChannelRef.current);

    setMessages((prev) => [
      ...prev,
      { id: `sys-${Date.now()}`, type: "system", text: "You disconnected from the chat.", time: now() },
    ]);
    setState("rating");
  }, [roomId, userId]);

  const sendMessage = useCallback(
    async (text: string, replyTo?: { text: string; sender: string }, replyToDbId?: string) => {
      if (!text.trim() || state !== "connected" || !roomId || !userId) return;

      const tempId = `temp-${Date.now()}`;
      const chatMsg: ChatMessage = {
        id: tempId,
        type: "me",
        text,
        time: now(),
        replyTo,
      };
      setMessages((prev) => [...prev, chatMsg]);
      playSendSound();

      // Broadcast typing stop
      typingChannelRef.current?.send({
        type: "broadcast",
        event: "typing_stop",
        payload: { user_id: userId },
      });

      const { data } = await supabase
        .from("messages")
        .insert({
          room_id: roomId,
          sender_id: userId,
          content: text,
          reply_to_id: replyToDbId || null,
        })
        .select("id")
        .single();

      if (data) {
        // Update temp message with real DB id
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, dbId: data.id } : m))
        );
      }
    },
    [state, roomId, userId]
  );

  const sendSticker = useCallback(
    async (stickerKey: string) => {
      if (state !== "connected" || !roomId || !userId) return;

      const tempId = `temp-${Date.now()}`;
      const chatMsg: ChatMessage = {
        id: tempId,
        type: "me",
        text: "",
        time: now(),
        isSticker: true,
        stickerKey,
      };
      setMessages((prev) => [...prev, chatMsg]);
      playSendSound();

      const { data } = await supabase
        .from("messages")
        .insert({
          room_id: roomId,
          sender_id: userId,
          content: "",
          is_sticker: true,
          sticker_key: stickerKey,
        })
        .select("id")
        .single();

      if (data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, dbId: data.id } : m))
        );
      }
    },
    [state, roomId, userId]
  );

  const sendTypingIndicator = useCallback(() => {
    typingChannelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: userId },
    });
  }, [userId]);

  const unsendMessage = useCallback(
    async (msgId: string, dbId?: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, unsent: true, text: "", isSticker: false, stickerKey: undefined }
            : m
        )
      );
      if (dbId) {
        await supabase
          .from("messages")
          .update({ is_unsent: true, content: "" })
          .eq("id", dbId);
      }
    },
    []
  );

  const reactToMessage = useCallback(
    async (msgId: string, emoji: string, dbId?: string) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, reaction: emoji } : m))
      );
      if (dbId) {
        await supabase
          .from("messages")
          .update({ reaction: emoji || null })
          .eq("id", dbId);
      }
    },
    []
  );

  const submitRating = useCallback(
    async (score: number) => {
      if (roomId && userId && partnerId && score > 0) {
        await supabase.from("ratings").insert({
          room_id: roomId,
          rater_id: userId,
          rated_id: partnerId,
          score,
        });

        // Update partner karma
        await supabase.rpc("refresh_online_count"); // reuse as general stat refresh
      }
      setRoomId(null);
      setPartnerId(null);
      setPartnerName("");
      setState("idle");
    },
    [roomId, userId, partnerId]
  );

  const reportMessage = useCallback(
    async (msgId: string, dbMsgId?: string) => {
      if (!userId || !partnerId || !roomId) return;
      await supabase.from("reports").insert({
        reporter_id: userId,
        reported_user_id: partnerId,
        room_id: roomId,
        message_id: dbMsgId || null,
        reason: "inappropriate",
      });
    },
    [userId, partnerId, roomId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (queuePollingRef.current) clearInterval(queuePollingRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (typingChannelRef.current) supabase.removeChannel(typingChannelRef.current);
    };
  }, []);

  return {
    state,
    setState,
    messages,
    setMessages,
    timer,
    partnerName,
    partnerId,
    roomId,
    isTyping,
    selectedInterests,
    setSelectedInterests,
    findMatch,
    cancelSearch,
    leaveChat,
    sendMessage,
    sendSticker,
    sendTypingIndicator,
    unsendMessage,
    reactToMessage,
    submitRating,
    reportMessage,
  };
};
