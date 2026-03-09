import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import {
  Shield, Users, MessageSquare, Flag, Activity, Ban, CheckCircle, XCircle,
  BarChart3, TrendingUp, Clock, Trash2, UserCheck, Ghost, Globe, Search,
  Monitor, Smartphone, ExternalLink, ArrowUpRight, ArrowDownRight, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  is_banned: boolean;
  banned_at: string | null;
  ban_reason: string | null;
  created_at: string;
};

type Stats = {
  online_count: number;
  total_chats: number;
  chats_today: number;
  total_messages: number;
};

type PageView = {
  id: string;
  path: string;
  referrer: string | null;
  source: string | null;
  user_agent: string | null;
  created_at: string;
};

type TrafficStats = {
  totalViews: number;
  todayViews: number;
  uniqueSessions: number;
  topPages: { path: string; count: number }[];
  topSources: { source: string; count: number }[];
  hourlyData: { hour: string; count: number }[];
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
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [trafficStats, setTrafficStats] = useState<TrafficStats>({
    totalViews: 0, todayViews: 0, uniqueSessions: 0,
    topPages: [], topSources: [], hourlyData: [],
  });

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

  const fetchTrafficStats = useCallback(async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch recent page views
    const { data: views, count: totalCount } = await supabase
      .from("page_views")
      .select("*", { count: "exact" })
      .gte("created_at", weekAgo)
      .order("created_at", { ascending: false })
      .limit(500);

    if (!views) return;

    const todayViews = views.filter(v => v.created_at >= todayStart).length;
    const uniqueSessions = new Set(views.map(v => v.session_id).filter(Boolean)).size;

    // Top pages
    const pageCounts = new Map<string, number>();
    views.forEach(v => pageCounts.set(v.path, (pageCounts.get(v.path) || 0) + 1));
    const topPages = Array.from(pageCounts.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top sources
    const sourceCounts = new Map<string, number>();
    views.forEach(v => {
      const source = v.source || parseReferrerSource(v.referrer);
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    });
    const topSources = Array.from(sourceCounts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Hourly data (last 24h)
    const hourlyMap = new Map<string, number>();
    const last24h = views.filter(v => new Date(v.created_at).getTime() > now.getTime() - 24 * 60 * 60 * 1000);
    last24h.forEach(v => {
      const hour = new Date(v.created_at).getHours().toString().padStart(2, "0") + ":00";
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
    });
    // Fill all 24 hours
    const hourlyData: { hour: string; count: number }[] = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, "0") + ":00";
      hourlyData.push({ hour, count: hourlyMap.get(hour) || 0 });
    }

    setTrafficStats({
      totalViews: totalCount || views.length,
      todayViews,
      uniqueSessions,
      topPages,
      topSources,
      hourlyData,
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchStats();
    fetchReports();
    fetchUsers();
    fetchTrafficStats();
  }, [isAdmin, fetchStats, fetchReports, fetchUsers, fetchTrafficStats]);

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

  const handleBanUser = async (userProfile: UserProfile, ban: boolean, reason?: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_banned: ban,
        banned_at: ban ? new Date().toISOString() : null,
        ban_reason: ban ? (reason || "Violated community guidelines") : null,
      } as any)
      .eq("user_id", userProfile.user_id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: ban ? "User Banned" : "User Unbanned",
        description: `${userProfile.username} has been ${ban ? "banned" : "unbanned"}.`,
      });
      fetchUsers();
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase.rpc("admin_delete_account", {
        _target_user_id: deleteTarget.user_id,
      });
      if (error) throw error;
      toast({ title: "Account Deleted", description: `${deleteTarget.username}'s account has been permanently deleted.` });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
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

  const registeredUsers = users.filter(u => !u.is_guest);
  const guestUsers = users.filter(u => u.is_guest);

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
          <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Overview
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
              <Flag className="w-3.5 h-3.5 mr-1" /> Reports
              {reports.filter(r => r.status === "pending").length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0">
                  {reports.filter(r => r.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
              <Ghost className="w-3.5 h-3.5 mr-1" /> Users
            </TabsTrigger>
            <TabsTrigger value="registered" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
              <UserCheck className="w-3.5 h-3.5 mr-1" /> Registered
            </TabsTrigger>
            <TabsTrigger value="traffic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
              <Globe className="w-3.5 h-3.5 mr-1" /> Traffic
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
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground text-sm">Total chats completed</span>
                    <span className="text-foreground font-mono font-bold">{stats.total_chats.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground text-sm">Registered users</span>
                    <span className="text-foreground font-mono font-bold">{registeredUsers.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground text-sm">Guest users</span>
                    <span className="text-foreground font-mono font-bold">{guestUsers.length}</span>
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
                              <span className="text-foreground font-medium text-sm">{r.reporter_username}</span>
                              <span className="text-muted-foreground text-xs">reported</span>
                              <span className="text-foreground font-medium text-sm">{r.reported_username}</span>
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
                          <div className="flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" className="text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
                              onClick={() => handleReportAction(r.id, "resolved")}>
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Resolve
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                              onClick={async () => {
                                const reported = users.find(u => u.user_id === r.reported_user_id);
                                if (reported) await handleBanUser(reported, true, r.reason);
                                await handleReportAction(r.id, "resolved");
                              }}>
                              <Ban className="w-3.5 h-3.5 mr-1" /> Ban & Resolve
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground hover:bg-muted"
                              onClick={() => handleReportAction(r.id, "dismissed")}>
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

          {/* Users Tab (Anonymous/Guest Users) */}
          <TabsContent value="users" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-base flex items-center gap-2">
                  <Ghost className="w-4 h-4 text-muted-foreground" />
                  Anonymous Users ({guestUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserTable users={guestUsers} timeAgo={timeAgo} onBan={handleBanUser} onDelete={setDeleteTarget} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Registered Users Tab */}
          <TabsContent value="registered" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-base flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  Registered Users ({registeredUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserTable users={registeredUsers} timeAgo={timeAgo} onBan={handleBanUser} onDelete={setDeleteTarget} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Traffic Analytics Tab */}
          <TabsContent value="traffic" className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard icon={<Eye className="w-5 h-5" />} label="Total Views (7d)" value={trafficStats.totalViews} accent />
              <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Views Today" value={trafficStats.todayViews} />
              <StatCard icon={<Users className="w-5 h-5" />} label="Unique Sessions (7d)" value={trafficStats.uniqueSessions} />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Hourly Traffic Chart */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" /> Hourly Traffic (24h)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-1 h-32">
                    {trafficStats.hourlyData.map((d) => {
                      const maxCount = Math.max(...trafficStats.hourlyData.map(h => h.count), 1);
                      const height = (d.count / maxCount) * 100;
                      return (
                        <div key={d.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div
                            className="w-full bg-primary/80 rounded-t-sm min-h-[2px] transition-all hover:bg-primary"
                            style={{ height: `${Math.max(height, 2)}%` }}
                          />
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-1.5 py-0.5 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {d.hour}: {d.count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[0.6rem] text-muted-foreground">00:00</span>
                    <span className="text-[0.6rem] text-muted-foreground">06:00</span>
                    <span className="text-[0.6rem] text-muted-foreground">12:00</span>
                    <span className="text-[0.6rem] text-muted-foreground">18:00</span>
                    <span className="text-[0.6rem] text-muted-foreground">23:00</span>
                  </div>
                </CardContent>
              </Card>

              {/* Traffic Sources */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" /> Traffic Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trafficStats.topSources.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">No traffic data yet. Start tracking!</p>
                  ) : (
                    <div className="space-y-2">
                      {trafficStats.topSources.map((s, i) => {
                        const maxCount = trafficStats.topSources[0]?.count || 1;
                        const percentage = (s.count / trafficStats.totalViews) * 100;
                        return (
                          <div key={s.source} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <SourceIcon source={s.source} />
                                <span className="text-sm text-foreground">{s.source}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
                                <span className="text-sm font-mono text-foreground font-bold">{s.count}</span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${(s.count / maxCount) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Pages */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-base flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" /> Top Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trafficStats.topPages.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">No page view data yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-left">
                          <th className="pb-3 pr-4">Page</th>
                          <th className="pb-3 pr-4 text-right">Views</th>
                          <th className="pb-3 text-right">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trafficStats.topPages.map(p => (
                          <tr key={p.path} className="border-b border-border/50 last:border-0">
                            <td className="py-2.5 pr-4 text-foreground font-mono text-xs">{p.path}</td>
                            <td className="py-2.5 pr-4 text-right text-foreground font-mono font-bold">{p.count}</td>
                            <td className="py-2.5 text-right text-muted-foreground">
                              {((p.count / trafficStats.totalViews) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Account Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> Delete Account Permanently
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete <strong className="text-foreground">{deleteTarget?.username}</strong>'s
              account, all their messages, chat history, and profile data. This action <strong className="text-destructive">cannot be undone</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs disabled:opacity-50"
            >
              {deleting ? "DELETING..." : "DELETE ACCOUNT"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ---- Sub-components ----

const UserTable = ({
  users, timeAgo, onBan, onDelete,
}: {
  users: UserProfile[];
  timeAgo: (d: string) => string;
  onBan: (u: UserProfile, ban: boolean, reason?: string) => void;
  onDelete: (u: UserProfile) => void;
}) => (
  <div className="overflow-x-auto">
    {users.length === 0 ? (
      <p className="text-muted-foreground text-sm py-8 text-center">No users found.</p>
    ) : (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground text-left">
            <th className="pb-3 pr-4">Username</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 pr-4">Karma</th>
            <th className="pb-3 pr-4">Chats</th>
            <th className="pb-3 pr-4">Joined</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className={`border-b border-border/50 last:border-0 ${u.is_banned ? "opacity-60" : ""}`}>
              <td className="py-3 pr-4 text-foreground font-medium">{u.username}</td>
              <td className="py-3 pr-4">
                {u.is_banned ? (
                  <Badge variant="outline" className="text-xs bg-destructive/15 text-destructive border-destructive/30">Banned</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-green-500/15 text-green-400 border-green-500/30">Active</Badge>
                )}
              </td>
              <td className="py-3 pr-4 text-muted-foreground font-mono">{u.karma}</td>
              <td className="py-3 pr-4 text-muted-foreground font-mono">{u.total_chats}</td>
              <td className="py-3 pr-4 text-muted-foreground">{timeAgo(u.created_at)}</td>
              <td className="py-3">
                <div className="flex gap-1.5">
                  {u.is_banned ? (
                    <Button size="sm" variant="outline" className="text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
                      onClick={() => onBan(u, false)}>
                      Unban
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => onBan(u, true)}>
                      <Ban className="w-3.5 h-3.5 mr-1" /> Ban
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(u)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

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

const SourceIcon = ({ source }: { source: string }) => {
  const s = source.toLowerCase();
  if (s.includes("google")) return <Search className="w-3.5 h-3.5 text-blue-400" />;
  if (s.includes("direct")) return <Monitor className="w-3.5 h-3.5 text-green-400" />;
  if (s.includes("twitter") || s.includes("x.com")) return <ExternalLink className="w-3.5 h-3.5 text-sky-400" />;
  if (s.includes("facebook") || s.includes("instagram")) return <ExternalLink className="w-3.5 h-3.5 text-blue-500" />;
  if (s.includes("reddit")) return <ExternalLink className="w-3.5 h-3.5 text-orange-400" />;
  if (s.includes("mobile")) return <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />;
  return <Globe className="w-3.5 h-3.5 text-muted-foreground" />;
};

function parseReferrerSource(referrer: string | null): string {
  if (!referrer) return "Direct";
  try {
    const url = new URL(referrer);
    const host = url.hostname.replace("www.", "");
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
    if (host.includes("t.co")) return "Twitter/X";
    return host;
  } catch {
    return "Other";
  }
}

export default Admin;
