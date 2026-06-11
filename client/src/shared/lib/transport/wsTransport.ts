import { closeWebSocket } from "./closeWebSocket"
import { ITransport, WSOptions } from "./types/types"



export class WSTransport<T = unknown> implements ITransport {
    private ws: WebSocket | null = null
    private url?: string
    private getUrl?: () => Promise<string>
    private token?: string
    private reconnect: boolean
    private reconnectDelay: number
    private maxReconnectAttempts: number
    private reconnectAttempts = 0
    private onMessage?: (msg: T) => void
    private onOpen?: () => void
    private onClose?: (event: CloseEvent) => void
    private onError?: (error: Event | Error) => void

    private isManualClose = false
    private connectPromise: Promise<void> | null = null

    constructor(options: WSOptions<T>) {
        this.url = options.url
        this.getUrl = options.getUrl
        this.token = options.token
        this.onMessage = options.onMessage
        this.onOpen = options.onOpen
        this.onClose = options.onClose
        this.onError = options.onError
        this.reconnect = options.reconnect ?? true
        this.reconnectDelay = options.reconnectDelay ?? 5000
        this.maxReconnectAttempts = options.maxReconnectAttempts ?? 5
    }

    async connect(): Promise<void> {
        if (this.isManualClose) {
            return
        }

        if (this.ws?.readyState === WebSocket.OPEN) {
            return
        }

        if (this.connectPromise) {
            return this.connectPromise
        }

        this.connectPromise = this._connect()
        try {
            await this.connectPromise
        } finally {
            this.connectPromise = null
        }
    }

    private async _connect(): Promise<void> {
        try {
            const resolvedUrl = this.getUrl ? await this.getUrl() : this.url

            if (!resolvedUrl || this.isManualClose) {
                return
            }

            const urlWithToken = this.token
                ? `${resolvedUrl}?token=${this.token}`
                : resolvedUrl

            this.ws = new WebSocket(urlWithToken)

            this.ws.onopen = () => {
                this.reconnectAttempts = 0
                this.onOpen?.()
            }

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as T
                    this.onMessage?.(data)
                } catch {
                    // ignore malformed messages
                }
            }

            this.ws.onclose = (event) => {
                this.ws = null
                this.onClose?.(event)
                this.scheduleReconnect(event.code)
            }

            this.ws.onerror = (error) => {
                this.onError?.(error)
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error))
            this.onError?.(err)
            this.scheduleReconnect()
        }
    }

    private scheduleReconnect(code?: number): void {
        if (this.isManualClose) {
            return
        }

        if (!this.reconnect) {
            return
        }

        if (code === 1000) {
            return
        }

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            return
        }

        this.reconnectAttempts++
        setTimeout(() => {
            void this.connect()
        }, this.reconnectDelay)
    }

    send(data: unknown): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data))
            return
        }

        console.warn("WebSocket not open")
    }

    close(reason = "manual"): void {
        this.isManualClose = true
        this.connectPromise = null

        if (this.ws) {
            closeWebSocket(this.ws, reason)
            this.ws = null
        }
    }

    reset(): void {
        this.isManualClose = false
        this.reconnectAttempts = 0
    }
}