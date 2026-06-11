import type { CurrentClassroom } from "../types"

const STORAGE_KEY = "currentClass"

export const isClassroomActive = (expiresAt: string) => {
    return new Date(expiresAt).getTime() > Date.now()
}

export const getCurrentClassFromStorage = (): CurrentClassroom | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)

        if (!stored) {
            return null
        }

        const parsed = JSON.parse(stored) as CurrentClassroom & { token?: string }

        if (!parsed.code || !parsed.expires_at) {
            return null
        }

        if (!isClassroomActive(parsed.expires_at)) {
            localStorage.removeItem(STORAGE_KEY)
            return null
        }

        const { token: _token, ...currentClass } = parsed

        if (_token) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentClass))
        }

        return currentClass
    } catch {
        localStorage.removeItem(STORAGE_KEY)
        return null
    }
}

export const setCurrentClassToStorage = (classroom: CurrentClassroom) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classroom))
}

export const updateCurrentClassExpiresAt = (expiresAt: string) => {
    const currentClass = getCurrentClassFromStorage()

    if (!currentClass) {
        return
    }

    setCurrentClassToStorage({
        ...currentClass,
        expires_at: expiresAt,
    })
}

export const clearCurrentClassStorage = () => {
    localStorage.removeItem(STORAGE_KEY)
}
