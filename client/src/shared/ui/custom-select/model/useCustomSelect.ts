"use client"

import { useEffect, useRef, useState } from "react"

const CLOSE_ANIMATION_DURATION_MS = 150

interface UseCustomSelectParams<T extends string | number> {
  value: T
  options: Array<{
    label: string
    value: T
  }>
  disabled: boolean
  onChange: (value: T) => void
}

export const useCustomSelect = <T extends string | number>({
  value,
  options,
  disabled,
  onChange,
}: UseCustomSelectParams<T>) => {
  const [open, setOpen] = useState(false),
   [closing, setClosing] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null),
   closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selected = options.find((option) => option.value === value)

  const close = () => {
    if (!open || closing) {
      return
    }

    setClosing(true)

    closeTimerRef.current = setTimeout(() => {
      setOpen(false)
      setClosing(false)
      closeTimerRef.current = null
    }, CLOSE_ANIMATION_DURATION_MS)
  }

  const toggle = () => {
    if (disabled) {
      return
    }

    if (open) {
      close()
      return
    }

    setOpen(true)
  }

  const selectOption = (nextValue: T) => {
    onChange(nextValue)
    close()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [open, closing])

  return {
    rootRef,
    open,
    closing,
    selected,
    toggle,
    selectOption,
  }
}