"use client"

import { useParams } from "next/navigation"

import { TeacherPanelContainer } from "@/widgets/teacher-panel"

export function ClassroomPageClient() {
    const params = useParams()
    const code = (params?.code ?? "") as string

    return <TeacherPanelContainer code={code} />
}
