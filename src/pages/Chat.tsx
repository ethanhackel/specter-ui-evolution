import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import specterMascot from "@/assets/specter-mascot.png";
import stickerSpooky from "@/assets/stickers/spooky.png";
import stickerHello from "@/assets/stickers/hello.png";
import stickerLaugh from "@/assets/stickers/laugh.png";
import stickerLove from "@/assets/stickers/love.png";
import stickerCry from "@/assets/stickers/cry.png";
import stickerCool from "@/assets/stickers/cool.png";
import stickerAngry from "@/assets/stickers/angry.png";
import stickerSleep from "@/assets/stickers/sleep.png";
import stickerThink from "@/assets/stickers/think.png";
import stickerThumbsup from "@/assets/stickers/thumbsup.png";
import stickerShocked from "@/assets/stickers/shocked.png";
import stickerDance from "@/assets/stickers/dance.png";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import { usePresence } from "@/hooks/usePresence";
import { useToast } from "@/hooks/use-toast";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import ChatHeader from "@/components/chat/ChatHeader";
import { IdleOverlay, PickingOverlay, SearchingOverlay, RatingOverlay } from "@/components/chat/ChatOverlays";
import ChatInputArea from "@/components/chat/ChatInputArea";
import ChatContextMenu from "@/components/chat/ChatContextMenu";

type PickerTab = "emoji" | "sticker";

const stickerMap: Record<string, string> = {
  hello: stickerHello, laugh: stickerLaugh, love: stickerLove, cool: stickerCool,
  spooky: stickerSpooky, angry: stickerAngry, cry: stickerCry, shocked: stickerShocked,
  think: stickerThink, thumbsup: stickerThumbsup, sleep: stickerSleep, dance: stickerDance,
};

