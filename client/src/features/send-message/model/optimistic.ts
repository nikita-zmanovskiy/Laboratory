import type { Message } from "@/entities/chat"

export interface OptimisticMessageIds {
    userMessageId: string
    assistantMessageId: string
}

interface AddOptimisticMessagesData {
    prompt: string
    attachedImagePreview?: string | null
}

interface AddOptimisticMessagesHandlers {
    addMessage: (message: Message) => void
}

type AddOptimisticMessagesParams = AddOptimisticMessagesData & AddOptimisticMessagesHandlers

/**
 * Создаёт уникальные идентификаторы для оптимистичных сообщений
 *
 * Генерирует id на основе текущего timestamp
 *
 * @returns объект с userMessageId и assistantMessageId
 */

/**
 * Добавляет оптимистичные сообщения пользователя и ассистента в чат
 *
 * Сообщение пользователя содержит текст запроса и прикреплённое изображение при наличии
 * Сообщение ассистента содержит текст 'Генерация...' как заглушку на время запроса
 *
 * @param addMessage - функция добавления сообщения в стор
 * @param prompt - текст запроса пользователя
 * @param attachedImagePreview - URL прикреплённого изображения (опционально)
 * @returns идентификаторы созданных сообщений
 */


export const createOptimisticMessageIds = (): OptimisticMessageIds => {
    const timestamp = Date.now()

    return {
        userMessageId: `user-${timestamp}`,
        assistantMessageId: `assistant-${timestamp}`,
    }
}

export const addOptimisticMessages = ({
    addMessage,
    prompt,
    attachedImagePreview,
}: AddOptimisticMessagesParams): OptimisticMessageIds => {
    const ids = createOptimisticMessageIds()

    addMessage({
        id: ids.userMessageId,
        role: "user",
        text: prompt,
        attachedImage: attachedImagePreview || undefined,
    })

    addMessage({
        id: ids.assistantMessageId,
        role: "assistant",
        text: "Генерация...",
    })

    return ids
}
