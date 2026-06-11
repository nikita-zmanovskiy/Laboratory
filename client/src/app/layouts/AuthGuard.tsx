"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { getCurrentClassFromStorage } from "@/entities/classroom"
import { useRoleStore } from "@/entities/session"

import {
    appRoutes,
    isPublicRoute,
    isTeacherClassroomRoute,
    isTeacherRoute,
} from "@/shared/config/routes"

const hasActiveTeacherClass = () => {
    const currentClass = getCurrentClassFromStorage()
    return Boolean(currentClass)
}

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const role = useRoleStore((state) => state.role),
     classroomCode = useRoleStore((state) => state.classroomCode),
     pathname = usePathname(),
     router = useRouter()

    useEffect(() => {
        if (isPublicRoute(pathname)) {
            return
        }

        if (!role) {
            if (isTeacherClassroomRoute(pathname) && hasActiveTeacherClass()) {
                return
            }

            router.push(appRoutes.home)
            return
        }

        if (pathname === appRoutes.chat && role !== "student") {
            if (role === "teacher" && hasActiveTeacherClass()) {
                return
            }

            router.push(appRoutes.home)
            return
        }

        if (isTeacherRoute(pathname) && role !== "teacher") {
            router.push(appRoutes.home)
        }
    }, [role, classroomCode, pathname, router])

    return <>{children}</>
}
