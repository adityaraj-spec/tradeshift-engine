import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_INDICATOR_SETTINGS } from '../constants/indicators';
import type { IndicatorId, IndicatorSettingsMap } from '../constants/indicators';

interface IndicatorSettingsState {
  settings: IndicatorSettingsMap;
  setSettings: (settings: IndicatorSettingsMap) => void;
  updateSetting: <T extends IndicatorId>(indicatorId: T, newSettings: Partial<IndicatorSettingsMap[T]>) => void;
  resetToDefault: (indicatorId: IndicatorId) => void;
}

export const useIndicatorSettings = create<IndicatorSettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_INDICATOR_SETTINGS,
      setSettings: (settings) => set({ settings }),
      updateSetting: (indicatorId, newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [indicatorId]: {
              ...state.settings[indicatorId],
              ...newSettings,
            },
          },
        })),
      resetToDefault: (indicatorId) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [indicatorId]: DEFAULT_INDICATOR_SETTINGS[indicatorId],
          },
        })),
    }),
    {
      name: 'indicator-settings-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        let state = persistedState;
        if (version === 0) {
          state = {
            ...state,
            settings: {
              ...state.settings,
              BB: DEFAULT_INDICATOR_SETTINGS.BB,
            },
          };
        }
        if (version < 2) {
          state = {
            ...state,
            settings: {
              ...state.settings,
              RSI: DEFAULT_INDICATOR_SETTINGS.RSI,
            },
          };
        }
        if (version < 3) {
          state = {
            ...state,
            settings: {
              ...state.settings,
              MACD: DEFAULT_INDICATOR_SETTINGS.MACD,
            },
          };
        }
        return state;
      },
    }
  )
);
