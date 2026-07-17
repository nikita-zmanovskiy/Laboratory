"use client"

import { useChatInput } from "../hooks/useChatInput"
import { ChatInputContainerProps } from "../types"

import { ChatInputView } from "./ChatInputView"



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
