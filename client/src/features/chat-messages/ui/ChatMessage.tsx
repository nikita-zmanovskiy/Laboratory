"use client"

import { useEffect, useState } from "react"

import type { Message } from "@/entities/chat"

import { normalizeImageSrc } from "@/shared/lib/imageUrl"

import { MessageImage } from "./MessageImage"
import { MessageText } from "./MessageText"
import { TokenUsage } from "./TokenUsage"

interface ChatMessageProps {
    message: Message
    onImageClick: (url: string | null) => void
    onDownload: (e: React.MouseEvent, imageUrl: string, filename: string) => void
}

const GENERATING_TEXT = "Генерация..."

export const ChatMessage = ({ message, onImageClick, onDownload }: ChatMessageProps) => {
    const [visible, setVisible] = useState(false)
    const [displayText, setDisplayText] = useState("")
    const [textOpacity, setTextOpacity] = useState(false)
    const isUser = message.role === "user"

    useEffect(() => {
        setTimeout(() => setVisible(true), 50)
    }, [])

    useEffect(() => {
        if (message.text && message.text !== GENERATING_TEXT) {
            setTextOpacity(false)
            const timer = setTimeout(() => {
                setDisplayText(message.text || "")
                setTimeout(() => setTextOpacity(true), 50)
            }, 400)
            return () => clearTimeout(timer)
        }

        if (message.text === GENERATING_TEXT) {
            setDisplayText(GENERATING_TEXT)
            return
        }

        setDisplayText(message.text || "")
        setTextOpacity(true)
    }, [message.text])

    if (!isUser && displayText === GENERATING_TEXT) {
        return (
            <div className={`flex max-w-[75%] flex-col gap-1.5 transition-all duration-400 mr-auto items-start ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}>
                <div className="rounded-2xl rounded-tl-none bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] px-4 py-2.5 text-sm shadow-sm max-w-[100%]">
                    <div className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border-primary)] border-t-[var(--color-text-primary)]" />
                        <span className="text-[var(--color-text-secondary)]">{GENERATING_TEXT}</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`flex page__animation max-w-[75%] flex-col gap-1.5 transition-all duration-400 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            } ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`}
        >
            <div
                className={`rounded-2xl px-4 py-2.5 text-sm max-w-[100%] ${
                    isUser
                        ? "rounded-tr-none bg-blue-600 text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-primary)]"
                }`}
            >
                {displayText && (
                    <MessageText text={displayText} isUser={isUser} isVisible={textOpacity} />
                )}

                {message.attachedImage && (
                    <MessageImage
                        src={message.attachedImage}
                        alt="Attached"
                        wrapperClassName="mt-2 max-w-sm cursor-zoom-in"
                        onImageClick={onImageClick}
                    />
                )}

                {message.generatedImage && (() => {
                    const imageSrc = normalizeImageSrc(message.generatedImage)
                    return (
                        <MessageImage
                            src={imageSrc}
                            alt="Generated"
                            wrapperClassName="group ml-5 relative mt-2 max-w-sm cursor-zoom-in"
                            onImageClick={onImageClick}
                            download={{
                                filename: `ai-image-${message.id}.png`,
                                onDownload,
                            }}
                        />
                    )
                })()}

                {message.role === "assistant" && message.tokens && (
                    <TokenUsage
                        tokens={message.tokens}
                        isApproximate={message.isApproximate}
                        hasGeneratedImage={Boolean(message.generatedImage)}
                    />
                )}
            </div>
        </div>
    )
}
