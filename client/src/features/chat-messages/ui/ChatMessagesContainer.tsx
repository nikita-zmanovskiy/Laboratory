"use client"

import { Message } from "@/entities/chat"

import { useAutoScroll } from "../model/useAutoScroll"
import { useImageActions } from "../model/useImageActions"

import { ChatMessages } from "./ChatMessages"

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
    const { activeImage, setActiveImage, handleDownload } = useImageActions()
    const bottomRef = useAutoScroll([messages, isLoading])

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