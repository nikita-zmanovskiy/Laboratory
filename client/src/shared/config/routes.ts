export const appRoutes = {
    home: "/",
    chat: "/chat",
    teacher: "/teacher",
    teacherClassroomRoot: "/teacher/classroom",
    teacherClassroom: (code: string) => `/teacher/classroom/${code}`,
} as const

export const isPublicRoute = (pathname: string | null) => {
    return !pathname || pathname === appRoutes.home
}

export const isTeacherClassroomRoute = (pathname: string | null) => {
    return Boolean(pathname?.startsWith(`${appRoutes.teacherClassroomRoot}/`))
}

export const isTeacherRoute = (pathname: string | null) => {
    return Boolean(pathname?.startsWith(appRoutes.teacher))
}
