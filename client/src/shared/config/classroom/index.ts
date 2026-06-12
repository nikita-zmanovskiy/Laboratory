export const DURATION_OPTIONS = [
    { label: "7 минут (1 урок)", value: 7 },
    { label: "45 минут (1 урок)", value: 45 },
    { label: "90 минут (2 урока)", value: 90 },
    { label: "2 часа", value: 120 },
    { label: "3 часа", value: 180 },
    { label: "6 часов", value: 360 },
    { label: "12 часов", value: 720 },
] as const

export type DurationOption = (typeof DURATION_OPTIONS)[number]

export const gradeOptions = [5, 6, 7, 8, 9, 10, 11]