export function closeWebSocket(socket: WebSocket, reason = "unmount"): void {
    socket.onclose = null
    socket.onopen = null
    socket.onmessage = null
    socket.onerror = null

    if (socket.readyState === WebSocket.OPEN) {
        socket.close(1000, reason)
        return
    }

    if (socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener(
            "open",
            () => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.close(1000, reason)
                }
            },
            { once: true }
        )
    }
}
