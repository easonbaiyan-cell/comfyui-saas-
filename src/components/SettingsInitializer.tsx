'use client';

import { useEffect, useRef } from 'react';
import { useSettingsStore, GlobalSettings } from '@/store/settings';

export function SettingsInitializer({ settings }: { settings: GlobalSettings | null }) {
  const initialized = useRef(false);

  // Set synchronously on the first render to avoid flashing
  if (!initialized.current) {
    useSettingsStore.setState({ settings });
    initialized.current = true;
  }

  // Allow for hot reloads or future props changes
  useEffect(() => {
    useSettingsStore.setState({ settings });
  }, [settings]);

  return null;
}
