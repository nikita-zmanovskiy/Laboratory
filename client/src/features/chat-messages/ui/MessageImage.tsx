"use client"

import { useState } from "react"

interface ImageWithLoaderProps {
    src: string
    alt: string
    className: string
}

interface MessageImageProps {
    src: string
    alt: string
    className?: string
    wrapperClassName: string
    onImageClick: (url: string | null) => void
    download?: {
        filename: string
        onDownload: (e: React.MouseEvent, imageUrl: string, filename: string) => void
    }
}

const ImageWithLoader = ({ src, alt, className }: ImageWithLoaderProps) => {
    const [loaded, setLoaded] = useState(false)

    return (
        <div className="relative overflow-hidden rounded-lg border border-[var(--color-border-primary)] min-h-[200px] bg-[var(--color-bg-hover)]">
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-primary)] border-t-[var(--color-text-primary)]" />
                        <span className="text-xs text-[var(--color-text-muted)]">Загрузка изображения...</span>
                    </div>
                </div>
            )}
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                className={`${className} transition-opacity duration-300 min-h-[200px] ${loaded ? "opacity-100" : "opacity-0"}`}
            />
        </div>
    )
}

export const MessageImage = ({
    src,
    alt,
    className = "h-auto max-h-[400px] w-full object-contain",
    wrapperClassName,
    onImageClick,
    download,
}: MessageImageProps) => (
    <div onClick={() => onImageClick(src)} className={wrapperClassName}>
        <ImageWithLoader src={src} alt={alt} className={className} />
        {download && (
            <button
                type="button"
                onClick={(e) => download.onDownload(e, src, download.filename)}
                className="absolute top-2 right-2 flex cursor-pointer items-center gap-1.5 rounded-xl bg-black/50 p-2 text-xs font-medium text-white opacity-0 shadow backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-black/70"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>Скачать</span>
            </button>
        )}
    </div>
)
