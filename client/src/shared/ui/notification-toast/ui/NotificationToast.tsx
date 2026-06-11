"use client"

import { useNotificationToast } from "../model/useNotificationToast"

interface NotificationToastData {
  message: string
  duration?: number
}

interface NotificationToastHandlers {
  onClose: () => void
}

type NotificationToastProps = NotificationToastData & NotificationToastHandlers

export const NotificationToast = ({
  message,
  duration = 5000,
  onClose,
}: NotificationToastProps) => {
  const { isLeaving } = useNotificationToast({
    duration,
    onClose,
  })

  return (
    <div
      className={`fixed top-4 left-4 z-50 transition-all duration-300 ${
        isLeaving
          ? "translate-x-[-100%] opacity-0"
          : "translate-x-0 opacity-100"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-xl border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/10 px-4 py-3 shadow-lg backdrop-blur-sm">
        <p className="text-sm font-medium text-[var(--color-warning)]">
          {message}
        </p>
      </div>
    </div>
  )
}