"use client"

export const ScreenSizeWarning = () => (
    <div className="animate-slide-down fixed top-0 right-0 left-0 z-50 border-b border-[var(--color-warning)]/20 bg-[var(--color-warning)]/10 px-4 py-2 text-center backdrop-blur-sm md:hidden">
        <span className="text-xs font-medium text-[var(--color-warning)]">
            Экран меньше 768px, интерфейс может отображаться некорректно
        </span>
    </div>
)
