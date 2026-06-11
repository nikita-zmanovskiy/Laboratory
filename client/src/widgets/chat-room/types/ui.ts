
import type { ChangeEvent, FormEvent, KeyboardEvent, ReactNode, RefObject } from "react"
import type { ChatInputControlsState } from "./models"

export interface ChatInputViewProps {
    inputValue: string
    isTextMode: boolean
    isLoading: boolean
    isImageLoading: boolean
    isOnline: boolean
    displayError: string | null
    imagePreview: string | null
    fileInputRef: RefObject<HTMLInputElement | null>
    modeToggleSlot: ReactNode
    onInputChange: (value: string) => void
    onSend: (event?: FormEvent) => void
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
    onRemoveFile: () => void
}

export interface ChatInputContainerProps {
    modeToggleSlot?: (state: ChatInputControlsState) => React.ReactNode
}

export interface AttachmentButtonProps {
    isLoading: boolean
    isImageLoading: boolean
    isOnline: boolean
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
    fileInputRef: RefObject<HTMLInputElement | null>
    visible: boolean
}