import { create } from 'zustand';

export interface MembershipPackage {
  id?: number;
  name?: string;
  current_price?: number;
  original_price?: number;
  points_per_month?: number;
  enable_countdown?: boolean;
  countdown_deadline?: string;
  features?: string[];
}

export interface PointsTopupPackage {
  id?: string;
  points?: number;
  price?: number;
}


export interface GlobalSettings {
  banner_enabled: boolean;
  banner_text: string;
  banner_highlight_tag: string;
  banner_discount_text: string;
  banner_countdown_end: string | null;
  cs_qrcode_url: string;
  cs_wechat_id: string;
  membership_packages: MembershipPackage[];
  points_topup_packages: PointsTopupPackage[];
}

interface SettingsState {
  settings: GlobalSettings | null;
  setSettings: (settings: GlobalSettings | null) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
}));
