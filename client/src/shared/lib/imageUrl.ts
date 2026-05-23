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
