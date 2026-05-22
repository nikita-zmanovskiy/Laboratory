"use client"

import { useState, useEffect } from "react"

export const PageLoader = () => {
    const [visible, setVisible] = useState(true)
    const [fadeOut, setFadeOut] = useState(false)

    useEffect(() => {
        const minLoadTime = new Promise(resolve => setTimeout(resolve, 1000))
        const pageLoad = new Promise(resolve => {
            if (document.readyState === "complete") {
                resolve(true)
            } else {
                window.addEventListener("load", () => resolve(true))
            }
        })

        Promise.all([minLoadTime, pageLoad]).then(() => {
            setFadeOut(true)
            setTimeout(() => setVisible(false), 500)
        })
    }, [])

    if (!visible) return null

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-bg-primary)] transition-opacity duration-500 ${
            fadeOut ? "opacity-0" : "opacity-100"
        }`}>
            <div className="flex items-center gap-4">
                <div className="relative h-7 w-7">
                    <div className="absolute inset-0 rounded-full border-2 border-[var(--color-border-primary)]" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--color-text-primary)] animate-spin" />
                </div>
                <p className="text-sm text-[var(--color-text-muted)] font-medium">Загрузка...</p>
            </div>
        </div>
    )
}