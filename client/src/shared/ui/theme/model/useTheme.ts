"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("dark"),
   [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme)
    }

    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) {
      return
    }

    document.documentElement.classList.toggle("light", theme === "light")
    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark",
    )
  }

  return {
    theme,
    mounted,
    toggleTheme,
  }
}