"use client"

import { useEffect, useState } from "react"

import { ENDING_THRESHOLD_MS } from "../../../config/lesson"

import { formatLessonTime } from "./formatLessonTime"


/**
 * Хук для отображения оставшегося времени урока
 *
 * Вычисляет разницу между expiresAt и текущим временем
 * Обновляет счётчик каждую секунду
 * Возвращает отформатированное время, флаг завершения и флаг скорого окончания
 *
 * @param expiresAt - дата и время окончания урока в формате ISO строки
 * @returns timeLeft - отформатированная строка оставшегося времени или "Урок завершен"
 * @returns isFinished - флаг завершения урока (время вышло)
 * @returns isEnding - флаг скорого окончания (меньше ENDING_THRESHOLD_MS мс)
 */



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