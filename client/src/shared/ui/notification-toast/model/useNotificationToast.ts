"use client"

import { useEffect, useState } from "react"

const EXIT_ANIMATION_DURATION_MS = 300

interface UseNotificationToastParams {
  duration: number
  onClose: () => void
}

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