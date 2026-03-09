import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Generate or retrieve a session ID for anonymous tracking
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("specter_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("specter_session_id", sessionId);
  }
  return sessionId;
};

// Parse UTM source or referrer into a source label
const getTrafficSource = (): string => {
  const params = new URLSearchParams(window.location.search);
  const utm = params.get("utm_source");
  if (utm) return utm;

  const ref = document.referrer;
  if (!ref) return "Direct";

  try {
    const host = new URL(ref).hostname.replace("www.", "");
    if (host.includes("google")) return "Google Search";
    if (host.includes("bing")) return "Bing";
    if (host.includes("yahoo")) return "Yahoo";
    if (host.includes("duckduckgo")) return "DuckDuckGo";
    if (host.includes("twitter") || host.includes("x.com")) return "Twitter/X";
    if (host.includes("facebook")) return "Facebook";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("reddit")) return "Reddit";
    if (host.includes("youtube")) return "YouTube";
    if (host.includes("tiktok")) return "TikTok";
    if (host.includes("linkedin")) return "LinkedIn";
    // If referrer is our own domain, it's internal navigation
    if (host.includes(window.location.hostname)) return "Internal";
    return host;
  } catch {
    return "Other";
  }
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const source = getTrafficSource();
    // Don't track internal navigation
    if (source === "Internal") return;

    const trackView = async () => {
      try {
        await supabase.from("page_views").insert({
          path: location.pathname,
          referrer: document.referrer || null,
          source,
          user_agent: navigator.userAgent,
          session_id: getSessionId(),
        });
      } catch {
        // Silently fail - tracking shouldn't break the app
      }
    };

    trackView();
  }, [location.pathname]);
};
