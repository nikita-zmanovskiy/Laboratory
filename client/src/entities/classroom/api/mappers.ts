import type {
    Classroom,
    ClassroomLog,
    ClassroomLogsResult,
    ClassroomStats,
    ClassroomStatsResult,
    ExtendClassroomResult,
    JoinedClassroom,
    TeacherPreviewSession,
    WebSocketAuthToken,
} from "../types"

import type {
    ClassroomLogDto,
    ClassroomLogsResponseDto,
    ClassroomStatsDto,
    ClassroomStatsResponseDto,
    CreateClassroomResponseDto,
    ExtendClassroomResponseDto,
    JoinClassroomResponseDto,
    TeacherPreviewSessionResponseDto,
    WebSocketAuthResponseDto,
} from "./dto"

/**
 * Преобразует DTO созданного класса в доменную модель Classroom
 *
 * @param dto - ответ сервера с данными созданного класса
 * @returns объект Classroom
 */

/**
 * Преобразует DTO присоединения к классу в доменную модель JoinedClassroom
 *
 * @param dto - ответ сервера с expires_at
 * @returns объект JoinedClassroom
 */

/**
 * Преобразует DTO записи лога в доменную модель ClassroomLog
 *
 * @param dto - объект лога от сервера
 * @returns объект ClassroomLog
 */

/**
 * Преобразует DTO статистики в доменную модель ClassroomStats
 *
 * Рекурсивно маппит вложенные массивы top_students и charts
 *
 * @param dto - объект статистики от сервера
 * @returns объект ClassroomStats
 */

/**
 * Преобразует DTO ответа с логами в доменную модель ClassroomLogsResult
 *
 * Маппит каждый лог через mapClassroomLogDtoToModel
 *
 * @param dto - ответ сервера с массивом логов и пагинацией
 * @returns объект ClassroomLogsResult
 */

/**
 * Преобразует DTO ответа со статистикой в доменную модель ClassroomStatsResult
 *
 * @param dto - ответ сервера со статистикой
 * @returns объект ClassroomStatsResult
 */

/**
 * Преобразует DTO превью-сессии учителя в доменную модель TeacherPreviewSession
 *
 * @param dto - ответ сервера с данными сессии
 * @returns объект TeacherPreviewSession
 */

/**
 * Преобразует DTO WebSocket авторизации в доменную модель WebSocketAuthToken
 *
 * @param dto - ответ сервера с токеном и ролью
 * @returns объект WebSocketAuthToken
 */

/**
 * Преобразует DTO продления класса в доменную модель ExtendClassroomResult
 *
 * @param dto - ответ сервера с новой датой истечения
 * @returns объект ExtendClassroomResult
 */

export const mapClassroomDtoToModel = (dto: CreateClassroomResponseDto): Classroom => ({
    id: dto.id,
    code: dto.code,
    title: dto.title,
    is_active: dto.is_active,
    expires_at: dto.expires_at,
})

export const mapJoinedClassroomDtoToModel = (
    dto: JoinClassroomResponseDto
): JoinedClassroom => ({
    expires_at: dto.expires_at,
})

export const mapClassroomLogDtoToModel = (dto: ClassroomLogDto): ClassroomLog => ({
    id: dto.id,
    timestamp: dto.timestamp,
    classroom_id: dto.classroom_id,
    session_id: dto.session_id,
    mode: dto.mode,
    prompt_hash: dto.prompt_hash,
    image_attached: dto.image_attached,
    tokens_input: dto.tokens_input,
    tokens_output: dto.tokens_output,
    tokens_is_approximate: dto.tokens_is_approximate,
    status: dto.status,
    response_time_ms: dto.response_time_ms,
    error_message: dto.error_message,
})

export const mapClassroomStatsDtoToModel = (dto: ClassroomStatsDto): ClassroomStats => ({
    total_requests: dto.total_requests,
    text_requests: dto.text_requests,
    image_requests: dto.image_requests,
    errors: dto.errors,
    avg_response_time: dto.avg_response_time,
    active_sessions: dto.active_sessions,
    first_request: dto.first_request,
    last_request: dto.last_request,
    error_rate: dto.error_rate,
    expires_at: dto.expires_at,
    top_students: dto.top_students.map((student) => ({
        session_id: student.session_id,
        requests: student.requests,
        avg_tokens: student.avg_tokens,
    })),
    charts: {
        tokens_over_time: dto.charts.tokens_over_time.map((point) => ({
            timestamp: point.timestamp,
            input: point.input,
            output: point.output,
        })),
        requests_per_minute: dto.charts.requests_per_minute.map((point) => ({
            minute: point.minute,
            count: point.count,
        })),
        mode_distribution: {
            text: dto.charts.mode_distribution.text,
            image: dto.charts.mode_distribution.image,
        },
        avg_tokens_per_request: dto.charts.avg_tokens_per_request,
        avg_response_time: dto.charts.avg_response_time,
        error_rate: dto.charts.error_rate,
        total_requests: dto.charts.total_requests,
        active_students: dto.charts.active_students,
    },
})

export const mapClassroomLogsDtoToModel = (
    dto: ClassroomLogsResponseDto
): ClassroomLogsResult => ({
    logs: dto.logs.map(mapClassroomLogDtoToModel),
    total: dto.total,
    page: dto.page,
    total_pages: dto.total_pages,
})

export const mapClassroomStatsResponseDtoToModel = (
    dto: ClassroomStatsResponseDto
): ClassroomStatsResult => ({
    stats: mapClassroomStatsDtoToModel(dto.stats),
    expires_at: dto.expires_at,
})

export const mapTeacherPreviewSessionDtoToModel = (
    dto: TeacherPreviewSessionResponseDto
): TeacherPreviewSession => ({
    classroom_code: dto.classroom_code,
    session_id: dto.session_id,
    expires_at: dto.expires_at,
})

export const mapWebSocketAuthDtoToModel = (
    dto: WebSocketAuthResponseDto
): WebSocketAuthToken => ({
    token: dto.token,
    role: dto.role,
})

export const mapExtendClassroomDtoToModel = (
    dto: ExtendClassroomResponseDto
): ExtendClassroomResult => ({
    new_expires_at: dto.new_expires_at,
})
