import { useCallback, useState } from "react"

import { useRoleStore } from "@/features/role-select"

import { useChatStore } from "@/entities/chat"
import { useSessionStore } from "@/entities/session"

import { generateImage, generateText } from "@/shared"

import { mapSendMessageError } from "./errors"
import { mapGenerateResponseToMessage } from "./mapper"
import { addOptimisticMessages } from "./optimistic"

interface UseSendMessageReturn {
    isLoading: boolean
    error: string | null
    sendMessage: (prompt: string, imageBase64: string | null, isTextMode: boolean, attachedImagePreview?: string | null) => Promise<void>
    clearError: () => void
}

export const useSendMessage = (): UseSendMessageReturn => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { addMessage, updateMessage, removeMessage, setLoading } = useChatStore()
    const sessionId = useSessionStore((state) => state.sessionId)

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
                const isTeacherPreview = role === "teacher"
                const effectiveSessionId = isTeacherPreview
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
