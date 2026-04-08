import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types";

interface ProfileState {
  profile: Profile | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateSalary: (userId: string, salary: number) => Promise<string | null>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,

  fetchProfile: async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    set({ profile: data ?? null });
  },

  updateSalary: async (userId, salary) => {
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, salary })
      .eq("id", userId);
    if (!error) set((s) => ({ profile: s.profile ? { ...s.profile, salary } : null }));
    return error?.message ?? null;
  },
}));
