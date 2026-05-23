"use client"

import { useParams } from "next/navigation"
import { TeacherPanelContainer } from "@/features/teacher-panel"

export default function ClassroomPage() {
    const params = useParams()
    const code = params.code as string

    return  (
        <>
            <title>Промт-инженер | Лаборатория ИИ</title>
            <TeacherPanelContainer key={code} code={code} />
        </>
    )
    
}