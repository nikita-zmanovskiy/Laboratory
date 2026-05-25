"use client"

import { useLessonTimer } from "../model/useLessonTimer"

interface LessonTimerProps {
  expiresAt: string
}

export const LessonTimer = ({ expiresAt }: LessonTimerProps) => {
  const { timeLeft, isFinished, isEnding } = useLessonTimer(expiresAt)

  return (
    <span
      className={`flex items-center gap-1.5 text-xs font-medium ${
        isFinished
          ? "text-[var(--color-text-error)]"
          : isEnding
            ? "text-[var(--color-warning)]"
            : "text-[var(--color-text-success)]"
      }`}
      aria-live="polite"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isFinished
            ? "bg-[var(--color-danger)]"
            : isEnding
              ? "animate-pulse bg-[var(--color-warning)]"
              : "animate-pulse bg-[var(--color-success)]"
        }`}
        aria-hidden="true"
      />

      {isFinished ? "Урок завершен" : `Урок идет: ${timeLeft}`}
    </span>
  )
}