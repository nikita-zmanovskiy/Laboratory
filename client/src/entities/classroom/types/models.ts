export interface Classroom {
    id: string
    code: string
    title: string
    is_active: boolean
    expires_at: string
}

export interface CurrentClassroom {
    code: string
    title?: string
    expires_at: string
}

export interface JoinedClassroom {
    expires_at?: string
}

export interface TeacherPreviewSession {
    classroom_code: string
    session_id: string
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

export interface TopStudent {
    session_id: string
    requests: number
    avg_tokens: number
}

export interface TokensOverTimePoint {
    timestamp: string
    input: number
    output: number
}

export interface RequestsPerMinutePoint {
    minute: string
    count: number
}

export interface ModeDistribution {
    text: number
    image: number
}

export interface ClassroomCharts {
    tokens_over_time: TokensOverTimePoint[]
    requests_per_minute: RequestsPerMinutePoint[]
    mode_distribution: ModeDistribution
    avg_tokens_per_request: number
    avg_response_time: number
    error_rate: number
    total_requests: number
    active_students: number
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
    top_students: TopStudent[]
    charts: ClassroomCharts
}

export interface WebSocketAuthToken {
    token: string
    role: "teacher" | "student"
}