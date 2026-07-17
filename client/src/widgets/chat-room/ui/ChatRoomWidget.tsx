"use client"

import { ChatMessagesContainer } from "@/entities/chat"
import { ChatModeToggleContainer } from "@/features/toggle-chat-mode"

import { useChatStore } from "@/entities/chat"

import { EmptyChatState } from "@/shared/ui/EmptyChatState"

import { ChatInputContainer } from "./ChatInputContainer"

export const ChatRoomWidget = () => {
    const messages = useChatStore((state) => state.messages),
     isLoading = useChatStore((state) => state.isLoading),
     mode = useChatStore((state) => state.mode)

    return (
        <>
            <section className="mb-0 min-h-0 w-full flex-1">
                {messages.length > 0 ? (
                    <ChatMessagesContainer messages={messages} isLoading={isLoading} isTextMode={mode === "text"} />
                ) : (
                    <EmptyChatState />
                )}
            </section>
            <section className="sticky bottom-4 w-full">
                <ChatInputContainer
                    modeToggleSlot={({ isLoading: isInputLoading, isImageLoading, isOnline }) => (
                        <ChatModeToggleContainer
                            isLoading={isInputLoading || isImageLoading}
                            disabled={!isOnline}
                        />
                    )}
                />
            </section>
        </>
    )
}
