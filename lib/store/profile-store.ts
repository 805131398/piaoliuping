import { create } from "zustand";
import { User } from "next-auth";

interface ProfileState {
  profile: User | null;
  provider: string | null;
  loading: boolean;
  loaded: boolean;
  fetchProfile: () => Promise<void>;
  setProfile: (profile: User | null, provider: string | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  provider: null,
  loading: false,
  loaded: false,
  fetchProfile: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        set({ profile: data, provider: data.provider, loading: false, loaded: true });
      } else {
        set({ loading: false, loaded: true });
      }
    } catch {
      set({ loading: false, loaded: true });
    }
  },
  setProfile: (profile, provider) => set({ profile, provider }),
})); 