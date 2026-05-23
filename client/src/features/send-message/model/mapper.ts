import type { Message } from "@/entities/chat"
import type { GenerateResponse } from "@/shared/api/generate"
import { toProxiedImageUrl } from "@/shared/lib/imageUrl"

export const mapGenerateResponseToMessage = (
    response: GenerateResponse,
    isTextMode: boolean
): Partial<Omit<Message, "id">> => {
    const imageUrl = toProxiedImageUrl(
        response.data?.image_id,
        response.data?.image_url
    )

    return {
        text: isTextMode
            ? response.data?.text || "Ответ не получен"
            : response.data?.text || undefined,
        generatedImage: imageUrl,
        tokens: response.data?.tokens,
        isApproximate: response.data?.is_approximate,
    }
}
