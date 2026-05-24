function httpBaseToWsBase(httpUrl: string): string {
    const url = new URL(httpUrl)
    const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:"
    return `${wsProtocol}//${url.host}`
}

function getWsBaseUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_WS_URL?.trim()
    if (explicit) {
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
