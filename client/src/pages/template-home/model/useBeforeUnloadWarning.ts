"use client"

import { useEffect } from "react"

interface UseBeforeUnloadWarningParams {
  enabled: boolean
}

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