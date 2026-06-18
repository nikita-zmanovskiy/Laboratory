import { HOUR_MS, MINUTE_MS } from "../../../config/lesson"


export const formatLessonTime = (diffMs: number) => {
  const hours = Math.floor(diffMs / HOUR_MS),
   minutes = Math.floor((diffMs % HOUR_MS) / MINUTE_MS),
   seconds = Math.floor((diffMs % MINUTE_MS) / 1000)

  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  }

  if (minutes > 0) {
    return `${minutes}м ${seconds}с`
  }

  return `${seconds}с`
}