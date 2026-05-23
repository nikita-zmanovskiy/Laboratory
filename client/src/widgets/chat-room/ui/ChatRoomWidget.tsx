"use client"

import { useChatStore } from "@/entities/chat"
import { ChatInputContainer } from "@/features/chat-input"
import { ChatMessagesContainer } from "@/features/chat-messages"
import { ChatModeToggleContainer } from "@/features/toggle-chat-mode"
import { EmptyChatState } from "@/shared/ui/EmptyChatState"

export const ChatRoomWidget = () => {
    const messages = useChatStore((state) => state.messages)
    const isLoading = useChatStore((state) => state.isLoading)
    const mode = useChatStore((state) => state.mode)

    return (
        <>
            <div className="mb-0 min-h-0 w-full flex-1">
                {messages.length > 0 ? (
                    <ChatMessagesContainer messages={messages} isLoading={isLoading} isTextMode={mode === "text"} />
                ) : (
                    <EmptyChatState />
                )}
            </div>
            <div className="sticky bottom-4 w-full">
                <ChatInputContainer
                    modeToggleSlot={({ isLoading: isInputLoading, isImageLoading, isOnline }) => (
                        <ChatModeToggleContainer
                            isLoading={isInputLoading || isImageLoading}
                            disabled={!isOnline}
                        />
                    )}
                />
            </div>
        </>
    )
}
