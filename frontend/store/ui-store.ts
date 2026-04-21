"use client";

import { create } from "zustand";

type QuickAction = "workout" | "meal" | null;

type UiStore = {
  isSidebarOpen: boolean;
  quickAction: QuickAction;
  toggleSidebar: () => void;
  openQuickAction: (action: Exclude<QuickAction, null>) => void;
  closeQuickAction: () => void;
};

export const useUiStore = create<UiStore>((set) => ({
  isSidebarOpen: true,
  quickAction: null,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openQuickAction: (action) => set({ quickAction: action }),
  closeQuickAction: () => set({ quickAction: null }),
}));
