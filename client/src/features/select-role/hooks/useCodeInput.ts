"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

import { CODE_LENGTH, MESSAGE_ANIMATION_DELAY_MS } from "@/shared/config/codeInput";



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


/**
 * Хук для управления полем ввода кода класса
 *
 * Нормализует ввод: приводит к верхнему регистру, удаляет недопустимые символы,
 * ограничивает длину до CODE_LENGTH
 * Управляет анимацией появления/исчезновения ошибки и подсказки
 * с задержкой MESSAGE_ANIMATION_DELAY_MS для плавного перехода
 * Поддерживает отправку по Enter когда код заполнен полностью и нет загрузки
 * Блокирует фокус на инпуте во время загрузки
 *
 * @param code - текущее значение кода
 * @param error - текст ошибки или null
 * @param isLoading - флаг загрузки
 * @param onCodeChange - колбэк изменения кода
 * @param onSubmit - колбэк отправки кода
 * @returns inputRef - реф на input элемент
 * @returns visibleError - отображаемая ошибка с задержкой для анимации
 * @returns showHint - флаг показа подсказки
 * @returns isFocused - флаг фокуса на инпуте
 * @returns setIsFocused - сеттер фокуса
 * @returns focusInput - функция установки фокуса на инпут
 * @returns handleCodeChange - обработчик изменения значения
 * @returns handleKeyDown - обработчик нажатия клавиш
 * @returns codeLength - максимальная длина кода
 */

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