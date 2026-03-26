/**
 * ThemeContext — thin bridge so that SettingsPage (which uses useTheme)
 * and Header (which uses useThemeStore) both read/write the SAME store.
 *
 * All state lives in themeStore (Zustand + persist). This context just
 * adapts the "system" option from SettingsPage: when the user picks
 * "system" we resolve it to the OS preference and forward it to the store.
 */
import { createContext, useContext } from "react";
import { useThemeStore } from "../store/themeStore";

type Theme = "dark" | "light" | "system";

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState>({
    theme: "dark",
    setTheme: () => null,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useThemeStore();

    const handleSetTheme = (t: Theme) => {
        if (t === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
            setTheme(systemTheme);
        } else {
            setTheme(t);
        }
    };

    return (
        <ThemeProviderContext.Provider value={{ theme, setTheme: handleSetTheme }}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};
