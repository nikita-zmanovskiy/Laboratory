export const EXTEND_WINDOW_MS = 12 * 60 * 60 * 1000


export const LOG_TABLE_HEADERS = [
    "Время",
    "Сессия",
    "Режим",
    "Хеш промта",
    "Прикрепленное фото",
    "Токены",
    "Статус",
    "Время ответа",
    "Ошибка",
] as const


export const MODE_FILTER_OPTIONS = [
    { value: "all", label: "Все режимы" },
    { value: "text", label: "Текст" },
    { value: "image", label: "Изображение" },
] as const

export const STATUS_FILTER_OPTIONS = [
    { value: "all", label: "Все статусы" },
    { value: "success", label: "Успешно" },
    { value: "error", label: "Ошибки" },
] as const

export const IMAGE_FILTER_OPTIONS = [
    { value: "all", label: "Все запросы" },
    { value: "with_image", label: "С изображением пользователя" },
    { value: "no_image", label: "Без изображения пользователя" },
] as const

export const SORT_OPTIONS = [
    { value: "newest", label: "Сначала новые" },
    { value: "oldest", label: "Сначала старые" },
] as const


export const ERROR_TOAST = 10_000