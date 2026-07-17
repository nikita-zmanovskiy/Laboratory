"use client"

import { useState } from "react"
import Image from "next/image"

import { useOverlayAnimation } from "@/shared/lib/useOverlayAnimation"

interface ImageModalData {
    src: string
}

interface ImageModalHandlers {
    onClose: () => void
}

type ImageModalProps = ImageModalData & ImageModalHandlers

export const ImageModal = ({ src, onClose }: ImageModalProps) => {
    const [loaded, setLoaded] = useState(false),
     { isShown, runClose } = useOverlayAnimation()

    const handleClose = () => runClose(onClose)

    return (
        <div
            className={`modal-overlay fixed inset-0 z-50 mb-0 flex cursor-zoom-out items-center justify-center bg-black/80 p-4 backdrop-blur-sm ${
                isShown ? "modal-overlay--visible" : "modal-overlay--hidden"
            }`}
            onClick={handleClose}
        >
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        <span className="text-sm text-white/60">Загрузка изображения...</span>
                    </div>
                </div>
            )}

            <Image
                src={src}
                alt="Изображение"
                width={700}
                height={700}
                onLoad={() => setLoaded(true)}
                className={`max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl transition-all duration-500 ${
                    loaded && isShown ? "scale-100 opacity-100" : "scale-95 opacity-0"
                }`}
                unoptimized
            />
        </div>
    )
}
