"use client"

import React from "react"

import type { Message } from "@/entities/chat"

import { ImageModal } from "./ImageModal"
import { MessageList } from "./MessageList"

interface ChatMessagesProps {
    messages: Message[]
    isLoading: boolean
    isTextMode: boolean
    activeImage: string | null
    onImageClick: (url: string | null) => void
    onDownload: (e: React.MouseEvent, imageUrl: string, filename: string) => void
    bottomRef: React.RefObject<HTMLDivElement | null>
}

export const ChatMessages = React.memo(({
    messages,
    isLoading,
    isTextMode,
    activeImage,
    onImageClick,
    onDownload,
    bottomRef,
}: ChatMessagesProps) => (
    <div className="pb-55 pt-20 max-[1250px]:pt-30 h-full w-full space-y-4 overflow-y-auto rounded-xl">
        <MessageList
            messages={messages}
            isLoading={isLoading}
            isTextMode={isTextMode}
            onImageClick={onImageClick}
            onDownload={onDownload}
        />

        {activeImage && (
            <ImageModal src={activeImage} onClose={() => onImageClick(null)} />
        )}

        <div ref={bottomRef as React.Ref<HTMLDivElement>} />
    </div>
))

ChatMessages.displayName = "ChatMessages"
