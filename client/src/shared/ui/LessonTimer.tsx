"use client"

import { useState, useEffect } from "react"

interface LessonTimerProps {
    expiresAt: string
}

export const LessonTimer = ({ expiresAt }: LessonTimerProps) => {
    const [timeLeft, setTimeLeft] = useState("")

    useEffect(() => {
        const update = () => {
            const now = Date.now()
            const end = new Date(expiresAt).getTime()
            const diff = end - now

            if (diff <= 0) {
                setTimeLeft("Урок завершен")
                return
            }

            const hours = Math.floor(diff / 3600000)
            const minutes = Math.floor((diff % 3600000) / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)

            if (hours > 0) {
                setTimeLeft(`${hours}ч ${minutes}м`)
            } else if (minutes > 0) {
                setTimeLeft(`${minutes}м ${seconds}с`)
            } else {
                setTimeLeft(`${seconds}с`)
            }
        }

        update()
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [expiresAt])

    const isEnding = timeLeft.includes("м") && parseInt(timeLeft) < 5
    const isFinished = timeLeft === "Урок завершен"

    return (
        <span className={`flex items-center gap-1.5 text-xs font-medium ${
            isFinished ? "text-[var(--color-text-error)]" : isEnding ? "text-[var(--color-warning)]" : "text-[var(--color-text-success)]"
        }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
                isFinished ? "bg-[var(--color-danger)]" : isEnding ? "bg-[var(--color-warning)] animate-pulse" : "bg-[var(--color-success)] animate-pulse"
            }`} />
            {isFinished ? "Урок завершен" : `Урок идет: ${timeLeft}`}
        </span>
    )
}