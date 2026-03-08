import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Shield, Users, MessageSquare, Flag, Activity, Ban, CheckCircle, XCircle, Eye, BarChart3, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type Report = {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  room_id: string | null;
  message_id: string | null;
  reason: string;
  status: string;
  created_at: string;
  reporter_username?: string;
  reported_username?: string;
};

type UserProfile = {
  id: string;
  user_id: string;
  username: string;
  karma: number;
  total_chats: number;
  is_guest: boolean;
  created_at: string;
};

type Stats = {
  online_count: number;
  total_chats: number;
  chats_today: number;
  total_messages: number;
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { toast } = useToast();

  const [stats, setStats] = useState<Stats>({ online_count: 0, total_chats: 0, chats_today: 0, total_messages: 0 });
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchStats = useCallback(async () => {
    const { data } = await supabase.from("site_stats").select("*").eq("id", 1).single();
    if (data) setStats(data);
  }, []);

  const fetchReports = useCallback(async () => {
    const { data: reportData } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (reportData && reportData.length > 0) {
      // Get unique user IDs for username lookup
      const userIds = [...new Set(reportData.flatMap(r => [r.reporter_id, r.reported_user_id]))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.username]) ?? []);

      setReports(reportData.map(r => ({
        ...r,
        reporter_username: profileMap.get(r.reporter_id) ?? "Unknown",
        reported_username: profileMap.get(r.reported_user_id) ?? "Unknown",
      })));
    } else {
      setReports([]);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setUsers(data);
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (!isAdmin) return;
    fetchStats();
    fetchReports();
    fetchUsers();
  }, [isAdmin, fetchStats, fetchReports, fetchUsers]);

  // Real-time stats subscription
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel("admin-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_stats" }, (payload) => {
        if (payload.new) setStats(payload.new as Stats);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reports" }, () => {
        fetchReports();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, fetchReports]);

  // Auth/admin gate
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Shield className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-heading font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You don't have admin privileges.</p>
        <Button onClick={() => navigate("/")} variant="outline">Go Home</Button>
      </div>
    );
  }

  const handleReportAction = async (reportId: string, action: "resolved" | "dismissed") => {
    const { error } = await supabase
      .from("reports")
      .update({ status: action })
      .eq("id", reportId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Report updated", description: `Report ${action} successfully.` });
      fetchReports();
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-40 backdrop-blur-lg" style={{ background: "hsl(var(--background) / 0.9)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="font-heading text-lg font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            ← Back to Site
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users className="w-5 h-5" />} label="Online Now" value={stats.online_count} accent />
          <StatCard icon={<Activity className="w-5 h-5" />} label="Chats Today" value={stats.chats_today} />
          <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Total Chats" value={stats.total_chats} />
          <StatCard icon={<MessageSquare className="w-5 h-5" />} label="Total Messages" value={stats.total_messages} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="w-4 h-4 mr-1.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Flag className="w-4 h-4 mr-1.5" /> Reports
              {reports.filter(r => r.status === "pending").length > 0 && (
                <Badge variant="destructive" className="ml-1.5 text-xs px-1.5 py-0">
                  {reports.filter(r => r.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-1.5" /> Users
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> Live Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground text-sm">Online users</span>
                    <span className="text-foreground font-mono font-bold">{stats.online_count}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground text-sm">Chats today</span>
                    <span className="text-foreground font-mono font-bold">{stats.chats_today}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground text-sm">Total messages sent</span>
                    <span className="text-foreground font-mono font-bold">{stats.total_messages.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground text-sm">Total chats completed</span>
                    <span className="text-foreground font-mono font-bold">{stats.total_chats.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <Flag className="w-4 h-4 text-destructive" /> Recent Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reports.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">No reports yet 🎉</p>
                  ) : (
                    <div className="space-y-2">
                      {reports.slice(0, 5).map(r => (
                        <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div>
                            <span className="text-sm text-foreground">{r.reported_username}</span>
                            <span className="text-xs text-muted-foreground ml-2">{r.reason}</span>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-base">All Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-8 text-center">No reports found.</p>
                ) : (
                  <div className="space-y-3">
                    {reports.map(r => (
                      <div key={r.id} className="rounded-lg border border-border p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-foreground font-medium text-sm">
                                {r.reporter_username}
                              </span>
                              <span className="text-muted-foreground text-xs">reported</span>
                              <span className="text-foreground font-medium text-sm">
                                {r.reported_username}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {timeAgo(r.created_at)}
                            </p>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>

                        <div className="rounded-md bg-secondary/50 px-3 py-2">
                          <p className="text-sm text-secondary-foreground">Reason: {r.reason}</p>
                        </div>

                        {r.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
                              onClick={() => handleReportAction(r.id, "resolved")}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Resolve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-muted-foreground/30 text-muted-foreground hover:bg-muted"
                              onClick={() => handleReportAction(r.id, "dismissed")}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Dismiss
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-base">
                  Registered Users ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-left">
                        <th className="pb-3 pr-4">Username</th>
                        <th className="pb-3 pr-4">Type</th>
                        <th className="pb-3 pr-4">Karma</th>
                        <th className="pb-3 pr-4">Chats</th>
                        <th className="pb-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-border/50 last:border-0">
                          <td className="py-3 pr-4 text-foreground font-medium">{u.username}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={u.is_guest ? "secondary" : "default"} className="text-xs">
                              {u.is_guest ? "Guest" : "Registered"}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground font-mono">{u.karma}</td>
                          <td className="py-3 pr-4 text-muted-foreground font-mono">{u.total_chats}</td>
                          <td className="py-3 text-muted-foreground">{timeAgo(u.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) => (
  <Card className="bg-card border-border">
    <CardContent className="pt-5 pb-4 px-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${accent ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-xl font-bold font-mono ${accent ? "text-primary" : "text-foreground"}`}>
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { className: string; label: string }> = {
    pending: { className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", label: "Pending" },
    resolved: { className: "bg-green-500/15 text-green-400 border-green-500/30", label: "Resolved" },
    dismissed: { className: "bg-muted text-muted-foreground border-border", label: "Dismissed" },
  };
  const c = config[status] ?? config.pending;
  return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>;
};

export default Admin;
