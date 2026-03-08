import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type Profile = {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  karma: number;
  total_chats: number;
  is_guest: boolean;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (username: string, email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (usernameOrEmail: string, password: string) => Promise<{ error: string | null }>;
  signInAnonymously: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
  updateProfile: (updates: { username?: string }) => Promise<{ error: string | null }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data as Profile | null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .limit(1);
    if (error) return false;
    return !data || data.length === 0;
  };

  const signUp = async (username: string, email: string, password: string) => {
    // Check username availability first
    const available = await checkUsernameAvailable(username);
    if (!available) return { error: "Username is already taken. Please choose another." };

    const authEmail = email || `${username.toLowerCase().replace(/[^a-z0-9_]/g, '')}@specterchat.ghost`;
    
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        data: { username },
        emailRedirectTo: window.location.origin,
      },
    });
    
    if (error) {
      if (error.message.includes("already registered") || error.message.includes("already been registered")) {
        return { error: "An account with this email already exists. Please sign in instead." };
      }
      return { error: error.message };
    }

    // If user was returned but no session, it means email confirmation is required
    // but for ghost emails we should have auto-confirm
    if (data.user && !data.session) {
      return { error: "Please check your email to confirm your account." };
    }

    return { error: null };
  };

  const signIn = async (usernameOrEmail: string, password: string) => {
    let email: string;

    if (usernameOrEmail.includes("@")) {
      // User entered an email directly
      email = usernameOrEmail;
    } else {
      // Look up email by username using our DB function
      const { data, error } = await supabase.rpc("get_email_by_username", {
        _username: usernameOrEmail,
      });
      
      if (error || !data) {
        return { error: "No account found with that username. Please check and try again." };
      }
      email = data as string;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        return { error: "Incorrect password. Please try again." };
      }
      return { error: error.message };
    }
    return { error: null };
  };

  const signInAnonymously = async () => {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: { username?: string }) => {
    if (!user) return { error: "Not logged in" };
    
    if (updates.username) {
      const available = await checkUsernameAvailable(updates.username);
      if (!available) return { error: "Username is already taken." };
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);
    
    if (error) return { error: error.message };
    await refreshProfile();
    return { error: null };
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    // Re-authenticate with current password first
    const email = user?.email;
    if (!email) return { error: "No email found for this account" };
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (signInError) return { error: "Current password is incorrect" };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, signUp, signIn, signInAnonymously, signOut, refreshProfile, checkUsernameAvailable, updateProfile, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};
