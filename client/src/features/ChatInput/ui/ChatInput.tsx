"use client"

import { useEffect, useState } from "react"
import { ChatModeToggleContainer } from "@/features/toggle-chat-mode"
import { SendButton, FilePreview } from "@/features/send-message"
import styles from './chatInput.module.css'

interface ChatInputProps {
    inputValue: string
    isTextMode: boolean
    isLoading: boolean
    isImageLoading: boolean
    isOnline: boolean
    displayError: string | null
    imagePreview: string | null
    fileInputRef: React.Ref<HTMLInputElement>
    onInputChange: (value: string) => void
    onSend: (e?: React.FormEvent) => void
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemoveFile: () => void
}

const MAX_LENGTH = 1000

const AttachmentButton = ({ isLoading, isImageLoading, isOnline, onFileChange, fileInputRef, visible: isVisible }: {
    isLoading: boolean
    isImageLoading: boolean
    isOnline: boolean
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    fileInputRef: React.Ref<HTMLInputElement>
    visible: boolean
}) => {
    const [render, setRender] = useState(false)
    const [animate, setAnimate] = useState(false)

    useEffect(() => {
        if (isVisible) {
            setRender(true)
            setTimeout(() => setAnimate(true), 10)
        } else {
            setAnimate(false)
            setTimeout(() => setRender(false), 300)
        }
    }, [isVisible])

    if (!render) return null

    return (
        <div className={`flex h-9 items-center justify-center transition-all duration-300 ${
            animate ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"
        }`}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                accept=".jpg,.jpeg,.png,.webp"
                disabled={isLoading || isImageLoading || !isOnline}
                className="hidden"
                id="image-upload-input"
            />
            {isImageLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-text-muted)] border-t-[var(--color-text-primary)]" />
            ) : (
                <label
                    htmlFor="image-upload-input"
                    className={`flex cursor-pointer items-center justify-center rounded-xl p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] ${isLoading ? "pointer-events-none opacity-50" : ""}`}
                    title="Прикрепить изображение"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                </label>
            )}
        </div>
    )
}

export const ChatInput = ({
    inputValue,
    isTextMode,
    isLoading,
    isImageLoading,
    isOnline,
    displayError,
    imagePreview,
    fileInputRef,
    onInputChange,
    onSend,
    onKeyDown,
    onFileChange,
    onRemoveFile,
}: ChatInputProps) => (
    <div className={`${styles['glass-gradient-wrapper']} ${styles.chatInput__wrappec} page__animation-opacity relative w-full`}>
        <div className={styles['glow-blur-layer']} />
        <div className={styles.input__overlay}></div>
        <form onSubmit={onSend} className={`${styles['glass-inner']} space-y-3 p-4`}>
            {imagePreview && (
                <FilePreview imagePreview={imagePreview} isLoading={isLoading} onRemove={onRemoveFile} />
            )}

            <div className="relative">
                <textarea
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Введите свой запрос..."
                    maxLength={MAX_LENGTH}
                    disabled={isLoading || !isOnline}
                    className="max-h-32 min-h-[44px] w-full resize-none overflow-y-auto bg-transparent px-2 pt-2 pb-8 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none disabled:opacity-50"
                />
                <div className={`${styles.input__limit} absolute right-3 bottom-3 font-mono text-[11px] ${inputValue.length >= MAX_LENGTH ? "font-bold text-[var(--color-text-error)]" : "text-[var(--color-text-muted)]"}`}>
                    {inputValue.length}/{MAX_LENGTH}
                </div>
            </div>

            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-4">
                    <ChatModeToggleContainer isLoading={isLoading || isImageLoading} disabled={!isOnline} />

                    <AttachmentButton
                        isLoading={isLoading}
                        isImageLoading={isImageLoading}
                        isOnline={isOnline}
                        onFileChange={onFileChange}
                        fileInputRef={fileInputRef}
                        visible={true}
                    />

                    {displayError && <span className="text-xs font-medium text-[var(--color-text-error)]">{displayError}</span>}
                </div>

                <div className="flex items-center gap-2">
                    <SendButton
                        isLoading={isLoading}
                        isDisabled={!inputValue.trim() || inputValue.length > MAX_LENGTH || isImageLoading || !isOnline}
                        isTextMode={isTextMode}
                    />
                </div>
            </div>
        </form>
    </div>
)