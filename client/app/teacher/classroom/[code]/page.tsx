"use client"

import { useParams } from "next/navigation"
import { TeacherPanelContainer } from "@/features/teacher-panel"

export default function ClassroomPage() {
    const params = useParams()
    const code = params.code as string

    return <TeacherPanelContainer key={code} code={code} />
}