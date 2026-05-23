"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useRoleStore } from "@/features/role-select"

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const role = useRoleStore((state) => state.role)
    const classroomCode = useRoleStore((state) => state.classroomCode)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        if (pathname === "/") return

        if (!role) {
            if (pathname.startsWith("/teacher/classroom/")) {
                try {
                    const stored = localStorage.getItem("currentClass")
                    if (stored) {
                        const parsed = JSON.parse(stored)
                        if (new Date(parsed.expires_at).getTime() > Date.now()) {
                            return
                        }
                    }
                } catch {
                    // ignore
                }
            }
            router.push("/")
            return
        }

        if (pathname === "/chat" && role !== "student") {
            if (role === "teacher") {
                try {
                    const stored = localStorage.getItem("currentClass")
                    if (stored) {
                        const parsed = JSON.parse(stored)
                        if (new Date(parsed.expires_at).getTime() > Date.now()) {
                            return
                        }
                    }
                } catch {
                    // ignore
                }
            }
            router.push("/")
            return
        }

        if (pathname.startsWith("/teacher") && role !== "teacher") {
            router.push("/")
            return
        }
    }, [role, classroomCode, pathname, router])

    return <>{children}</>
}