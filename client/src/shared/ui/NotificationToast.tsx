"use client"

import { useEffect, useState } from "react"

interface NotificationToastProps {
    message: string
    duration?: number
    onClose: () => void
}

export const NotificationToast = ({ message, duration = 5000, onClose }: NotificationToastProps) => {
    const [isLeaving, setIsLeaving] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLeaving(true)
            setTimeout(onClose, 300)
        }, duration)
        return () => clearTimeout(timer)
    }, [duration, onClose])

    return (
        <div className={`fixed top-4 left-4 z-50 transition-all duration-300 ${
            isLeaving ? "translate-x-[-100%] opacity-0" : "translate-x-0 opacity-100"
        }`}>
            <div className="flex items-center gap-3 rounded-xl border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/10 backdrop-blur-sm px-4 py-3 shadow-lg">
                <p className="text-sm font-medium text-[var(--color-warning)]">{message}</p>
            </div>
        </div>
    )
}