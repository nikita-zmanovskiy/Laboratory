"use client"

import { useEffect, useState } from "react"

/**
 * Хук для автоматического закрытия уведомления с анимацией выхода
 *
 * Запускает таймер на duration мс, по истечении которого
 * устанавливает isLeaving = true (начало анимации выхода)
 * Ещё через EXIT_ANIMATION_DURATION_MS вызывает onClose - удаление из DOM
 *
 * @param duration - длительность показа до начала анимации выхода (мс)
 * @param onClose - колбэк, вызываемый после завершения анимации выхода
 * @returns isLeaving - флаг анимации выхода
 */

const EXIT_ANIMATION_DURATION_MS = 300

interface UseNotificationToastData {
  duration: number
}

interface UseNotificationToastHandlers {
  onClose: () => void
}

type UseNotificationToastParams = UseNotificationToastData & UseNotificationToastHandlers

export const useNotificationToast = ({
  duration,
  onClose,
}: UseNotificationToastParams) => {
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const leaveTimerId = setTimeout(() => {
      setIsLeaving(true)
    }, duration)

    const closeTimerId = setTimeout(() => {
      onClose()
    }, duration + EXIT_ANIMATION_DURATION_MS)

    return () => {
      clearTimeout(leaveTimerId)
      clearTimeout(closeTimerId)
    }
  }, [duration, onClose])

  return {
    isLeaving,
  }
}