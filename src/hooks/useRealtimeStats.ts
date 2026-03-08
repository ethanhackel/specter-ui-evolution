import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteStats = {
  online_count: number;
  chats_today: number;
  total_chats: number;
  total_messages: number;
};

export const useRealtimeStats = () => {
  const [stats, setStats] = useState<SiteStats>({
    online_count: 0,
    chats_today: 0,
    total_chats: 0,
    total_messages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial stats
    const fetchStats = async () => {
      const { data } = await supabase
        .from("site_stats")
        .select("*")
        .eq("id", 1)
        .single();
      if (data) {
        setStats({
          online_count: data.online_count,
          chats_today: data.chats_today,
          total_chats: data.total_chats,
          total_messages: data.total_messages,
        });
      }
      setLoading(false);
    };
    fetchStats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("site_stats_realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "site_stats", filter: "id=eq.1" },
        (payload) => {
          const d = payload.new as any;
          setStats({
            online_count: d.online_count,
            chats_today: d.chats_today,
            total_chats: d.total_chats,
            total_messages: d.total_messages,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, loading };
};
