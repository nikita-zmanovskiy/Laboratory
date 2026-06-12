"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"

import { useRoleStore } from "@/entities/session"

import { useParticles } from "./useParticles"


/**
 * Центральный хук страницы выбора роли
 *
 * Управляет анимациями карточек ролей и переходами между состояниями
 * При клике на роль студента запускает анимацию и через CARD_ANIMATION_DURATION_MS
 * показывает поле ввода кода класса
 * При клике на роль учителя запускает анимацию, устанавливает роль и переходит на /teacher
 * Спавнит частицы в точке клика через useParticles
 * При размонтировании очищает все таймеры частиц и переходов
 *
 * @returns showStudentInput - флаг показа поля ввода кода класса
 * @returns animatingStudent - флаг анимации карточки студента
 * @returns animatingTeacher - флаг анимации карточки учителя
 * @returns particles - массив частиц для рендеринга
 * @returns handleBackToRoles - возврат к выбору роли
 * @returns handleStudentClick - обработчик клика по роли студента
 * @returns handleTeacherClick - обработчик клика по роли учителя
 */

const CARD_ANIMATION_DURATION_MS = 500

const getButtonCenter = (event: MouseEvent<HTMLElement>) => {
  const button = (event.target as HTMLElement).closest("button"),
   rect = button?.getBoundingClientRect()

  if (!rect) {
    return null
  }

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

export const useRoleSelectPage = () => {
  const [showStudentInput, setShowStudentInput] = useState(false),
   [animatingStudent, setAnimatingStudent] = useState(false),
   [animatingTeacher, setAnimatingTeacher] = useState(false)

  const transitionTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([])

  const router = useRouter(),
   setRole = useRoleStore((state) => state.setRole)

  const {
    particles,
    spawnParticles,
    clearParticlesTimers,
  } = useParticles()

  useEffect(() => {
    return () => {
      clearParticlesTimers()
      transitionTimersRef.current.forEach(clearTimeout)
      transitionTimersRef.current = []
    }
  }, [clearParticlesTimers])

  const handleBackToRoles = () => {
    setShowStudentInput(false)
    setAnimatingStudent(false)
  }

  const handleStudentClick = (event: MouseEvent<HTMLElement>) => {
    const center = getButtonCenter(event)

    if (center) {
      spawnParticles(center.x, center.y)
    }

    setAnimatingStudent(true)

    const timerId = setTimeout(() => {
      setShowStudentInput(true)
    }, CARD_ANIMATION_DURATION_MS)

    transitionTimersRef.current.push(timerId)
  }

  const handleTeacherClick = (event: MouseEvent<HTMLElement>) => {
    const center = getButtonCenter(event)

    if (center) {
      spawnParticles(center.x, center.y)
    }

    setAnimatingTeacher(true)

    const timerId = setTimeout(() => {
      setRole("teacher")
      router.push("/teacher")
    }, CARD_ANIMATION_DURATION_MS)

    transitionTimersRef.current.push(timerId)
  }

  return {
    showStudentInput,
    animatingStudent,
    animatingTeacher,
    particles,
    handleBackToRoles,
    handleStudentClick,
    handleTeacherClick,
  }
}