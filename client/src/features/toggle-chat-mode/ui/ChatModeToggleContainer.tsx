"use client"

import { useChatMode } from "../model/useChatMode"

import { ChatModeToggle } from "./ChatModeToggle"

export interface ChatModeToggleContainerProps {
	isLoading?: boolean
	disabled?: boolean
}

export const ChatModeToggleContainer = ({
	isLoading = false,
	disabled = false,
}: ChatModeToggleContainerProps) => {
	const { isTextMode, setMode } = useChatMode()

	return (
		<ChatModeToggle
			isTextMode={isTextMode}
			isLoading={isLoading}
			disabled={disabled}
			onSetText={() => setMode("text")}
			onSetImage={() => setMode("image")}
		/>
	)
}
