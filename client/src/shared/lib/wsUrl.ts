/**
 * Преобразует HTTP URL в WebSocket URL заменой протокола
 * http: -> ws:, https: -> wss:
 *
 * @param httpUrl - HTTP URL строка
 * @returns WebSocket URL строка с тем же хостом и ws/wss протоколом
 */

/**
 * Получает базовый WebSocket URL
 *
 * Приоритет: явная переменная NEXT_PUBLIC_WS_URL
 * Если её нет - преобразует NEXT_PUBLIC_BACKEND_URL из http в ws
 * Если и её нет - использует window.location на клиенте или localhost:3000 на сервере
 *
 * @returns базовый WebSocket URL без пути и параметров
 */

/**
 * Формирует полный WebSocket URL для подключения к классу
 *
 * Добавляет к базовому URL путь /ws и параметры classroom и token
 *
 * @param classroomCode - код класса
 * @param token - токен авторизации WebSocket
 * @returns полный WebSocket URL с параметрами
 */

function httpBaseToWsBase(httpUrl: string): string {
    const url = new URL(httpUrl),
     wsProtocol = url.protocol === "https:" ? "wss:" : "ws:"
    return `${wsProtocol}//${url.host}`
}

function getWsBaseUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_WS_URL?.trim()
    if (explicit) {
        // удаляем последний слэш если он есть
        return explicit.replace(/\/$/, "")
    }

    const backendHttp = process.env.NEXT_PUBLIC_BACKEND_URL?.trim()
    if (backendHttp) {
        return httpBaseToWsBase(backendHttp)
    }

    if (typeof window !== "undefined") {
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"
        return `${wsProtocol}//${window.location.host}`
    }

    return httpBaseToWsBase("http://localhost:3000")
}

export function getClassroomWebSocketUrl(classroomCode: string, token: string): string {
    const params = new URLSearchParams({
        classroom: classroomCode,
        token,
    })
    return `${getWsBaseUrl()}/ws?${params.toString()}`
}
