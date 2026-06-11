import { useChatStore } from "@/entities/chat"

interface UseChatModeData {
    mode: "text" | "image"
    isTextMode: boolean
}

interface UseChatModeHandlers {
    setMode: (mode: "text" | "image") => void
}

type UseChatModeReturn = UseChatModeData & UseChatModeHandlers

export const useChatMode = (): UseChatModeReturn => {
	const mode = useChatStore((state) => state.mode),
	 setMode = useChatStore((state) => state.setMode)

	return {
		mode,
		isTextMode: mode === "text",
		setMode,
	}
}
