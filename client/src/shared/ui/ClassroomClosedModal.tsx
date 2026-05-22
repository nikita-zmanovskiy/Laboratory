"use client"

interface ClassroomClosedModalProps {
    message: string
    onExit: () => void
}

export const ClassroomClosedModal = ({ message, onExit }: ClassroomClosedModalProps) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-primary)]/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-6 shadow-xl text-center">
            <span className="text-4xl"></span>
            <h3 className="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">Урок завершен</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{message}</p>
            <button
                onClick={onExit}
                className="mt-6 w-full rounded-xl bg-[var(--color-bg-hover)] border border-[var(--color-border-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-hover)]/80"
            >
                Выйти
            </button>
        </div>
    </div>
)