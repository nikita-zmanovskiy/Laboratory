"use client"

import { useCallback, useEffect, useState } from "react"

import { ENTER_DELAY_MS, OVERLAY_EXIT_DURATION_MS } from "../config/overlay"

/**
 * Хук для анимации появления и закрытия оверлея
 *
 * При монтировании запускает таймер на ENTER_DELAY_MS мс затем устанавливает visible = true
 * При закрытии через runClose устанавливает closing = true и через OVERLAY_EXIT_DURATION_MS
 * вызывает переданный колбэк
 *
 * @returns visible - флаг видимости оверлея в DOM
 * @returns closing - флаг анимации закрытия
 * @returns isShown - флаг полной видимости (visible && !closing)
 * @returns runClose - функция запуска анимации закрытия с колбэком по завершении
 */



export const useOverlayAnimation = () => {
    const [visible, setVisible] = useState(false),
     [closing, setClosing] = useState(false)

    useEffect(() => {
        const timerId = setTimeout(() => setVisible(true), ENTER_DELAY_MS)

        return () => {
            clearTimeout(timerId)
            setVisible(false)
        }
    }, [])

    const runClose = useCallback((callback: () => void) => {
        setClosing(true)
        setTimeout(callback, OVERLAY_EXIT_DURATION_MS)
    }, [])

    const isShown = visible && !closing

    return {
        visible,
        closing,
        isShown,
        runClose,
    }
}
