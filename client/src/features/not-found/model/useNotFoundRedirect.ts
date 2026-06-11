"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export const useNotFoundRedirect = (delay = 0) => {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/")  // replace, чтобы не оставлять страницу в истории
    }, delay)

    return () => clearTimeout(timer)
  }, [router, delay])
}