/**
 * Нормализует путь к изображению заменяя /api/images/ на /api/generate/images/
 *
 * Используется для приведения старых путей изображений к новому формату API
 *
 * @param src - исходный путь к изображению
 * @returns нормализованный путь
 */

/**
 * Преобразует imageId или imageUrl в проксированный URL изображения
 *
 * Если передан imageId - формирует путь /api/generate/images/{imageId}
 * Если передан только imageUrl - извлекает id из последнего сегмента пути
 * и формирует такой же проксированный URL
 *
 * @param imageId - идентификатор изображения (опционально)
 * @param imageUrl - полный URL изображения (опционально)
 * @returns проксированный путь к изображению или undefined
 */

export const normalizeImageSrc = (src: string): string =>
    src.startsWith("/api/images/")
        ? src.replace("/api/images/", "/api/generate/images/")
        : src

export const toProxiedImageUrl = (
    imageId?: string | null,
    imageUrl?: string | null
): string | undefined => {
    if (imageId) {
        return `/api/generate/images/${imageId}`
    }
    if (imageUrl) {
        const id = imageUrl.split("/").filter(Boolean).pop()
        if (id) {
            return `/api/generate/images/${id}`
        }
    }
    return undefined
}
