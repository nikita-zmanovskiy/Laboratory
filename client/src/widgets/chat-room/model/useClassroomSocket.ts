"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { closeWebSocket } from "@/shared/lib/closeWebSocket"
import { getClassroomWebSocketUrl } from "@/shared/lib/wsUrl"

interface UseClassroomSocketReturn {
    isClosed: boolean
    closeMessage: string
    onExtend: (callback: (newExpiresAt: string) => void) => void
}

export const useClassroomSocket = (classroomCode: string): UseClassroomSocketReturn => {
    const [isClosed, setIsClosed] = useState(false)
    const [closeMessage, setCloseMessage] = useState("")
    const wsRef = useRef<WebSocket | null>(null)
    const extendCallbackRef = useRef<((newExpiresAt: string) => void) | null>(null)

    const onExtend = useCallback((callback: (newExpiresAt: string) => void) => {
        extendCallbackRef.current = callback
    }, [])

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return

        const ws = new WebSocket(getClassroomWebSocketUrl(classroomCode))

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === "classroom_closed") {
                    setIsClosed(true)
                    setCloseMessage(data.message || "Урок завершен")
                }
                if (data.type === "classroom_extended") {
                    localStorage.setItem("expiresAt", data.new_expires_at)
                    extendCallbackRef.current?.(data.new_expires_at)
                }
            } catch {
                // ignore
            }
        }

        ws.onclose = (event) => {
            if (event.code !== 1000) {
                setTimeout(connect, 5000)
            }
        }

        wsRef.current = ws
    }, [classroomCode])

    useEffect(() => {
        connect()
        return () => {
            if (wsRef.current) {
                closeWebSocket(wsRef.current)
                wsRef.current = null
            }
        }
    }, [connect])

    return { isClosed, closeMessage, onExtend }
}
