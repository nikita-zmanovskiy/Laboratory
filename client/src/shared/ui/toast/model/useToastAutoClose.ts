"use client"

import { useEffect, useState } from "react"

import { EXIT_ANIMATION_DURATION_MS } from "../../../config/chat"



interface UseToastAutoCloseData {
  isOpen: boolean
  duration: number
}

interface UseToastAutoCloseHandlers {
  onClose: () => void
}

type UseToastAutoCloseParams = UseToastAutoCloseData & UseToastAutoCloseHandlers


/**
 * Хук для автоматического закрытия тоста с анимацией выхода
 *
 * Сначала запускает таймер на duration мс, по истечении которого
 * устанавливает isLeaving = true (начало анимации выхода)
 * Ещё через EXIT_ANIMATION_DURATION_MS вызывает onClose - фактическое удаление из DOM
 *
 * @param isOpen - открыт ли тост
 * @param duration - длительность показа до начала анимации выхода (мс)
 * @param onClose - колбэк, вызываемый после завершения анимации выхода
 * @returns isLeaving - флаг анимации выхода, startLeaving - принудительный запуск анимации
 */

export const useToastAutoClose = ({
  isOpen,
  duration,
  onClose,
}: UseToastAutoCloseParams) => {
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setIsLeaving(false)

    const leaveTimerId = setTimeout(() => {
      setIsLeaving(true)
    }, duration)

    const closeTimerId = setTimeout(() => {
      onClose()
    }, duration + EXIT_ANIMATION_DURATION_MS)

    return () => {
      clearTimeout(leaveTimerId)
      clearTimeout(closeTimerId)
    };
  }, [isOpen, duration, onClose])

  return {
    isLeaving,
    startLeaving: () => setIsLeaving(true),
  }
}