import type { ChatMode, Message } from "./message"

export interface ChatStoreState {
    mode: ChatMode
    messages: Message[]
    isLoading: boolean
    error: string | null
}

export interface ChatStoreActions {
    setMode: (mode: ChatMode) => void
    setLoading: (loading: boolean) => void
    addMessage: (message: Message) => void
    updateMessage: (id: string, fields: Partial<Omit<Message, "id">>) => void
    removeMessage: (id: string) => void
    clearMessages: () => void
    clearError: () => void
}

export type ChatStore = ChatStoreState & ChatStoreActions