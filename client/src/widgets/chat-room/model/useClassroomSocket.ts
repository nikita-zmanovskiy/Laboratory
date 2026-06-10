"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { getWebSocketAuthToken } from "@/shared/api"
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
    const connectingRef = useRef(false)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const reconnectAttemptsRef = useRef(0)

    const onExtend = useCallback((callback: (newExpiresAt: string) => void) => {
        extendCallbackRef.current = callback
    }, [])

    const clearReconnectTimeout = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }
    }, [])

    const scheduleReconnect = useCallback(() => {
        clearReconnectTimeout()
        const delay = Math.min(5000 * 2 ** reconnectAttemptsRef.current, 60000)
        reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1
            void connect()
        }, delay)
    }, [clearReconnectTimeout])

    const connect = useCallback(async () => {
        if (wsRef.current?.readyState === WebSocket.OPEN || connectingRef.current) return

        connectingRef.current = true

        try {
            const { token } = await getWebSocketAuthToken(classroomCode)
            const ws = new WebSocket(getClassroomWebSocketUrl(classroomCode, token))

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
                wsRef.current = null
                if (event.code !== 1000) {
                    scheduleReconnect()
                }
            }

            ws.onerror = () => {
                ws?.close()
            }

            wsRef.current = ws
            reconnectAttemptsRef.current = 0 // сбрасываем счетчик при успешном подключении
        } catch {
            scheduleReconnect()
        } finally {
            connectingRef.current = false
        }
    }, [classroomCode, scheduleReconnect])

    useEffect(() => {
        void connect()
        return () => {
            if (wsRef.current) {
                closeWebSocket(wsRef.current)
                wsRef.current = null
            }
            clearReconnectTimeout()
        }
    }, [connect, clearReconnectTimeout])

    return { isClosed, closeMessage, onExtend }
}