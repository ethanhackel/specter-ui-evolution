import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, LogOut, Check, Ghost, MessageSquare, Star, Mail, Trash2, AlertTriangle } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
import maleGhost from "@/assets/avatars/male-ghost.png";
import femaleGhost from "@/assets/avatars/female-ghost.png";

const AVATAR_OPTIONS = [
  { key: "male-ghost", src: maleGhost, label: "Male Ghost" },
  { key: "female-ghost", src: femaleGhost, label: "Female Ghost" },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut, updateProfile, updatePassword, checkUsernameAvailable } = useAuth();

  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) setUsername(profile.username);
  }, [profile]);

  // Debounced username check
  useEffect(() => {
    if (!profile || username === profile.username || username.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const available = await checkUsernameAvailable(username);
      setUsernameStatus(available ? "available" : "taken");
    }, 500);
    return () => clearTimeout(timer);
  }, [username, profile, checkUsernameAvailable]);

  const handleSaveUsername = async () => {
    if (!profile || username === profile.username) return;
    if (username.length < 3 || username.length > 30) {
      toast({ title: "Username must be 3-30 characters", variant: "destructive" });
      return;
    }
    if (usernameStatus === "taken") {
      toast({ title: "Username is already taken", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({ username });
    setSaving(false);
    if (error) {
      toast({ title: error, variant: "destructive" });
    } else {
      toast({ title: "Username updated!" });
      setUsernameStatus("idle");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast({ title: "Enter your current password", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "New password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await updatePassword(currentPassword, newPassword);
    setSaving(false);
    if (error) {
      toast({ title: error, variant: "destructive" });
    } else {
      toast({ title: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const { error } = await supabase.rpc("delete_own_account");
      if (error) throw error;
      toast({ title: "Account deleted permanently." });
      await signOut();
      navigate("/");
    } catch (err: any) {
      toast({ title: err.message || "Failed to delete account", variant: "destructive" });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeleteConfirmText("");
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isGuest = profile.is_guest;
  const email = user?.email || "";
  const isGhostEmail = email.endsWith("@specterchat.ghost");

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 relative">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(hsl(0 72% 51% / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(0 72% 51% / 0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="glass-card w-full max-w-md md:max-w-lg p-6 sm:p-8 md:p-10 relative z-10" style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 60px hsl(0 72% 51% / 0.05)" }}>
        <Link to="/chat" className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-mono tracking-wider">Back to Chat</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-6 mt-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
            {isGuest ? <Ghost className="w-7 h-7 sm:w-8 sm:h-8 text-primary" /> : <User className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />}
          </div>
          <h1 className="font-heading font-black text-lg sm:text-xl tracking-widest">
            <span className="text-gradient">MY</span> <span className="text-foreground">PROFILE</span>
          </h1>
          {isGuest && (
            <p className="text-xs text-muted-foreground mt-1">Guest Account</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-5 sm:mb-6">
          <div className="glass-card p-2.5 sm:p-3 text-center rounded-lg">
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mx-auto mb-1" />
            <p className="text-base sm:text-lg font-bold text-foreground">{profile.total_chats}</p>
            <p className="text-[0.6rem] sm:text-[0.65rem] text-muted-foreground font-mono tracking-wider">TOTAL CHATS</p>
          </div>
          <div className="glass-card p-2.5 sm:p-3 text-center rounded-lg">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 mx-auto mb-1" />
            <p className="text-base sm:text-lg font-bold text-foreground">{profile.karma}</p>
            <p className="text-[0.6rem] sm:text-[0.65rem] text-muted-foreground font-mono tracking-wider">KARMA</p>
          </div>
        </div>

        {/* Username section */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="text-[0.65rem] sm:text-xs font-mono tracking-[0.2em] text-muted-foreground">USERNAME</span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={30}
                  className="w-full bg-secondary border border-border rounded px-3 sm:px-4 py-2.5 sm:py-3 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
                />
                {usernameStatus === "checking" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] sm:text-xs text-muted-foreground">checking...</span>
                )}
                {usernameStatus === "available" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] sm:text-xs text-emerald-500 flex items-center gap-1"><Check className="w-3 h-3" /> available</span>
                )}
                {usernameStatus === "taken" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] sm:text-xs text-destructive">taken</span>
                )}
              </div>
              <button
                onClick={handleSaveUsername}
                disabled={saving || username === profile.username || usernameStatus === "taken" || username.length < 3}
                className="px-3 sm:px-4 py-2.5 sm:py-3 rounded bg-primary text-primary-foreground text-xs font-bold tracking-wider disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
              >
                Save
              </button>
            </div>
          </div>

          {/* Email display */}
          {!isGhostEmail && (
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-[0.65rem] sm:text-xs font-mono tracking-[0.2em] text-muted-foreground">EMAIL</span>
              </div>
              <input
                type="text"
                value={email}
                disabled
                className="w-full bg-secondary/50 border border-border rounded px-3 sm:px-4 py-2.5 sm:py-3 text-muted-foreground text-sm cursor-not-allowed"
              />
            </div>
          )}

          {/* Change password */}
          {!isGuest && (
            <div className="border-t border-border pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-[0.65rem] sm:text-xs font-mono tracking-[0.2em] text-muted-foreground">CHANGE PASSWORD</span>
              </div>
              <div className="space-y-3">
                <PasswordInput
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                />
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                />
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                <button
                  onClick={handleChangePassword}
                  disabled={saving || !newPassword}
                  className="w-full py-2.5 sm:py-3 rounded bg-secondary border border-border text-foreground text-xs font-bold tracking-wider disabled:opacity-50 hover:border-primary/40 active:scale-[0.98] transition-all"
                >
                  {saving ? "UPDATING..." : "UPDATE PASSWORD"}
                </button>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-2.5 sm:py-3 rounded glass-card border-destructive/30 text-destructive font-heading font-bold text-xs tracking-widest uppercase hover:bg-destructive/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
          >
            <LogOut className="w-4 h-4" /> SIGN OUT
          </button>

          {/* Delete Account */}
          <div className="border-t border-border pt-4 mt-2">
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full py-2.5 sm:py-3 rounded border border-destructive/40 bg-destructive/5 text-destructive font-heading font-bold text-xs tracking-widest uppercase hover:bg-destructive/15 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> DELETE ACCOUNT
            </button>
            <p className="text-[0.6rem] text-muted-foreground text-center mt-2">This action is permanent and cannot be undone.</p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-card border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Delete Account Permanently
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm space-y-3">
              <span className="block">This will permanently delete your account, all your messages, chat history, and profile data. This action <strong className="text-destructive">cannot be undone</strong>.</span>
              <span className="block text-xs">Type <strong className="text-foreground">DELETE</strong> below to confirm:</span>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full bg-secondary border border-border rounded px-3 py-2 text-foreground text-sm outline-none focus:border-destructive focus:ring-2 focus:ring-destructive/10 placeholder:text-muted-foreground/50"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText("")} className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE" || deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs disabled:opacity-50"
            >
              {deleting ? "DELETING..." : "DELETE MY ACCOUNT"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
