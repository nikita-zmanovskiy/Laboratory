"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type Theme = "dark" | "light"

/**
 * Хук для управления темой приложения (dark/light)
 *
 * При монтировании читает сохранённую тему из localStorage
 * При переключении добавляет/убирает класс light на documentElement,
 * сохраняет выбор в localStorage и запускает плавную анимацию перехода
 * Анимация отключается при prefers-reduced-motion: reduce
 *
 * @returns theme - текущая тема (dark или light)
 * @returns mounted - флаг завершения гидратации (false на сервере, true после монтирования)
 * @returns toggleTheme - функция переключения темы
 */

const THEME_STORAGE_KEY = "theme",
 THEME_TRANSITION_CLASS = "theme-transition",
 THEME_TRANSITION_DURATION_MS = 300

const isTheme = (value: string | null): value is Theme => {
	return value === "light" || value === "dark"
},
//для отключения анимации при включении reduced motion
 shouldReduceMotion = (): boolean => {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

const enableThemeTransition = (): (() => void) => {
	if (shouldReduceMotion()) {
		return () => {}
	}

	const root = document.documentElement

	root.classList.add(THEME_TRANSITION_CLASS)

	const timeoutId = window.setTimeout(() => {
		root.classList.remove(THEME_TRANSITION_CLASS)
	}, THEME_TRANSITION_DURATION_MS)

	return () => {
		window.clearTimeout(timeoutId)
		root.classList.remove(THEME_TRANSITION_CLASS)
	}
}

export const useTheme = () => {
	const [theme, setTheme] = useState<Theme>("dark"),
	 [mounted, setMounted] = useState(false)

	const cleanupTransitionRef = useRef<(() => void) | null>(null)

	useEffect(() => {
		const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)

		if (isTheme(savedTheme)) {
			setTheme(savedTheme)
		}

		setMounted(true)
	}, [])

	useEffect(() => {
		if (!mounted) {
			return
		}

		document.documentElement.classList.toggle("light", theme === "light")
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	}, [theme, mounted])

	useEffect(() => {
		return () => {
			cleanupTransitionRef.current?.()
		}
	}, [])

	const toggleTheme = useCallback(() => {
		cleanupTransitionRef.current?.();
		cleanupTransitionRef.current = enableThemeTransition();

		setTheme((currentTheme) =>
			currentTheme === "dark" ? "light" : "dark",
		)
	}, [])

	return {
		theme,
		mounted,
		toggleTheme,
	}
}