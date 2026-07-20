import { create } from 'zustand';

export interface GlobalSettings {
  banner_enabled: boolean;
  banner_text: string;
  banner_highlight_tag: string;
  banner_discount_text: string;
  banner_countdown_end: string | null;
  cs_qrcode_url: string;
  cs_wechat_id: string;
  membership_packages: any[];
  points_topup_packages: any[];
}

interface SettingsState {
  settings: GlobalSettings | null;
  setSettings: (settings: GlobalSettings | null) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
}));
