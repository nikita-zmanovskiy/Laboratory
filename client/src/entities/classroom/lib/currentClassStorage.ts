import type { CurrentClassroom } from "../types"

const STORAGE_KEY = "currentClass"

/**
 * Проверяет активен ли класс на основе даты истечения
 *
 * @param expiresAt - дата истечения в ISO формате
 * @returns true если дата истечения ещё не наступила
 */

/**
 * Получает данные текущего класса из localStorage
 *
 * Валидирует наличие обязательных полей code и expires_at
 * Если класс истёк - удаляет запись и возвращает null
 * При наличии старого поля token в хранилище - удаляет его и обновляет запись
 * При ошибке парсинга - удаляет повреждённую запись и возвращает null
 *
 * @returns объект CurrentClassroom или null
 */

/**
 * Сохраняет данные текущего класса в localStorage
 *
 * @param classroom - объект с code, title и expires_at
 */

/**
 * Обновляет дату истечения текущего класса в localStorage
 *
 * Получает текущие данные, заменяет expires_at и сохраняет обратно
 * Если данных в хранилище нет - ничего не делает
 *
 * @param expiresAt - новая дата истечения в ISO формате
 */

/**
 * Удаляет данные текущего класса из localStorage
 */

export const isClassroomActive = (expiresAt: string) => {
    return new Date(expiresAt).getTime() > Date.now()
}

export const getCurrentClassFromStorage = (): CurrentClassroom | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)

        if (!stored) {
            return null
        }

        const parsed = JSON.parse(stored) as CurrentClassroom & { token?: string }

        if (!parsed.code || !parsed.expires_at) {
            return null
        }

        if (!isClassroomActive(parsed.expires_at)) {
            localStorage.removeItem(STORAGE_KEY)
            return null
        }

        const { token: _token, ...currentClass } = parsed

        if (_token) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentClass))
        }

        return currentClass
    } catch {
        localStorage.removeItem(STORAGE_KEY)
        return null
    }
}

export const setCurrentClassToStorage = (classroom: CurrentClassroom) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classroom))
}

export const updateCurrentClassExpiresAt = (expiresAt: string) => {
    const currentClass = getCurrentClassFromStorage()

    if (!currentClass) {
        return
    }

    setCurrentClassToStorage({
        ...currentClass,
        expires_at: expiresAt,
    })
}

export const clearCurrentClassStorage = () => {
    localStorage.removeItem(STORAGE_KEY)
}
