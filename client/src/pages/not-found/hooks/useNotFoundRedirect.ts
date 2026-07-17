"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
/**
 * Хук для автоматического редиректа с 404 страницы на главную
 *
 * При монтировании запускает таймер на delay мс
 * По истечении времени выполняет router.replace на home
 * replace используется чтобы не оставлять 404 страницу в истории браузера
 *
 * @param delay - задержка перед редиректом в миллисекундах (по умолчанию 0)
 */

export const useNotFoundRedirect = (delay = 0) => {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/")  // replace, чтобы не оставлять страницу в истории
    }, delay)

    return () => clearTimeout(timer)
  }, [router, delay])
}