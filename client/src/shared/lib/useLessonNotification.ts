import { useCallback, useEffect, useRef, useState } from "react"

import { LESSON_WARNINGS } from "../config/lesson"
import { CHECK_INTERVAL_MS } from "../config/notification"

interface UseLessonNotificationData {
    showNotification: boolean
    notificationMessage: string
}

interface UseLessonNotificationHandlers {
    dismissNotification: () => void
}

type UseLessonNotificationReturn = UseLessonNotificationData & UseLessonNotificationHandlers

type LessonWarningId = "5m" | "1m"



/**
 * Хук для показа уведомлений о скором окончании урока
 *
 * Отслеживает оставшееся время до expiresAt
 * Показывает предупреждение когда осталось меньше 5 минут
 * И ещё одно когда осталось меньше 1 минуты
 * Каждое предупреждение показывается один раз за сессию урока
 * При смене expiresAt сбрасывает историю показанных предупреждений
 * Проверка времени происходит каждые CHECK_INTERVAL_MS мс
 *
 * @param expiresAt - дата окончания урока в ISO формате или null
 * @returns showNotification - флаг показа уведомления
 * @returns notificationMessage - текст уведомления
 * @returns dismissNotification - функция скрытия уведомления
 */

export interface LessonWarning {
	id: LessonWarningId
	thresholdMs: number
	message: string
}



export const useLessonNotification = (
	expiresAt: string | null,
): UseLessonNotificationReturn => {
	const [activeWarningId, setActiveWarningId] =
		useState<LessonWarningId | null>(null),
	 [notificationMessage, setNotificationMessage] = useState("")

	const shownWarningsRef = useRef<Set<LessonWarningId>>(new Set()),
	 previousExpiresAtRef = useRef<string | null>(null)

	useEffect(() => {
		if (previousExpiresAtRef.current === expiresAt) {
			return
		}

		previousExpiresAtRef.current = expiresAt
		shownWarningsRef.current.clear()
		setActiveWarningId(null)
		setNotificationMessage("")
	}, [expiresAt])

	const checkTime = useCallback(() => {
		if (!expiresAt) {
			return
		}

		const lessonEndTime = new Date(expiresAt).getTime()

		if (Number.isNaN(lessonEndTime)) {
			return
		}

		const remainingMs = lessonEndTime - Date.now()

		if (remainingMs <= 0) {
			setActiveWarningId(null)
			setNotificationMessage("")
			return
		}

		const nextWarning = LESSON_WARNINGS.find(
			(warning) =>
				remainingMs <= warning.thresholdMs &&
				!shownWarningsRef.current.has(warning.id),
		)

		if (!nextWarning) {
			return
		}

		shownWarningsRef.current.add(nextWarning.id)
		setActiveWarningId(nextWarning.id)
		setNotificationMessage(nextWarning.message)
	}, [expiresAt])

	useEffect(() => {
		checkTime()

		const intervalId = window.setInterval(checkTime, CHECK_INTERVAL_MS)

		return () => {
			window.clearInterval(intervalId)
		}
	}, [checkTime]);

	const dismissNotification = useCallback(() => {
		setActiveWarningId(null)
		setNotificationMessage("")
	}, [])

	return {
		showNotification: activeWarningId !== null,
		notificationMessage,
		dismissNotification,
	}
}