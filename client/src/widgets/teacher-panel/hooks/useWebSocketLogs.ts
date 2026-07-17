import { useCallback, useEffect, useRef, useState } from "react"

import { getWebSocketAuthToken } from "@/entities/classroom"

import { WSTransport } from "@/shared/lib/transport/wsTransport"
import { getClassroomWebSocketUrl } from "@/shared/lib/wsUrl"

import { LogEntry, RealtimeLogMessage, UseWebSocketLogsReturn } from "../types"


export const useWebSocketLogs = (classroomCode: string): UseWebSocketLogsReturn => {
    const [realtimeLogs, setRealtimeLogs] = useState<LogEntry[]>([]),
     [isConnected, setIsConnected] = useState(false)

     const transportRef = useRef<WSTransport<RealtimeLogMessage> | null>(null),
     callbackRef = useRef<(() => void) | null>(null)

    const onNewLog = useCallback((callback: () => void) => {
        callbackRef.current = callback
    }, [])

    const createSocketUrl = useCallback(async () => {
        const { token } = await getWebSocketAuthToken(classroomCode)
        return getClassroomWebSocketUrl(classroomCode, token)
    }, [classroomCode])

    const handleMessage = useCallback((data: RealtimeLogMessage) => {
        if (data.type !== "new_log" || !data.log) {
            return
        }

        const newLog = data.log

        setRealtimeLogs((prev) => {
            const exists = prev.some((log) => log.id === newLog.id)

            if (exists) {
                return prev
            }

            return [newLog, ...prev].slice(0, 5)
        })
        callbackRef.current?.()
    }, [])

    useEffect(() => {
        if (!classroomCode) {
            return
        }

        setIsConnected(false)

        const transport = new WSTransport<RealtimeLogMessage>({
            getUrl: createSocketUrl,
            onOpen: () => {
                setIsConnected(true)
            },
            onMessage: handleMessage,
            onClose: () => {
                setIsConnected(false)
            },
            onError: () => {
                setIsConnected(false)
            },
            reconnectDelay: 5000,
        })

        transportRef.current = transport
        void transport.connect()

        return () => {
            transport.close("unmount")
            transportRef.current = null
        }
    }, [classroomCode, createSocketUrl, handleMessage])

    return { realtimeLogs, isConnected, onNewLog }
}
