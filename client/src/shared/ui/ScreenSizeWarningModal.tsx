"use client"

import { useEffect, useState } from "react"

export const ScreenSizeWarning = () => {
    const [isSmall, setIsSmall] = useState(false)

    useEffect(() => {
        const check = () => setIsSmall(window.innerWidth < 768)
        check()
        window.addEventListener("resize", check)
        return () => window.removeEventListener("resize", check)
    }, [])

    if (!isSmall) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-warning)]/10 border-b border-[var(--color-warning)]/20 backdrop-blur-sm px-4 py-2 text-center">
            <span className="text-xs font-medium text-[var(--color-warning)]">
                Экран меньше 768px, интерфейс может отображаться некорректно
            </span>
        </div>
    )
}