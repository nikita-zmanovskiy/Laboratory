import { useState, useCallback } from "react"
import { AxiosError } from "axios"
import { useChatStore } from "@/entities/chat"
import { useSessionStore } from "@/entities/session"
import { generateText, generateImage, getApiErrorMessage } from "@/shared"
import { toProxiedImageUrl } from "@/shared/lib/imageUrl"
import { useRoleStore } from "@/features/role-select"

interface UseSendMessageReturn {
    isLoading: boolean
    error: string | null
    sendMessage: (prompt: string, imageBase64: string | null, isTextMode: boolean, attachedImagePreview?: string | null) => Promise<void>
    clearError: () => void
}

export const useSendMessage = (): UseSendMessageReturn => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { addMessage, updateMessage, removeMessage } = useChatStore()
    const sessionId = useSessionStore((state) => state.sessionId)

    const clearError = useCallback(() => setError(null), [])

    const sendMessage = useCallback(
        async (prompt: string, imageBase64: string | null, isTextMode: boolean, attachedImagePreview?: string | null) => {
            if (!sessionId) return

            const { classroomCode } = useRoleStore.getState()
            if (!classroomCode) {
                setError("Код класса не указан")
                return
            }

            const userMessageId = "user-" + Date.now()
            const assistantMessageId = "assistant-" + Date.now()

            addMessage({
                id: userMessageId,
                role: "user",
                text: prompt,
                attachedImage: attachedImagePreview || undefined,
            })

            addMessage({
                id: assistantMessageId,
                role: "assistant",
                text: "Генерация...",
            })

            setIsLoading(true)

            try {
                const role = useRoleStore.getState().role
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

                if (isTextMode) {
                    updateMessage(assistantMessageId, {
                        text: response.data?.text || "Ответ не получен",
                        generatedImage: toProxiedImageUrl(
                            response.data?.image_id,
                            response.data?.image_url
                        ),
                        tokens: response.data?.tokens,
                        isApproximate: response.data?.is_approximate,
                    })
                } else {
                    updateMessage(assistantMessageId, {
                        text: response.data?.text || undefined,
                        generatedImage: toProxiedImageUrl(
                            response.data?.image_id,
                            response.data?.image_url
                        ),
                        tokens: response.data?.tokens,
                        isApproximate: response.data?.is_approximate,
                    })
                }

                setIsLoading(false)
            } catch (err) {
                const message = getApiErrorMessage(err)
                const isSecurityError = err instanceof AxiosError && err.response?.status === 403

                updateMessage(assistantMessageId, {
                    text: isSecurityError ? "Запрос отклонён по соображениям безопасности" : "Ошибка запроса",
                })

                if (!isSecurityError) {
                    removeMessage(userMessageId)
                    removeMessage(assistantMessageId)
                    setError(message)
                }

                setIsLoading(false)
            }
        },
        [sessionId, addMessage, updateMessage, removeMessage]
    )

    return { isLoading, error, sendMessage, clearError }
}