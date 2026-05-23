"use client"

import { useChatInput } from "../model/useChatInput"
import { ChatInputView } from "./ChatInputView"

export interface ChatInputControlsState {
    isLoading: boolean
    isImageLoading: boolean
    isOnline: boolean
}

export interface ChatInputContainerProps {
    modeToggleSlot?: (state: ChatInputControlsState) => React.ReactNode
}

export const ChatInputContainer = ({ modeToggleSlot }: ChatInputContainerProps) => {
    const props = useChatInput()

    return (
        <ChatInputView
            {...props}
            modeToggleSlot={modeToggleSlot?.({
                isLoading: props.isLoading,
                isImageLoading: props.isImageLoading,
                isOnline: props.isOnline,
            }) ?? null}
        />
    )
}
