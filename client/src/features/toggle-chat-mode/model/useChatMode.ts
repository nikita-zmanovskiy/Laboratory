import { useChatStore } from "@/entities/chat"

interface UseChatModeData {
    mode: "text" | "image"
    isTextMode: boolean
}

interface UseChatModeHandlers {
    setMode: (mode: "text" | "image") => void
}

type UseChatModeReturn = UseChatModeData & UseChatModeHandlers

/**
 * Хук для управления режимом чата (текст или изображения)
 *
 * Читает текущий режим из ChatStore и предоставляет вычисляемый флаг isTextMode
 * Переключение режима через setMode обновляет глобальное состояние стора
 *
 * @returns mode - текущий режим (text или image)
 * @returns isTextMode - флаг текстового режима (true если mode === text)
 * @returns setMode - функция установки режима
 */

export const useChatMode = (): UseChatModeReturn => {
	const mode = useChatStore((state) => state.mode),
	 setMode = useChatStore((state) => state.setMode)

	return {
		mode,
		isTextMode: mode === "text",
		setMode,
	}
}
