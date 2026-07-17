import type { AxiosRequestConfig } from "axios"

import { ensureCsrfSession } from "@/shared/api/csrf"
import { http } from "@/shared/api/http"
import { apiRoutes } from "@/shared/config/router/apiRoutes"

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


/**
 * Создаёт новый класс
 *
 * Инициализирует CSRF сессию перед запросом
 *
 * @param title - название класса
 * @param grade - номер класса
 * @param durationMinutes - длительность урока в минутах
 * @param sessionId - идентификатор сессии для CSRF
 * @returns созданный класс
 */

/**
 * Присоединяется к классу по коду
 *
 * @param code - код класса из 6 символов
 * @param studentId - идентификатор студента (по умолчанию 1)
 * @returns объект с опциональным expires_at
 */

/**
 * Получает логи класса с пагинацией и фильтрацией
 *
 * @param code - код класса
 * @param page - номер страницы (по умолчанию 1)
 * @param limit - количество записей на странице (по умолчанию 20)
 * @param filters - фильтры логов (опционально)
 * @param config - дополнительные настройки axios запроса (например signal для отмены)
 * @returns результат с массивом логов и информацией о пагинации
 */

/**
 * Получает статистику класса
 *
 * @param code - код класса
 * @returns объект со статистикой и опциональным expires_at
 */

/**
 * Продлевает время действия класса
 *
 * @param code - код класса
 * @param additionalMinutes - количество дополнительных минут
 * @returns объект с новой датой истечения
 */

/**
 * Деактивирует класс (завершает урок досрочно)
 *
 * @param code - код класса
 * @returns данные ответа сервера
 */

/**
 * Устанавливает превью-сессию учителя для предпросмотра класса
 *
 * @param code - код класса
 * @returns объект с данными превью-сессии
 */

/**
 * Экспортирует логи класса в CSV формате
 *
 * @param code - код класса
 * @returns Blob с CSV данными
 */

/**
 * Получает токен для WebSocket подключения к классу
 *
 * @param classroomCode - код класса
 * @returns объект с токеном и ролью (teacher или student)
 */

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

	// Review 26.06.2026 - супер, именно так и должен использоваться маппинг данных 👍
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

// Review 26.06.2026 - тут лучше поправить наименований функции, что бы избежать коллизий. - done
export const fetchClassroomLogs = async (
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
