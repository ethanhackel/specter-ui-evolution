import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization - only service role or admin can call this
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { task } = await req.json();
    const results: Record<string, string> = {};

    if (task === "all" || task === "refresh_online_count") {
      const { error } = await supabase.rpc("refresh_online_count");
      results.refresh_online_count = error ? `error: ${error.message}` : "ok";
    }

    if (task === "all" || task === "cleanup_presence") {
      const { error } = await supabase.rpc("cleanup_stale_presence");
      results.cleanup_presence = error ? `error: ${error.message}` : "ok";
    }

    if (task === "reset_daily_stats") {
      const { error } = await supabase.rpc("reset_daily_stats");
      results.reset_daily_stats = error ? `error: ${error.message}` : "ok";
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
