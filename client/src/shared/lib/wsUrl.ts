function httpBaseToWsBase(httpUrl: string): string {
    const url = new URL(httpUrl)
    const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:"
    return `${wsProtocol}//${url.host}`
}

export function getClassroomWebSocketUrl(classroomCode: string): string {
    const explicit = process.env.NEXT_PUBLIC_WS_URL?.trim()
    if (explicit) {
        return `${explicit.replace(/\/$/, "")}/ws?classroom=${encodeURIComponent(classroomCode)}`
    }

    const backendHttp = process.env.NEXT_PUBLIC_BACKEND_URL?.trim()
    let base: string

    if (backendHttp) {
        base = httpBaseToWsBase(backendHttp)
    } else if (typeof window !== "undefined") {
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"
        base = `${wsProtocol}//${window.location.host}`
    } else {
        base = httpBaseToWsBase("http://localhost:3000")
    }

    return `${base}/ws?classroom=${encodeURIComponent(classroomCode)}`
}
