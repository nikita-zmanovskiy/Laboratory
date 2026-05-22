"use client"

import { useEffect, useRef, useState, useCallback } from "react"

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

        const wsUrl = `ws://localhost:3000/ws?classroom=${classroomCode}`
        const ws = new WebSocket(wsUrl)

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
                wsRef.current.onclose = null
                wsRef.current.close(1000, "unmount")
            }
        }
    }, [connect])

    return { isClosed, closeMessage, onExtend }
}