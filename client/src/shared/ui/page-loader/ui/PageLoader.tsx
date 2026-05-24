"use client"

import { usePageLoader } from "../model/usePageLoader"

export const PageLoader = () => {
  const { visible, fadeOut } = usePageLoader()

  if (!visible) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-bg-loader)] transition duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Загрузка страницы"
    >
      <div className="flex items-center gap-4">
        <div className="relative h-7 w-7" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--color-border-primary)]" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--color-text-primary)]" />
        </div>

        <p className="text-sm font-medium text-[var(--color-text-muted)]">
          Загрузка...
        </p>
      </div>
    </div>
  )
}