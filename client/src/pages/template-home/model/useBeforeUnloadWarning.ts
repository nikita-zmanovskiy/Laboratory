"use client"

import { useEffect } from "react"

interface UseBeforeUnloadWarningParams {
  enabled: boolean
}
/**
 * Хук для предупреждения пользователя перед уходом со страницы
 *
 * При enabled = true перехватывает событие beforeunload
 * Браузер показывает стандартный диалог подтверждения ухода
 * При enabled = false или размонтировании удаляет обработчик
 *
 * @param enabled - флаг активации предупреждения
 */

export const useBeforeUnloadWarning = ({
  enabled,
}: UseBeforeUnloadWarningParams) => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!enabled) {
        return
      }

      event.preventDefault()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [enabled])
}