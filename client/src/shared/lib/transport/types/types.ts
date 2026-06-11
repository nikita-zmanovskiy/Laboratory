export interface ITransport {
    connect(): Promise<void>
    send(data: unknown): void
    close(reason?: string): void
}

export interface WSOptionsData {
    url?: string
    token?: string
    reconnect?: boolean
    reconnectDelay?: number
    maxReconnectAttempts?: number
}

export interface WSOptionsHandlers<T = unknown> {
    getUrl?: () => Promise<string>
    onMessage?: (msg: T) => void
    onOpen?: () => void
    onClose?: (event: CloseEvent) => void
    onError?: (error: Event | Error) => void
}

export type WSOptions<T = unknown> = WSOptionsData & WSOptionsHandlers<T>