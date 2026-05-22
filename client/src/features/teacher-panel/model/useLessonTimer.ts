import { useState, useEffect } from "react"

interface UseLessonTimerReturn {
    isExpired: boolean
}

export const useLessonTimer = (expiresAt: string | null): UseLessonTimerReturn => {
    const [isExpired, setIsExpired] = useState(false)

    useEffect(() => {
        if (!expiresAt) return

        const check = () => {
            if (new Date(expiresAt).getTime() <= Date.now()) {
                setIsExpired(true)
            }
        }

        check()
        const interval = setInterval(check, 1000)
        return () => clearInterval(interval)
    }, [expiresAt])

    return { isExpired }
}