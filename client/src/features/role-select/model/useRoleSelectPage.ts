"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"

import { useParticles } from "./useParticles"
import { useRoleStore } from "../../../entities/session/model/useRoleStore"

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