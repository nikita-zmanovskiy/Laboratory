"use client"
import { useEffect, useState } from "react"

import { ENTER_ANIMATION_DELAY_MS, EXIT_ANIMATION_DURATION_MS } from "@/shared/config/chat"


export const useAnimatedVisibility = (isVisible: boolean) => {
  const [shouldRender, setShouldRender] = useState(isVisible),
   [isAnimatedIn, setIsAnimatedIn] = useState(false)

  useEffect(() => {
    // тип setTimeout
    let timerId: ReturnType<typeof setTimeout>

    if (isVisible) {
      setShouldRender(true)

      timerId = setTimeout(() => {
        setIsAnimatedIn(true)
      }, ENTER_ANIMATION_DELAY_MS)
    } else {
      setIsAnimatedIn(false)

      timerId = setTimeout(() => {
        setShouldRender(false)
      }, EXIT_ANIMATION_DURATION_MS)
    }

    return () => {
      clearTimeout(timerId)
    }
  }, [isVisible])

  return {
    shouldRender,
    isAnimatedIn,
  }
}