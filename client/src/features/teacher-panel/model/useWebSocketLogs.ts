import { useState, useEffect, useRef, useCallback } from "react"
import { closeWebSocket } from "@/shared/lib/closeWebSocket"
import { getClassroomWebSocketUrl } from "@/shared/lib/wsUrl"

export interface LogEntry {
    id: number
    timestamp: string
    session_id: string
    mode: string
    prompt_hash: string
    image_attached: boolean
    tokens_input: number
    tokens_output: number
    status: number
    response_time_ms: number
    error_message: string | null
}

interface UseWebSocketLogsReturn {
    realtimeLogs: LogEntry[]
    isConnected: boolean
    onNewLog: (callback: () => void) => void
}

export const useWebSocketLogs = (classroomCode: string): UseWebSocketLogsReturn => {
    const [realtimeLogs, setRealtimeLogs] = useState<LogEntry[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const wsRef = useRef<WebSocket | null>(null)
    const callbackRef = useRef<(() => void) | null>(null)

    const onNewLog = useCallback((callback: () => void) => {
        callbackRef.current = callback
    }, [])

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return

        const ws = new WebSocket(getClassroomWebSocketUrl(classroomCode))

        ws.onopen = () => {
            setIsConnected(true)
        }

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === "new_log" && data.log) {
                    setRealtimeLogs((prev) => {
                        const exists = prev.some(l => l.id === data.log.id)
                        if (exists) return prev
                        return [data.log, ...prev].slice(0, 5)
                    })
                    callbackRef.current?.()
                }
            } catch {
           
            }
        }

        ws.onclose = (event) => {
            setIsConnected(false)
            if (event.code !== 1000) {
                setTimeout(connect, 5000)
            }
        }

        ws.onerror = () => {
            // onclose сработает сам
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

    return { realtimeLogs, isConnected, onNewLog }
}
