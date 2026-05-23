"use client"

import { useState, useEffect, useCallback } from "react"

type Theme = "dark" | "light"

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>("dark")

    useEffect(() => {
        const stored = localStorage.getItem("theme") as Theme | null
        if (stored) {
            setTheme(stored)
            document.documentElement.classList.toggle("light", stored === "light")
        }
    }, [])

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === "dark" ? "light" : "dark"
            localStorage.setItem("theme", next)
            document.documentElement.classList.toggle("light", next === "light")
            return next
        })
    }, [])

    return { theme, toggleTheme }
}