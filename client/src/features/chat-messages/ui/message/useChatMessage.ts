"use client"

import { useEffect, useMemo, useState } from "react"

import type { Message } from "@/entities/chat"

import { normalizeImageSrc } from "@/shared/lib/imageUrl"

const GENERATING_TEXT = "Генерация...",
 APPEAR_DELAY_MS = 50,
 TEXT_CHANGE_DELAY_MS = 400,
 TEXT_OPACITY_DELAY_MS = 50

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
