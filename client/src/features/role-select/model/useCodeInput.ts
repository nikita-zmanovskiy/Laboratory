"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

const CODE_LENGTH = 6,
 MESSAGE_ANIMATION_DELAY_MS = 200

 interface UseCodeInputData {
  code: string
  error: string | null
  isLoading: boolean
}

interface UseCodeInputHandlers {
  onCodeChange: (value: string) => void
  onSubmit: () => void
}

type UseCodeInputParams = UseCodeInputData & UseCodeInputHandlers

export const useCodeInput = ({
  code,
  error,
  isLoading,
  onCodeChange,
  onSubmit,
}: UseCodeInputParams) => {
  const [visibleError, setVisibleError] = useState<string | null>(null),
   [showHint, setShowHint] = useState(true),
   [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>

    if (error) {
      setShowHint(false)

      timerId = setTimeout(() => {
        setVisibleError(error)
      }, MESSAGE_ANIMATION_DELAY_MS)
    } else if (visibleError) {
      setVisibleError(null)

      timerId = setTimeout(() => {
        setShowHint(true)
      }, MESSAGE_ANIMATION_DELAY_MS)
    } else {
      setShowHint(true)
    }

    return () => {
      clearTimeout(timerId)
    };
  }, [error, visibleError])

  const focusInput = () => {
    if (isLoading) {
      return
    }

    inputRef.current?.focus()
  }

  const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const normalizedCode = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, CODE_LENGTH)

    onCodeChange(normalizedCode)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && code.length === CODE_LENGTH && !isLoading) {
      onSubmit()
    }
  }

  return {
    inputRef,
    visibleError,
    showHint,
    isFocused,
    setIsFocused,
    focusInput,
    handleCodeChange,
    handleKeyDown,
    codeLength: CODE_LENGTH,
  }
}