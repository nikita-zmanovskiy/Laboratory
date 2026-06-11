import { toProxiedImageUrl } from "@/shared/lib/imageUrl"

import type { Message } from "../types"

import type { GenerateResponseDto } from "./dto"

const EMPTY_IMAGE_RESPONSE_TEXT =
    "Изображение не было получено от сервера. Попробуйте переформулировать запрос: например, начните с «Нарисуй новое изображение на основе прикрепленного изображения...»."

export const mapGenerateResponseToMessage = (
    response: GenerateResponseDto,
    isTextMode: boolean
): Partial<Message> => {
    const text = response.data?.text?.trim()
    const imageUrl = toProxiedImageUrl(
        response.data?.image_id,
        response.data?.image_url
    )

    if (isTextMode) {
        return {
            text: text || "Ответ не получен",
            generatedImage: imageUrl,
            tokens: response.data?.tokens,
            isApproximate: response.data?.is_approximate,
        }
    }

    return {
        text: text || (imageUrl ? undefined : EMPTY_IMAGE_RESPONSE_TEXT),
        generatedImage: imageUrl,
        tokens: response.data?.tokens,
        isApproximate: response.data?.is_approximate,
    }
}
