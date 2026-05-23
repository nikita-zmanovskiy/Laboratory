"use client"

import { useEffect } from "react"

import { CreateClassroomContainer } from "@/features/create-classroom"

import { useSessionStore } from "@/entities/session"

export default function TeacherPage() {
    const initialize = useSessionStore((state) => state.initialize)

    useEffect(() => {
        initialize()
    }, [initialize])

    return <CreateClassroomContainer />
}