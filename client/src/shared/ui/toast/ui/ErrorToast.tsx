"use client";

import { useEffect, useState } from "react";

import { useToastAutoClose } from "../model/useToastAutoClose";

interface ErrorToastData {
  message: string | null
  duration?: number
}

interface ErrorToastHandlers {
  onClose: () => void
}

type ErrorToastProps = ErrorToastData & ErrorToastHandlers

export const ErrorToast = ({
  message,
  duration = 10000,
  onClose,
}: ErrorToastProps) => {
  const [entered, setEntered] = useState(false),
   { isLeaving } = useToastAutoClose({
    isOpen: Boolean(message),
    duration,
    onClose,
  });

  useEffect(() => {
    if (!message) {
      setEntered(false)
      return
    }

    const timerId = setTimeout(() => setEntered(true), 10)

    return () => clearTimeout(timerId)
  }, [message])

  if (!message) {
    return null;
  }

  const isVisible = entered && !isLeaving

  return (
    <div
      className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-[-100%] opacity-0"
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3 rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/10 px-4 py-3 shadow-lg backdrop-blur-sm">
        <span className="text-sm font-medium text-[var(--color-text-error)]">
          {message}
        </span>

        <button
          type="button"
          onClick={onClose}
          className="text-[var(--color-text-error)] hover:text-[var(--color-danger)]"
          aria-label="Закрыть уведомление об ошибке"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
