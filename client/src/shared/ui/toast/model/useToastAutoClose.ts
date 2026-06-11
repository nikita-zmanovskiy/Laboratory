"use client"

import { useEffect, useState } from "react"

const EXIT_ANIMATION_DURATION_MS = 300

interface UseToastAutoCloseData {
  isOpen: boolean
  duration: number
}

interface UseToastAutoCloseHandlers {
  onClose: () => void
}

type UseToastAutoCloseParams = UseToastAutoCloseData & UseToastAutoCloseHandlers

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