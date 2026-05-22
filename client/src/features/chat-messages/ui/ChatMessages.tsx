"use client"

import React, { useEffect, useRef, useState } from "react"
import ReactMarkdown from 'react-markdown'
import { Message } from "@/entities/chat"
import { normalizeImageSrc } from "@/shared/lib/imageUrl"

interface ChatMessagesProps {
    messages: Message[]
    isLoading: boolean
    isTextMode: boolean
    activeImage: string | null
    onImageClick: (url: string | null) => void
    onDownload: (e: React.MouseEvent, imageUrl: string, filename: string) => void
    bottomRef: React.RefObject<HTMLDivElement | null>
}

const ImageWithLoader = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
    const [loaded, setLoaded] = useState(false)

    return (
        <div className="relative overflow-hidden rounded-lg border border-[var(--color-border-primary)] min-h-[200px] bg-[var(--color-bg-hover)]">
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-primary)] border-t-[var(--color-text-primary)]" />
                        <span className="text-xs text-[var(--color-text-muted)]">Загрузка изображения...</span>
                    </div>
                </div>
            )}
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                className={`${className} transition-opacity duration-300 min-h-[200px] ${loaded ? "opacity-100" : "opacity-0"}`}
            />
        </div>
    )
}

const ModalImage = ({ src, onClose }: { src: string; onClose: () => void }) => {
    const [loaded, setLoaded] = useState(false)
    const [visible, setVisible] = useState(false)
    const [closing, setClosing] = useState(false)

    useEffect(() => {
        setTimeout(() => setVisible(true), 10)
        return () => setVisible(false)
    }, [])

    const handleClose = () => {
        setClosing(true)
        setTimeout(onClose, 300)
    }

    return (
        <div
            className={`fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-all duration-300 ${
                visible && !closing ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClose}
        >
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        <span className="text-sm text-white/60">Загрузка изображения...</span>
                    </div>
                </div>
            )}
            <img
                src={src}
                alt="Enlarged"
                onLoad={() => setLoaded(true)}
                className={`max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl transition-all duration-500 ${
                    loaded && !closing ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
            />
        </div>
    )
}

const MessageItem = ({ msg, isUser, onImageClick, onDownload }: { msg: Message; isUser: boolean; onImageClick: (url: string | null) => void; onDownload: (e: React.MouseEvent, imageUrl: string, filename: string) => void }) => {
    const [visible, setVisible] = useState(false)
    const [displayText, setDisplayText] = useState("")
    const [textOpacity, setTextOpacity] = useState(false)

    useEffect(() => {
        setTimeout(() => setVisible(true), 50)
    }, [])

    useEffect(() => {
        if (msg.text && msg.text !== "Генерация...") {
            setTextOpacity(false)
            const timer = setTimeout(() => {
                setDisplayText(msg.text)
                setTimeout(() => setTextOpacity(true), 50)
            }, 400)
            return () => clearTimeout(timer)
        } else if (msg.text === "Генерация...") {
            setDisplayText("Генерация...")
        } else {
            setDisplayText(msg.text || "")
            setTextOpacity(true)
        }
    }, [msg.text])

    if (!isUser && displayText === "Генерация...") {
        return (
            <div className={`flex max-w-[75%] flex-col gap-1.5 transition-all duration-400 mr-auto items-start ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}>
                <div className="rounded-2xl rounded-tl-none bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] px-4 py-2.5 text-sm shadow-sm max-w-[100%]">
                    <div className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border-primary)] border-t-[var(--color-text-primary)]" />
                        <span className="text-[var(--color-text-secondary)]">Генерация...</span>
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
                {displayText && !isUser && (
                    <div className={`rounded-2xl px-6 py-5.5 bg-[var(--color-bg-secondary)] rounded-tl-none leading-relaxed break-words transition-all duration-700 ease-out ${
                        textOpacity ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    }`}>
                        <ReactMarkdown
                            components={{
                                h1: ({children}) => <h3 className="text-base font-semibold text-[var(--color-text-primary)] mt-2 mb-1">{children}</h3>,
                                h2: ({children}) => <h3 className="text-base font-semibold text-[var(--color-text-primary)] mt-2 mb-1">{children}</h3>,
                                h3: ({children}) => <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mt-2 mb-1">{children}</h3>,
                                strong: ({children}) => <strong className="font-bold text-[var(--color-text-primary)]">{children}</strong>,
                                em: ({children}) => <em className="italic text-[var(--color-text-primary)]">{children}</em>,
                                p: ({children}) => <p className="my-1 text-[var(--color-text-primary)]">{children}</p>,
                                ul: ({children}) => <ul className="list-disc ml-4 my-1 text-[var(--color-text-primary)]">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal ml-4 my-1 text-[var(--color-text-primary)]">{children}</ol>,
                                li: ({children}) => <li className="my-0.5">{children}</li>,
                                code: ({children}) => <code className="bg-[var(--color-bg-hover)] px-1.5 py-0.5 rounded text-sm">{children}</code>,
                                pre: ({children}) => <pre className="bg-[var(--color-bg-hover)] p-3 rounded-xl my-2 overflow-x-auto">{children}</pre>,
                            }}
                        >
                            {displayText}
                        </ReactMarkdown>
                    </div>
                )}

                {displayText && isUser && (
                    <p className="leading-relaxed whitespace-pre-wrap break-words max-w-[380px]">
                        {displayText}
                    </p>
                )}

                {msg.attachedImage && (
                    <div onClick={() => onImageClick(msg.attachedImage!)} className="mt-2 max-w-sm cursor-zoom-in">
                        <ImageWithLoader src={msg.attachedImage} alt="Attached" className="h-auto max-h-[400px] w-full object-contain" />
                    </div>
                )}

                {msg.generatedImage && (() => {
                    const imageSrc = normalizeImageSrc(msg.generatedImage)
                    return (
                        <div onClick={() => onImageClick(imageSrc)} className="group ml-5 relative mt-2 max-w-sm cursor-zoom-in">
                            <ImageWithLoader src={imageSrc} alt="Generated" className="h-auto max-h-[400px] w-full object-contain" />
                            <button
                                type="button"
                                onClick={(e) => onDownload(e, imageSrc, `ai-image-${msg.id}.png`)}
                                className="absolute top-2 right-2 flex cursor-pointer items-center gap-1.5 rounded-xl bg-black/50 p-2 text-xs font-medium text-white opacity-0 shadow backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-black/70"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                <span>Скачать</span>
                            </button>
                        </div>
                    )
                })()}

                {msg.role === "assistant" && msg.tokens && (
                    <div className={`mt-2 flex items-center ml-5 gap-1.5 ${msg.generatedImage ? '' : "border-t border-[var(--color-border-primary)] pt-1.5"} font-mono text-[10px] text-[var(--color-text-muted)] select-none`}>
                        <span className="font-semibold text-[var(--color-text-secondary)]">Токены:</span>
                        <span>входные: {msg.tokens.input}</span>
                        <span>выходные: {msg.tokens.output}</span>
                        {msg.isApproximate && (
                            <span className="text-amber-400 italic" title="Токены оценены приблизительно">
                                (приблизительно)
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export const ChatMessages = React.memo(({
    messages,
    isLoading,
    isTextMode,
    activeImage,
    onImageClick,
    onDownload,
    bottomRef,
}: ChatMessagesProps) => {

    return (
        <div className="pb-55 pt-20 h-full w-full space-y-4 overflow-y-auto rounded-xl">
            {messages.map((msg) => (
                <MessageItem key={msg.id} msg={msg} isUser={msg.role === "user"} onImageClick={onImageClick} onDownload={onDownload} />
            ))}
            {isLoading && (
                <div className="mr-auto flex max-w-[75%] animate-pulse flex-col items-start gap-1.5">
                    <div className="min-w-[200px] rounded-2xl rounded-tl-none border border-[var(--color-border-primary)] bg-[var(--color-bg-hover)] px-4 py-3 shadow-sm">
                        {isTextMode ? (
                            <div className="space-y-2 py-1">
                                <div className="h-3 w-5/6 rounded-md bg-[var(--color-bg-hover)]" />
                                <div className="h-3 w-full rounded-md bg-[var(--color-bg-hover)]" />
                                <div className="h-3 w-2/3 rounded-md bg-[var(--color-bg-hover)]" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="h-3 w-3/4 rounded-md bg-[var(--color-bg-hover)]" />
                                <div className="flex h-48 w-64 items-center justify-center rounded-lg border border-dashed border-[var(--color-border-primary)] bg-[var(--color-bg-hover)]">
                                    <span className="text-xs text-[var(--color-text-muted)]">Генерация изображения...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeImage && (
                <ModalImage src={activeImage} onClose={() => onImageClick(null)} />
            )}

            <div ref={bottomRef} />
        </div>
    )
})

ChatMessages.displayName = "ChatMessages"