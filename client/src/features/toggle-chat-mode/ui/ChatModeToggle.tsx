interface ChatModeToggleProps {
    isTextMode: boolean
    isLoading: boolean
    disabled: boolean
    onSetText: () => void
    onSetImage: () => void
}

export const ChatModeToggle = ({
    isTextMode,
    isLoading,
    disabled,
    onSetText,
    onSetImage,
}: ChatModeToggleProps) => (
    <div className={`user-select-none relative flex h-11 w-[280px] rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] p-1 ${disabled ? "pointer-events-none opacity-50 select-none" : ""}`}>
        <div
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg shadow-md transition-all duration-300 ease-out ${
                isTextMode
                    ? isLoading ? "translate-x-0 bg-[#b43f5c]" : "translate-x-0 bg-[#9a2e49]"
                    : isLoading ? "translate-x-full bg-[#4575c2]" : "translate-x-full bg-[#2158b0]"
            }`}
        />
        <button type="button" onClick={onSetText} disabled={isLoading}
            className={`relative z-1 flex flex-1 items-center justify-center text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed ${isTextMode ? "text-[var(--color-text-primary)]/90" : "cursor-pointer text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"}`}>
            Текст
        </button>
        <button type="button" onClick={onSetImage} disabled={isLoading}
            className={`relative z-1 flex flex-1 items-center justify-center text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed ${!isTextMode ? "text-[var(--color-text-primary)]/90" : "cursor-pointer text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"}`}>
            Изображение
        </button>
    </div>
)