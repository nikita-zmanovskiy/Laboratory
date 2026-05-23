"use client"

import { useEffect, useState } from "react"

interface ImageModalProps {
    src: string
    onClose: () => void
}

export const ImageModal = ({ src, onClose }: ImageModalProps) => {
    const [loaded, setLoaded] = useState(false)
    const [visible, setVisible] = useState(false)
    const [closing, setClosing] = useState(false)

    useEffect(() => {
        setTimeout(() => setVisible(true), 10)
        return () => setVisible(false)
    }, [])

    const handleClose = () => {
        setClosing(true)
        setTimeout(onClose, 300)
    }

    return (
        <div
            className={`fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-all duration-300 ${
                visible && !closing ? "opacity-100" : "opacity-0"
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
            <img
                src={src}
                alt="Enlarged"
                onLoad={() => setLoaded(true)}
                className={`max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl transition-all duration-500 ${
                    loaded && !closing ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
            />
        </div>
    )
}
