"use client"

import { useChatInput } from "../model/useChatInput"
import { ChatInput } from "./ChatInput"

export const ChatInputContainer = () => {
	const props = useChatInput()
	return <ChatInput {...props} />
}