const Chat = () => {
  const { user, signInAnonymously, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const {
    state, setState,
    messages,
    timer,
    partnerName,
    isTyping,
    selectedInterests, setSelectedInterests,
    findMatch,
    cancelSearch,
    leaveChat,
    sendMessage,
    sendSticker: sendStickerHook,
    sendTypingIndicator,
    unsendMessage,
    reactToMessage,
    submitRating,
    reportMessage,
  } = useChat({ userId: user?.id, username: "You" });

  usePresence(user?.id);

  const [input, setInput] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<PickerTab>("emoji");
  const [emojiCategory, setEmojiCategory] = useState(0);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; sender: string; dbId?: string } | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [autoAuthDone, setAutoAuthDone] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto sign-in anonymously
  useEffect(() => {
    if (!authLoading && !user && !autoAuthDone) {
      setAutoAuthDone(true);
      signInAnonymously();
    }
  }, [authLoading, user, autoAuthDone, signInAnonymously]);

  // Preload sticker images
  useEffect(() => {
    Object.values(stickerMap).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Handle mobile keyboard
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handleResize = () => {
      document.documentElement.style.setProperty('--vh', `${vv.height}px`);
    };
    vv.addEventListener('resize', handleResize);
    handleResize();
    return () => vv.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages]);

  // Close picker/menu on outside click
  useEffect(() => {
    if (!pickerOpen && menuOpenId === null) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (pickerOpen && pickerRef.current && !pickerRef.current.contains(target)) {
        setPickerOpen(false);
      }
      if (menuOpenId !== null && menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [pickerOpen, menuOpenId]);

  // Position context menu near the message
  useEffect(() => {
    if (!menuOpenId || !menuRef.current) return;
    const msgEl = document.getElementById(`msg-${menuOpenId}`);
    if (!msgEl || !messagesContainerRef.current) return;
    const msgRect = msgEl.getBoundingClientRect();
    const containerRect = messagesContainerRef.current.getBoundingClientRect();
    const menu = menuRef.current;
    const menuHeight = menu.offsetHeight;
    const menuWidth = menu.offsetWidth;

    // Find the message to determine positioning
    const msg = messages.find(m => m.id === menuOpenId);
    const isMe = msg?.type === "me";

    let top = msgRect.bottom + 4;
    if (top + menuHeight > window.innerHeight - 20) {
      top = msgRect.top - menuHeight - 4;
    }
    top = Math.max(containerRect.top, Math.min(top, window.innerHeight - menuHeight - 10));

    let left = isMe ? msgRect.right - menuWidth : msgRect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
  }, [menuOpenId, messages]);

  const handleFindMatch = useCallback(() => {
    setMobileDrawerOpen(false);
    findMatch();
  }, [findMatch]);

  const handleSendMessage = useCallback(() => {
    if (!input.trim() || state !== "connected") return;
    const text = input.trim();
    setInput("");
    setPickerOpen(false);
    sendMessage(
      text,
      replyingTo ? { text: replyingTo.text, sender: replyingTo.sender } : undefined,
      replyingTo?.dbId
    );
    setReplyingTo(null);
  }, [input, state, sendMessage, replyingTo]);

  const handleSendSticker = useCallback((key: string) => {
    if (state !== "connected") return;
    setPickerOpen(false);
    sendStickerHook(key);
  }, [state, sendStickerHook]);

  const toggleInterest = useCallback((key: string) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, [setSelectedInterests]);

  const handleSubmitRating = useCallback(() => {
    submitRating(rating);
    setRating(0);
    setHoverRating(0);
  }, [submitRating, rating]);

  const findNext = useCallback(() => {
    submitRating(0);
    setRating(0);
    setHoverRating(0);
    setSelectedInterests(new Set());
    setState("picking");
  }, [submitRating, setSelectedInterests, setState]);

  const skipRating = useCallback(() => {
    submitRating(0);
    setRating(0);
    setHoverRating(0);
  }, [submitRating]);

  const copyText = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setMenuOpenId(null);
    toast({ title: "Copied!", description: "Text copied to clipboard" });
  }, [toast]);

  const replyToMsg = useCallback((msg: typeof messages[0]) => {
    setReplyingTo({
      id: msg.id,
      text: msg.isSticker ? "🖼️ Sticker" : msg.text,
      sender: msg.type === "me" ? "You" : partnerName,
      dbId: msg.dbId,
    });
    setMenuOpenId(null);
    inputRef.current?.focus();
  }, [partnerName]);

  const handleReactToMsg = useCallback((msgId: string, emoji: string, dbId?: string) => {
    reactToMessage(msgId, emoji, dbId);
    setMenuOpenId(null);
  }, [reactToMessage]);

  const handleUnsendMsg = useCallback((msgId: string, dbId?: string) => {
    unsendMessage(msgId, dbId);
    setMenuOpenId(null);
  }, [unsendMessage]);

  const handleReportMsg = useCallback((msgId: string, dbId?: string) => {
    reportMessage(msgId, dbId);
    setMenuOpenId(null);
    toast({ title: "Reported", description: "Message reported. Our team will review it." });
  }, [reportMessage, toast]);

  const handleInputChange = useCallback((val: string) => {
    setInput(val);
    if (val.trim()) sendTypingIndicator();
  }, [sendTypingIndicator]);

  const getStickerSrc = useCallback((key?: string) => key ? stickerMap[key] || "" : "", []);

  // Get active menu message for context menu
  const activeMenuMsg = useMemo(() => {
    if (!menuOpenId) return null;
    return messages.find(m => m.id === menuOpenId) || null;
  }, [menuOpenId, messages]);

  if (authLoading || (!user && !autoAuthDone)) {
    return (
      <div className="h-[100dvh] bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={specterMascot} alt="" className="w-16 h-16 mx-auto mb-4" style={{ filter: "drop-shadow(0 0 20px hsl(0 72% 51% / 0.4))" }} />
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm mt-4 font-mono">Entering the void...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "linear-gradient(hsl(0 72% 51% / 0.02) 1px, transparent 1px), linear-gradient(90deg, hsl(0 72% 51% / 0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top Bar */}
      <ChatHeader
        state={state}
        timer={timer}
        mobileDrawerOpen={mobileDrawerOpen}
        setMobileDrawerOpen={setMobileDrawerOpen}
        onFind={handleFindMatch}
        onLeave={leaveChat}
        setState={setState}
        setSelectedInterests={setSelectedInterests}
      />

      {/* Main */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sm:hidden fixed inset-0 z-30 bg-background/60 backdrop-blur-sm"
                onClick={() => setMobileDrawerOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="sm:hidden fixed left-0 top-0 bottom-0 z-40 w-72 border-r border-border flex flex-col py-6 overflow-y-auto bg-card"
              >
                <div className="flex items-center justify-between px-5 mb-4">
                  <span className="font-heading font-black text-sm tracking-widest">
                    <span className="text-gradient">SPECTER</span>
                    <span className="text-foreground">CHAT</span>
                  </span>
                  <button onClick={() => setMobileDrawerOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Close menu">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <ChatSidebar timer={timer} state={state} partnerName={partnerName} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <div className="hidden sm:flex w-64 shrink-0 border-r border-border flex-col py-6 overflow-y-auto bg-card">
          <ChatSidebar timer={timer} state={state} partnerName={partnerName} />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {state === "idle" && <IdleOverlay setState={setState} setSelectedInterests={setSelectedInterests} />}
          {state === "picking" && <PickingOverlay selectedInterests={selectedInterests} toggleInterest={toggleInterest} onSearch={handleFindMatch} />}
          {state === "searching" && <SearchingOverlay selectedInterests={selectedInterests} onCancel={cancelSearch} />}
          {state === "rating" && (
            <RatingOverlay
              partnerName={partnerName}
              rating={rating}
              hoverRating={hoverRating}
              setRating={setRating}
              setHoverRating={setHoverRating}
              onSubmit={handleSubmitRating}
              onFindNext={findNext}
              onSkip={skipRating}
            />
          )}

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 chat-messages-scroll">
            {messages.map((msg) => (
              <div
                key={msg.id}
                id={`msg-${msg.id}`}
                className={`flex max-w-[85%] sm:max-w-[75%] gap-1.5 sm:gap-2 items-end animate-[slideIn_0.25s_ease-out] transition-all duration-300 ${
                  msg.type === "me" ? "self-end flex-row-reverse" :
                  msg.type === "system" ? "self-center max-w-[95%] sm:max-w-[90%]" :
                  "self-start"
                }`}
              >
                <ChatMessageBubble
                  msg={msg}
                  messages={messages}
                  menuOpenId={menuOpenId}
                  getStickerSrc={getStickerSrc}
                  setMenuOpenId={setMenuOpenId}
                  handleReactToMsg={handleReactToMsg}
                />
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 self-start px-3 sm:px-4 py-2 text-xs font-mono text-muted-foreground">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary gpu-accelerate" style={{ animation: `tdot 1.4s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
                typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Single shared context menu */}
          {activeMenuMsg && !activeMenuMsg.unsent && activeMenuMsg.type !== "system" && (
            <ChatContextMenu
              ref={menuRef}
              msg={activeMenuMsg}
              onReact={handleReactToMsg}
              onCopy={copyText}
              onReply={replyToMsg}
              onUnsend={handleUnsendMsg}
              onReport={handleReportMsg}
            />
          )}

          {/* Input Area */}
          <ChatInputArea
            state={state}
            input={input}
            setInput={setInput}
            pickerOpen={pickerOpen}
            setPickerOpen={setPickerOpen}
            pickerTab={pickerTab}
            setPickerTab={setPickerTab}
            emojiCategory={emojiCategory}
            setEmojiCategory={setEmojiCategory}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            onSend={handleSendMessage}
            onSendSticker={handleSendSticker}
            onInputChange={handleInputChange}
            pickerRef={pickerRef}
            inputRef={inputRef}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
