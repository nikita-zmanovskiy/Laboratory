import type { AxiosRequestConfig } from "axios"

import { ensureCsrfSession } from "./csrf"
import { http } from "./http"

interface CreateClassroomResponse {
    id: string
    code: string
    title: string
    is_active: boolean
    expires_at: string
}

export interface ClassroomLog {
    id: number
    timestamp: string
    classroom_id: string | null
    session_id: string
    mode: "text" | "image" | string
    prompt_hash: string | null
    image_attached: boolean
    tokens_input: number | null
    tokens_output: number | null
    tokens_is_approximate?: boolean
    status: number
    response_time_ms: number
    error_message: string | null
}

export interface ClassroomStats {
    total_requests: number
    text_requests: number
    image_requests: number
    errors: number
    avg_response_time: number
    active_sessions: number
    first_request: string | null
    last_request: string | null
    error_rate: string
    expires_at: string | null
    top_students: Array<{ session_id: string; requests: number; avg_tokens: number }>
    charts: {
        tokens_over_time: Array<{ timestamp: string; input: number; output: number }>
        requests_per_minute: Array<{ minute: string; count: number }>
        mode_distribution: { text: number; image: number }
        avg_tokens_per_request: number
        avg_response_time: number
        error_rate: number
        total_requests: number
        active_students: number
    }
}

export interface ClassroomLogsResponse {
    logs: ClassroomLog[]
    total: number
    page: number
    total_pages: number
}

export interface ClassroomStatsResponse {
    stats: ClassroomStats
    expires_at?: string | null
}

export interface LogFilters {
    search?: string
    mode?: string
    status?: string
    image_attached?: string
    sort?: string
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
	filters?: LogFilters,
	config?: Pick<AxiosRequestConfig, "signal">
): Promise<ClassroomLogsResponse> => {
	const response = await http.get("/api/logs", {
		...config,
		params: {
			classroom_code: code,
			page,
			limit,
			...filters,
		},
	})

	return response.data
}

export const getClassroomStats = async (code: string): Promise<ClassroomStatsResponse> => {
    const response = await http.get<ClassroomStatsResponse>(`/api/stats/${code}`)
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
