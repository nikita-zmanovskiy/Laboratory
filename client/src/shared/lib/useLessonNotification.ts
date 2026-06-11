import { useCallback, useEffect, useRef, useState } from "react"

interface UseLessonNotificationData {
    showNotification: boolean
    notificationMessage: string
}

interface UseLessonNotificationHandlers {
    dismissNotification: () => void
}

type UseLessonNotificationReturn = UseLessonNotificationData & UseLessonNotificationHandlers

type LessonWarningId = "5m" | "1m"

interface LessonWarning {
	id: LessonWarningId
	thresholdMs: number
	message: string
}

const CHECK_INTERVAL_MS = 10_000;

const LESSON_WARNINGS: LessonWarning[] = [
	{
		id: "1m",
		thresholdMs: 60_000,
		message: "Осталась меньше 1 минуты до конца урока!",
	},
	{
		id: "5m",
		thresholdMs: 5 * 60_000,
		message: "Осталось меньше 5 минут до конца урока!",
	},
]
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