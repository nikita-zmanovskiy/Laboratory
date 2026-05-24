"use client"

import { useEffect, useState } from "react"

const EXIT_ANIMATION_DURATION_MS = 300

interface UseToastAutoCloseParams {
  isOpen: boolean
  duration: number
  onClose: () => void
}

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