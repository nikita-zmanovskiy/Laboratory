type WSMessage = any

interface WSOptions {
  url: string
  token?: string
  onMessage?: (msg: WSMessage) => void
  onOpen?: () => void
  onClose?: (event: CloseEvent) => void
  reconnect?: boolean
}

export class WSTransport {
  private ws: WebSocket | null = null
  private url: string
  private token?: string
  private reconnect: boolean
  private reconnectTimeout: number = 5000
  private onMessage?: (msg: WSMessage) => void
  private onOpen?: () => void
  private onClose?: (event: CloseEvent) => void

  constructor(options: WSOptions) {
    this.url = options.url
    this.token = options.token
    this.onMessage = options.onMessage
    this.onOpen = options.onOpen
    this.onClose = options.onClose
    this.reconnect = options.reconnect ?? true
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return

    const urlWithToken = this.token ? `${this.url}?token=${this.token}` : this.url
    this.ws = new WebSocket(urlWithToken)

    this.ws.onopen = () => {
      this.onOpen?.()
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.onMessage?.(data)
      } catch {
        // ignore
      }
    }

    this.ws.onclose = (event) => {
      this.onClose?.(event)
      if (this.reconnect && event.code !== 1000) {
        setTimeout(() => this.connect(), this.reconnectTimeout)
      }
    }

    this.ws.onerror = () => {
      this.close()
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn("WebSocket not open")
    }
  }

  close(reason = "manual") {
    if (!this.ws) return
    this.ws.onopen = null
    this.ws.onmessage = null
    this.ws.onclose = null
    this.ws.onerror = null
    if (this.ws.readyState === WebSocket.OPEN) this.ws.close(1000, reason)
    this.ws = null
  }
}