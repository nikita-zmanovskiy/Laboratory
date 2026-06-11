const staticRoutes = {
    csrfToken: "/api/csrf/token",
    generate: "/api/generate",
    webSocketToken: "/api/ws/token",
    classrooms: "/api/classrooms",
    logs: "/api/logs",
    logsExport: "/api/logs/export",
} as const

const parameterizedRoutes = {
    classroomJoin: (code: string) => `/api/classrooms/${code}/join`,
    classroomExtend: (code: string) => `/api/classrooms/${code}/extend`,
    classroomDeactivate: (code: string) => `/api/classrooms/${code}/deactivate`,
    classroomTeacherSession: (code: string) => `/api/classrooms/${code}/teacher-session`,
    stats: (code: string) => `/api/stats/${code}`
} as const

export const apiRoutes = {
    ...staticRoutes,
    ...parameterizedRoutes,
} as const