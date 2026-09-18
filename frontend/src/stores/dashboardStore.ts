import { create } from "zustand";
import { BRAND_CONFIG } from "@/config/brand";
import type { Period } from "@/types/api.types";

interface DashboardStore {
  period: Period;
  setPeriod: (period: Period) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  period: BRAND_CONFIG.defaultPeriod as Period,
  setPeriod: (period) => set({ period }),
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
