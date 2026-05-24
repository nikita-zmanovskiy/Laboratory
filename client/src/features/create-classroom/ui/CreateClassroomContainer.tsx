"use client"

import { useEffect,useState } from "react"
import { useRouter } from "next/navigation"

import { useRoleStore } from "@/features/role-select"

import { useCreateClassroom } from "../model/useCreateClassroom"

import { CreateClassroomForm } from "./CreateClassroomForm"

export const CreateClassroomContainer = () => {
    const router = useRouter(),
     props = useCreateClassroom(),
     [currentClass, setCurrentClass] = useState<{ code: string; title: string; expires_at: string } | null>(null)

    const syncCurrentClass = () => {
        const stored = localStorage.getItem("currentClass")
        if (!stored) {
            setCurrentClass(null)
            return
        }
        try {
            const parsed = JSON.parse(stored) as { code: string; title: string; expires_at: string; token?: string }
            if (new Date(parsed.expires_at).getTime() > Date.now()) {
                const { token: _removed, ...safe } = parsed
                setCurrentClass(safe)
                if (_removed) {
                    localStorage.setItem("currentClass", JSON.stringify(safe))
                }
            } else {
                localStorage.removeItem("currentClass")
                setCurrentClass(null)
            }
        } catch {
            localStorage.removeItem("currentClass")
            setCurrentClass(null)
        }
    }

    useEffect(() => {
        syncCurrentClass()
        window.addEventListener("focus", syncCurrentClass)
        return () => window.removeEventListener("focus", syncCurrentClass)
    }, [])

    const [isOpeningClass, setIsOpeningClass] = useState(false),
     setRole = useRoleStore((state) => state.setRole),
     setClassroomCode = useRoleStore((state) => state.setClassroomCode),
     setExpiresAt = useRoleStore((state) => state.setExpiresAt)

    const handleOpenCurrentClass = () => {
        if (!currentClass) return
        setIsOpeningClass(true)
        setRole("teacher")
        setClassroomCode(currentClass.code)
        setExpiresAt(currentClass.expires_at)
        router.push(`/teacher/classroom/${currentClass.code}`)
    }

    return (
        <CreateClassroomForm
            title={props.title}
            grade={props.grade}
            duration={props.duration}
            isLoading={props.isLoading || isOpeningClass}
            error={props.error}
            durationOptions={props.durationOptions}
            onTitleChange={props.setTitle}
            onGradeChange={props.setGrade}
            onDurationChange={props.setDuration}
            onSubmit={props.handleCreate}
            onBack={() => router.push("/")}
            currentClass={currentClass}
            onOpenCurrentClass={handleOpenCurrentClass}
            loadingMessage={
                isOpeningClass && !props.isLoading ? "Открываем урок..." : "Создаём класс..."
            }
        />
    )
}