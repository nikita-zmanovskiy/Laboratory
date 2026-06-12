/**
 * Безопасно закрывает WebSocket соединение
 *
 * Сначала удаляет все обработчики событий (onclose, onopen, onmessage, onerror)
 * Если сокет уже открыт (OPEN) - закрывает его с кодом 1000 и указанной причиной
 * Если сокет в процессе подключения (CONNECTING) - подписывается на событие open
 * и закрывает соединение как только оно установится
 *
 * @param socket - экземпляр WebSocket для закрытия
 * @param reason - причина закрытия (по умолчанию "unmount")
 */

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
