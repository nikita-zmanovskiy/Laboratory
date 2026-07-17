"use client"

import { useEffect, useMemo, useState } from "react"

import { APPEAR_DELAY_MS, GENERATING_TEXT, TEXT_CHANGE_DELAY_MS, TEXT_OPACITY_DELAY_MS } from "@/shared/config/message"
import { normalizeImageSrc } from "@/shared/lib/imageUrl"

import type { Message } from "../../types/message"

/**
 * Хук для управления отображением одного сообщения чата
 *
 * Запускает анимацию появления через APPEAR_DELAY_MS после монтирования
 * При изменении текста сообщения сначала скрывает старый текст (opacity 0),
 * затем через TEXT_CHANGE_DELAY_MS обновляет его и через TEXT_OPACITY_DELAY_MS
 * плавно показывает новый текст
 * Для сообщений с текстом GENERATING_TEXT сразу показывает без анимации смены
 * Нормализует путь к сгенерированному изображению через normalizeImageSrc
 *
 * @param message - объект сообщения из entities/chat
 * @returns visible - флаг видимости сообщения (для анимации появления)
 * @returns displayText - текст для отображения с учётом задержки смены
 * @returns textOpacity - флаг прозрачности текста для плавного перехода
 * @returns isUser - флаг сообщения от пользователя
 * @returns isGenerating - флаг состояния генерации ответа
 * @returns generatedImageSrc - нормализованный путь к сгенерированному изображению или null
 */

export const useChatMessage = (message: Message) => {
    const [visible, setVisible] = useState(false),
     [displayText, setDisplayText] = useState(""),
     [textOpacity, setTextOpacity] = useState(false)

    const isUser = message.role === "user",
     isGenerating = !isUser && displayText === GENERATING_TEXT

    const generatedImageSrc = useMemo(() => {
        if (!message.generatedImage) {
            return null
        }

        return normalizeImageSrc(message.generatedImage)
    }, [message.generatedImage])

    useEffect(() => {
        const timerId = setTimeout(() => {
            setVisible(true)
        }, APPEAR_DELAY_MS)

        return () => {
            clearTimeout(timerId)
        }
    }, [])

    useEffect(() => {
        let textTimerId: ReturnType<typeof setTimeout>,
         opacityTimerId: ReturnType<typeof setTimeout>

        if (message.text === GENERATING_TEXT) {
            setDisplayText(GENERATING_TEXT)
            setTextOpacity(true)
            return
        }

        if (message.text) {
            setTextOpacity(false)

            textTimerId = setTimeout(() => {
                setDisplayText(message.text || "")

                opacityTimerId = setTimeout(() => {
                    setTextOpacity(true)
                }, TEXT_OPACITY_DELAY_MS)
            }, TEXT_CHANGE_DELAY_MS)

            return () => {
                clearTimeout(textTimerId)
                clearTimeout(opacityTimerId)
            }
        }

        setDisplayText("")
        setTextOpacity(true)

        return () => {
            clearTimeout(textTimerId)
            clearTimeout(opacityTimerId)
        }
    }, [message.text])

    return {
        visible,
        displayText,
        textOpacity,
        isUser,
        isGenerating,
        generatedImageSrc,
    }
}
