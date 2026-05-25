"use client"

import { useEffect, useState } from "react"

import { formatLessonTime } from "./formatLessonTime"

const ENDING_THRESHOLD_MS = 5 * 60 * 1000

export const useLessonTimer = (expiresAt: string) => {
  const [diffMs, setDiffMs] = useState(0)

  useEffect(() => {
    const updateTimeLeft = () => {
      const endTime = new Date(expiresAt).getTime(),
       currentDiff = endTime - Date.now()

      setDiffMs(Math.max(currentDiff, 0))
    }

    updateTimeLeft()

    const intervalId = setInterval(updateTimeLeft, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [expiresAt])

  const isFinished = diffMs <= 0,
   isEnding = diffMs > 0 && diffMs < ENDING_THRESHOLD_MS

  return {
    timeLeft: isFinished ? "Урок завершен" : formatLessonTime(diffMs),
    isFinished,
    isEnding,
  }
}