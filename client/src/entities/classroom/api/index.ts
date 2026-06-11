import type { AxiosRequestConfig } from "axios"

import { ensureCsrfSession } from "@/shared/api/csrf"
import { http } from "@/shared/api/http"
import { apiRoutes } from "@/shared/config/apiRoutes"

import type {
    Classroom,
    ClassroomLogsResult,
    ClassroomStatsResult,
    ExtendClassroomResult,
    JoinedClassroom,
    LogFilters,
    TeacherPreviewSession,
    WebSocketAuthToken,
} from "../types"

import type {
    ClassroomLogsResponseDto,
    ClassroomStatsResponseDto,
    CreateClassroomResponseDto,
    ExtendClassroomResponseDto,
    JoinClassroomResponseDto,
    TeacherPreviewSessionResponseDto,
    WebSocketAuthResponseDto,
} from "./dto"
import {
    mapClassroomDtoToModel,
    mapClassroomLogsDtoToModel,
    mapClassroomStatsResponseDtoToModel,
    mapExtendClassroomDtoToModel,
    mapJoinedClassroomDtoToModel,
    mapTeacherPreviewSessionDtoToModel,
    mapWebSocketAuthDtoToModel,
} from "./mappers"

export const createClassroom = async (
    title: string,
    grade: number,
    durationMinutes: number,
    sessionId: string
): Promise<Classroom> => {
    await ensureCsrfSession(sessionId)

    const response = await http.post<CreateClassroomResponseDto>(apiRoutes.classrooms, {
        title,
        grade,
        expires_in_minutes: durationMinutes,
    })

    return mapClassroomDtoToModel(response.data)
}

export const joinClassroom = async (
    code: string,
    studentId = 1
): Promise<JoinedClassroom> => {
    const response = await http.get<JoinClassroomResponseDto>(apiRoutes.classroomJoin(code), {
        params: { student_id: studentId },
    })

    return mapJoinedClassroomDtoToModel(response.data)
}

export const getClassroomLogs = async (
    code: string,
    page = 1,
    limit = 20,
    filters?: LogFilters,
    config?: Pick<AxiosRequestConfig, "signal">
): Promise<ClassroomLogsResult> => {
    const response = await http.get<ClassroomLogsResponseDto>(apiRoutes.logs, {
        ...config,
        params: {
            classroom_code: code,
            page,
            limit,
            ...filters,
        },
    })

    return mapClassroomLogsDtoToModel(response.data)
}

export const getClassroomStats = async (code: string): Promise<ClassroomStatsResult> => {
    const response = await http.get<ClassroomStatsResponseDto>(apiRoutes.stats(code))

    return mapClassroomStatsResponseDtoToModel(response.data)
}

export const extendClassroom = async (
    code: string,
    additionalMinutes: number
): Promise<ExtendClassroomResult> => {
    const response = await http.post<ExtendClassroomResponseDto>(
        apiRoutes.classroomExtend(code),
        {
            additional_minutes: additionalMinutes,
        }
    )

    return mapExtendClassroomDtoToModel(response.data)
}

export const deactivateClassroom = async (code: string): Promise<unknown> => {
    const response = await http.post(apiRoutes.classroomDeactivate(code), {})

    return response.data
}

export const establishTeacherPreviewSession = async (
    code: string
): Promise<TeacherPreviewSession> => {
    const response = await http.post<TeacherPreviewSessionResponseDto>(
        apiRoutes.classroomTeacherSession(code)
    )

    return mapTeacherPreviewSessionDtoToModel(response.data)
}

export const exportLogsCsv = async (code: string): Promise<Blob> => {
    const response = await http.get<Blob>(apiRoutes.logsExport, {
        params: { classroom_code: code },
        responseType: "blob",
    })

    return response.data
}

export const getWebSocketAuthToken = async (
    classroomCode: string
): Promise<WebSocketAuthToken> => {
    const response = await http.get<WebSocketAuthResponseDto>(apiRoutes.webSocketToken, {
        params: { classroom_code: classroomCode },
    })

    return mapWebSocketAuthDtoToModel(response.data)
}
