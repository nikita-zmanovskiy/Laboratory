import { LessonWarning } from "../../../shared/lib/useLessonNotification";

export const LESSON_WARNINGS: LessonWarning[] = [
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

export const MINUTE_MS = 60_000,
 HOUR_MS = 60 * MINUTE_MS

export const ENDING_THRESHOLD_MS = 5 * 60 * 1000