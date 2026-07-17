"use client"

import { useImageActions } from "@/shared/hooks/useImageActions"

import type { Message } from "../../../types/message"
import { useAutoScroll } from "../../hooks/useAutoScroll"
import { ChatMessages } from "../chat-messages"

export interface ChatMessagesContainerProps {
    messages: Message[]
    isLoading: boolean
    isTextMode: boolean
}

export const ChatMessagesContainer = ({
    messages,
    isLoading,
    isTextMode,
}: ChatMessagesContainerProps) => {
    const { activeImage, setActiveImage, handleDownload } = useImageActions(),
     bottomRef = useAutoScroll(messages.length, isLoading)

    return (
        <ChatMessages
            messages={messages}
            isLoading={isLoading}
            isTextMode={isTextMode}
            activeImage={activeImage}
            onImageClick={setActiveImage}
            onDownload={handleDownload}
            bottomRef={bottomRef}
        />
    )
}
