import { useState, useEffect, useCallback } from "react"

interface UseLessonNotificationReturn {
    showNotification: boolean
    notificationMessage: string
    dismissNotification: () => void
}

export const useLessonNotification = (expiresAt: string | null): UseLessonNotificationReturn => {
    const [showNotification, setShowNotification] = useState(false)
    const [notificationMessage, setNotificationMessage] = useState("")
    const [dismissed, setDismissed] = useState(false)

    const checkTime = useCallback(() => {
        if (!expiresAt || dismissed) return

        const now = Date.now()
        const end = new Date(expiresAt).getTime()
        const diffMinutes = Math.floor((end - now) / 60000)

        if (diffMinutes === 5) {
            setShowNotification(true)
            setNotificationMessage("Осталось 5 минут до конца урока!")
        } else if (diffMinutes === 1) {
            setShowNotification(true)
            setNotificationMessage("Осталась 1 минута до конца урока!")
        }
    }, [expiresAt, dismissed])

    useEffect(() => {
        checkTime()
        const interval = setInterval(checkTime, 30000) // проверка каждые 30 сек
        return () => clearInterval(interval)
    }, [checkTime])

    const dismissNotification = useCallback(() => {
        setShowNotification(false)
        setDismissed(true)
    }, [])

    return { showNotification, notificationMessage, dismissNotification }
}