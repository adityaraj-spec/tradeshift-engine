import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AlertCondition = 'crossing' | 'crossing_up' | 'crossing_down' | 'greater_than' | 'less_than';
export type AlertTrigger = 'once' | 'every_time';

export interface Alert {
  id: string;
  symbol: string;
  condition: AlertCondition;
  value: number;
  trigger: AlertTrigger;
  expiration: number;
  message: string;
  active: boolean;
  createdAt: number;
  lastTriggered?: number;
}

interface AlertsState {
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  removeAlert: (id: string) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  toggleAlertActive: (id: string) => void;
  clearTriggered: (id: string) => void;
}

export const useAlerts = create<AlertsState>()(
  persist(
    (set) => ({
      alerts: [],

      addAlert: (alert) =>
        set((state) => ({
          alerts: [alert, ...state.alerts],
        })),

      removeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        })),

      updateAlert: (id, updates) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      toggleAlertActive: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, active: !a.active } : a
          ),
        })),

      clearTriggered: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, lastTriggered: undefined } : a
          ),
        })),
    }),
    {
      name: 'tradeshift-alerts',
    }
  )
);
