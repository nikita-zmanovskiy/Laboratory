import { useCallback, useState } from "react"

import {
    generateImage,
    generateText,
    mapGenerateResponseToMessage,
    useChatStore,
} from "@/entities/chat"
import { useRoleStore, useSessionStore } from "@/entities/session"

import { mapSendMessageError } from "./errors"
import { addOptimisticMessages } from "./optimistic"

interface UseSendMessageData {
    isLoading: boolean
    error: string | null
}

interface UseSendMessageHandlers {
    sendMessage: (prompt: string, imageBase64: string | null, isTextMode: boolean, attachedImagePreview?: string | null) => Promise<void>
    clearError: () => void
}

type UseSendMessageReturn = UseSendMessageData & UseSendMessageHandlers

/**
 * Хук для отправки сообщений в чат
 *
 * Добавляет оптимистичные сообщения пользователя и ассистента перед запросом
 * В зависимости от isTextMode вызывает generateText или generateImage из entities/chat
 * Для teacher-preview сессии подменяет sessionId на teacher-preview-{classroomCode}
 * При ошибке обновляет сообщение ассистента текстом ошибки
 * При критической ошибке удаляет оба оптимистичных сообщения и устанавливает error
 *
 * @returns isLoading - флаг отправки сообщения
 * @returns error - текст ошибки или null
 * @returns sendMessage - функция отправки сообщения
 * @returns clearError - функция сброса ошибки
 */

export const useSendMessage = (): UseSendMessageReturn => {
    const [isLoading, setIsLoading] = useState(false),
     [error, setError] = useState<string | null>(null)

    const { addMessage, updateMessage, removeMessage, setLoading } = useChatStore(),
     sessionId = useSessionStore((state) => state.sessionId)

    const clearError = useCallback(() => setError(null), [])

    const sendMessage = useCallback(
        async (prompt: string, imageBase64: string | null, isTextMode: boolean, attachedImagePreview?: string | null) => {
            if (!sessionId) return

            const { classroomCode, role } = useRoleStore.getState()

            if (!classroomCode) {
                setError("Код класса не указан")
                return
            }

            const { userMessageId, assistantMessageId } = addOptimisticMessages({
                addMessage,
                prompt,
                attachedImagePreview,
            })

            setError(null)
            setIsLoading(true)
            setLoading(true)

            try {
                const isTeacherPreview = role === "teacher",
                 effectiveSessionId = isTeacherPreview
                    ? `teacher-preview-${classroomCode}`
                    : sessionId

                const response = isTextMode
                    ? await generateText(
                        prompt,
                        effectiveSessionId,
                        classroomCode,
                        imageBase64,
                        isTeacherPreview
                    )
                    : await generateImage(
                        prompt,
                        imageBase64,
                        effectiveSessionId,
                        classroomCode,
                        isTeacherPreview
                    )

                updateMessage(
                    assistantMessageId,
                    mapGenerateResponseToMessage(response, isTextMode)
                )
            } catch (err) {
                const errorResult = mapSendMessageError(err)

                updateMessage(assistantMessageId, {
                    text: errorResult.assistantText,
                })

                if (errorResult.shouldRollback) {
                    removeMessage(userMessageId)
                    removeMessage(assistantMessageId)
                    setError(errorResult.errorMessage)
                }
            } finally {
                setIsLoading(false)
                setLoading(false)
            }
        },
        [sessionId, addMessage, updateMessage, removeMessage, setLoading]
    )

    return { isLoading, error, sendMessage, clearError }
}
