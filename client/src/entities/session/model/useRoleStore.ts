import { create } from "zustand"

export type UserRole = "student" | "teacher" | null

const readRoleFromStorage = () => {
    if (typeof window === "undefined") {
        return { role: null as UserRole, classroomCode: null as string | null, expiresAt: null as string | null }
    }
    const role = (localStorage.getItem("role") || null) as UserRole
    return {
        role: role || null,
        classroomCode: localStorage.getItem("classroomCode"),
        expiresAt: localStorage.getItem("expiresAt"),
    }
}

interface RoleStore {
    role: UserRole
    classroomCode: string | null
    expiresAt: string | null
    setRole: (role: UserRole) => void
    setClassroomCode: (code: string) => void
    setExpiresAt: (expiresAt: string) => void
    reset: () => void
    exitChat: () => void
    loadFromStorage: () => void
    logout: () => void
}

export const useRoleStore = create<RoleStore>((set) => ({
    ...readRoleFromStorage(),
    setRole: (role) => {
        localStorage.setItem("role", role || "")
        set({ role })
    },
    setClassroomCode: (code) => {
        localStorage.setItem("classroomCode", code)
        set({ classroomCode: code })
    },
    setExpiresAt: (expiresAt) => {
        localStorage.setItem("expiresAt", expiresAt)
        set({ expiresAt })
    },
    exitChat: () => {
        localStorage.removeItem("role")
        localStorage.removeItem("classroomCode")
        localStorage.removeItem("expiresAt")
        set({ role: null, classroomCode: null, expiresAt: null })
    },
    reset: () => {
        localStorage.removeItem("role")
        localStorage.removeItem("classroomCode")
        localStorage.removeItem("expiresAt")
        localStorage.removeItem("currentClass")
        set({ role: null, classroomCode: null, expiresAt: null })
    },
    logout: () => {
        localStorage.removeItem("role")
        set({ role: null })
    },
    loadFromStorage: () => {
        const role = localStorage.getItem("role") as UserRole || null
        const classroomCode = localStorage.getItem("classroomCode")
        const expiresAt = localStorage.getItem("expiresAt")
        if (role) set({ role, classroomCode, expiresAt })
    },
}))