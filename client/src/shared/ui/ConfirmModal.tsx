"use client"

interface ConfirmModalProps {
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    isLoading?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export const ConfirmModal = ({
    title,
    message,
    confirmLabel = "Подтвердить",
    cancelLabel = "Отмена",
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-primary)]/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{message}</p>
            <div className="mt-6 flex gap-3">
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 cursor-pointer rounded-xl border border-[var(--color-border-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] disabled:opacity-50"
                >
                    {cancelLabel}
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 cursor-pointer rounded-xl bg-[var(--color-danger)]/20 border border-[var(--color-danger)]/20 px-4 py-2.5 text-sm font-medium text-[var(--color-text-error)] transition-colors hover:bg-[var(--color-danger)]/30 disabled:opacity-50"
                >
                    {isLoading ? "Завершение..." : confirmLabel}
                </button>
            </div>
        </div>
    </div>
)