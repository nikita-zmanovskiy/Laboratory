"use client"

import { useOverlayAnimation } from "../lib/useOverlayAnimation"

interface ClassroomClosedModalData {
    message: string
}

interface ClassroomClosedModalHandlers {
    onExit: () => void
}

type ClassroomClosedModalProps = ClassroomClosedModalData & ClassroomClosedModalHandlers

export const ClassroomClosedModal = ({ message, onExit }: ClassroomClosedModalProps) => {
    const { isShown, runClose } = useOverlayAnimation()

    return (
        <div
            className={`modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-primary)]/70 p-4 backdrop-blur-sm ${
                isShown ? "modal-overlay--visible" : "modal-overlay--hidden"
            }`}
        >
            <div
                className={`modal-content w-full max-w-sm rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-6 text-center shadow-xl ${
                    isShown ? "modal-content--visible" : "modal-content--hidden"
                }`}
            >
                <span className="text-4xl"></span>
                <h3 className="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">Урок завершен</h3>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{message}</p>
                <button
                    onClick={() => runClose(onExit)}
                    className="mt-6 w-full cursor-pointer rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-hover)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-hover)]/80"
                >
                    Выйти
                </button>
            </div>
        </div>
    )
}
