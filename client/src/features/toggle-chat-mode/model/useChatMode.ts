import { useChatStore } from "@/entities/chat"

interface UseChatModeReturn {
	mode: "text" | "image"
	isTextMode: boolean
	setMode: (mode: "text" | "image") => void
}

export const useChatMode = (): UseChatModeReturn => {
	const mode = useChatStore((state) => state.mode),
	 setMode = useChatStore((state) => state.setMode)

	return {
		mode,
		isTextMode: mode === "text",
		setMode,
	}
}
