"use client"

import { ChatInputView } from "./ChatInputView"
import { useChatInput } from "../../../features/chat-input/model/useChatInput"

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
