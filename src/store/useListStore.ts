import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserProfileSummary } from "@/types";

interface ListStore {
  selectedProfiles: UserProfileSummary[];
  addProfile: (profile: UserProfileSummary) => void;
  removeProfile: (username: string) => void;
  clearProfiles: () => void;
  isSelected: (username: string) => boolean;
}

export const useListStore = create<ListStore>()(
  persist(
    (set, get) => ({
      selectedProfiles: [],
      addProfile: (profile) => {
        const { selectedProfiles } = get();
        const username = profile.username || profile.handle || profile.custom_name || "";
        if (!username) return;
        
        const isAlreadyAdded = selectedProfiles.some(
          (p) =>
            (p.username || p.handle || p.custom_name || "").toLowerCase() === username.toLowerCase()
        );
        if (isAlreadyAdded) return;

        set({ selectedProfiles: [...selectedProfiles, profile] });
      },
      removeProfile: (username) => {
        if (!username) return;
        const { selectedProfiles } = get();
        set({
          selectedProfiles: selectedProfiles.filter(
            (p) =>
              (p.username || p.handle || p.custom_name || "").toLowerCase() !== username.toLowerCase()
          ),
        });
      },
      clearProfiles: () => set({ selectedProfiles: [] }),
      isSelected: (username) => {
        if (!username) return false;
        const { selectedProfiles } = get();
        return selectedProfiles.some(
          (p) =>
            (p.username || p.handle || p.custom_name || "").toLowerCase() === username.toLowerCase()
        );
      },
    }),
    {
      name: "influo-selected-profiles",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
