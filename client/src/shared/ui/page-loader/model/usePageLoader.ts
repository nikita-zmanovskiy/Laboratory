"use client"

import { useEffect, useState } from "react"

import { FADE_OUT_TIME_MS, MIN_LOAD_TIME_MS } from "../../../config/theme"

/**
 * Хук для управления экраном загрузки страницы
 *
 * Показывает лоадер минимум MIN_LOAD_TIME_MS мс даже при быстрой загрузке
 * По истечении времени запускает анимацию затухания (fadeOut)
 * Через FADE_OUT_TIME_MS после начала затухания скрывает лоадер полностью
 * Корректно обрабатывает случай когда страница уже загружена до монтирования хука
 *
 * @returns visible - флаг видимости лоадера в DOM
 * @returns fadeOut - флаг запуска анимации затухания
 */


export const usePageLoader = () => {
  const [visible, setVisible] = useState(true),
   [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    let fadeTimerId: ReturnType<typeof setTimeout>,
     hideTimerId: ReturnType<typeof setTimeout>,
     isMounted = true

    const startFadeOut = () => {
      fadeTimerId = setTimeout(() => {
        if (!isMounted) {
          return
        }

        setFadeOut(true)

        hideTimerId = setTimeout(() => {
          if (!isMounted) {
            return
          }

          setVisible(false)
        }, FADE_OUT_TIME_MS)
      }, MIN_LOAD_TIME_MS)
    }

    if (document.readyState === "complete") {
      startFadeOut()
    } else {
      window.addEventListener("load", startFadeOut)
    }

    return () => {
      isMounted = false
      window.removeEventListener("load", startFadeOut)
      clearTimeout(fadeTimerId)
      clearTimeout(hideTimerId)
    }
  }, [])

  return {
    visible,
    fadeOut,
  }
}