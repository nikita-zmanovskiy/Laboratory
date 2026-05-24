"use client"

import { useCallback,useEffect, useState } from "react"

type Theme = "dark" | "light"

const getInitialTheme = (): Theme => {
    if (typeof window === "undefined") {
      return "dark";
    }
  
    return localStorage.getItem("theme") === "light" ? "light" : "dark"
}

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme)

    useEffect(() => {
        document.documentElement.classList.toggle("light", theme === "light")
        localStorage.setItem("theme", theme)
      }, [theme])
    
      const toggleTheme = () => {
        setTheme((currentTheme) =>
          currentTheme === "dark" ? "light" : "dark",
        )
      }

    return { theme, toggleTheme }
}