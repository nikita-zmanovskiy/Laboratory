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

const GENERATING_TEXT = "Генерация..."

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
        text: GENERATING_TEXT,
    })

    return ids
}
