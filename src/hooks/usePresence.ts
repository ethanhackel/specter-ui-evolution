import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Heartbeat-based presence: updates `presence.last_seen` every 30s
 * and calls `refresh_online_count` to update site_stats.
 */
export const usePresence = (userId: string | undefined) => {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!userId) return;

    const heartbeat = async () => {
      await supabase
        .from("presence")
        .upsert({ user_id: userId, last_seen: new Date().toISOString() }, { onConflict: "user_id" });
      // Refresh the online count
      await supabase.rpc("refresh_online_count");
    };

    // Immediate heartbeat
    heartbeat();

    // Then every 30 seconds
    intervalRef.current = setInterval(heartbeat, 30_000);

    // Cleanup: remove presence on unmount/close
    const handleBeforeUnload = () => {
      // Best-effort cleanup via navigator.sendBeacon isn't possible with Supabase client
      // The 2-minute stale window handles this
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userId]);
};
