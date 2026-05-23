"use client"

import { useTheme } from "./useTheme"

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className="cursor-pointer rounded-xl border border-[var(--color-border-primary)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
            title={theme === "dark" ? "Светлая тема" : "Темная тема"}
        >
            {theme === "dark" ? "светлая" : "темная"}
        </button>
    )
}