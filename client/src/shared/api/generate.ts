// Review 26.06.2026 - shared не может импортировать entities

export type {
	GenerateMode,
	GenerateRequestDto,
	GenerateResponseDto as GenerateResponse,
} from "@/entities/chat"

export { generateImage, generateText } from "@/entities/chat"
