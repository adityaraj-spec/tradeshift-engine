import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

// Apply the theme class immediately before React hydrates
// This eliminates the flash of wrong theme on page load
const applyThemeToDOM = (theme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
};

// Read persisted theme from localStorage synchronously and apply immediately
// So there is zero flash — the correct class is present before first paint
const getInitialTheme = (): Theme => {
    try {
        const stored = localStorage.getItem('trade-sim-theme');
        if (stored) {
            const parsed = JSON.parse(stored);
            const savedTheme = parsed?.state?.theme as Theme;
            if (savedTheme === 'light' || savedTheme === 'dark') {
                applyThemeToDOM(savedTheme);
                return savedTheme;
            }
        }
    } catch {
        // If parsing fails, fall through to default
    }
    applyThemeToDOM('dark');
    return 'dark';
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: getInitialTheme(),
            toggleTheme: () =>
                set((state) => {
                    const newTheme = state.theme === 'light' ? 'dark' : 'light';
                    applyThemeToDOM(newTheme);
                    return { theme: newTheme };
                }),
            setTheme: (theme) => {
                applyThemeToDOM(theme);
                set({ theme });
            },
        }),
        {
            name: 'trade-sim-theme',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    applyThemeToDOM(state.theme);
                }
            },
        }
    )
);
