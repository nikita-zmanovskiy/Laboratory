
import type { RefObject } from "react"

export interface UseClassroomSocketReturn {
    isClosed: boolean
    closeMessage: string
    onExtend: (callback: (newExpiresAt: string) => void) => void
}

export type ClassroomSocketMessage = {
    type?: string
    message?: string
    new_expires_at?: string
}

export interface UseChatInputReturn {
    inputValue: string
    isTextMode: boolean
    isLoading: boolean
    isImageLoading: boolean
    isOnline: boolean
    displayError: string | null
    imagePreview: string | null
    fileInputRef: RefObject<HTMLInputElement | null>
    onInputChange: (value: string) => void
    onSend: (e?: React.FormEvent) => void
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemoveFile: () => void
}

export interface ChatInputControlsState {
    isLoading: boolean
    isImageLoading: boolean
    isOnline: boolean
}