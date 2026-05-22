import { http } from "./http"
import { ensureCsrfSession } from "./csrf"

interface CreateClassroomResponse {
    id: string
    code: string
    title: string
    is_active: boolean
    expires_at: string
}

export const createClassroom = async (
    title: string,
    grade: number,
    durationMinutes: number,
    sessionId: string
): Promise<CreateClassroomResponse> => {
    await ensureCsrfSession(sessionId)

    const response = await http.post<CreateClassroomResponse>("/api/classrooms", {
        title,
        grade,
        expires_in_minutes: durationMinutes,
    })

    return response.data
}

export const getClassroomLogs = async (
    code: string,
    page = 1,
    limit = 20,
    filters?: {
        search?: string
        mode?: string
        status?: string
        image_attached?: string
        sort?: string
    }
) => {
    const response = await http.get(`/api/logs`, {
        params: {
            classroom_code: code,
            page,
            limit,
            ...filters,
        },
    })
    return response.data
}

export const getClassroomStats = async (code: string) => {
    const response = await http.get(`/api/stats/${code}`)
    return response.data
}

export const extendClassroom = async (code: string, additionalMinutes: number) => {
    const response = await http.post(`/api/classrooms/${code}/extend`, {
        additional_minutes: additionalMinutes,
    })
    return response.data
}

export const deactivateClassroom = async (code: string) => {
    const response = await http.post(`/api/classrooms/${code}/deactivate`, {})
    return response.data
}

/** Отдельная student-cookie для чата; lab_teacher не перезаписывается */
export const establishTeacherPreviewSession = async (code: string) => {
    const response = await http.post(`/api/classrooms/${code}/teacher-session`)
    return response.data as {
        classroom_code: string
        session_id: string
        expires_at: string
    }
}

export const exportLogsCsv = async (code: string) => {
    const response = await http.get(`/api/logs/export`, {
        params: { classroom_code: code },
        responseType: "blob",
    })
    return response.data
}
