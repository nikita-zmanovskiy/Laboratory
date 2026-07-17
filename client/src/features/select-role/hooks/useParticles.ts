"use client"

import { useCallback, useRef, useState } from "react"

import { PARTICLE_COLORS, PARTICLES_COUNT, PARTICLES_DISTANCE_PX, PARTICLES_LIFETIME_MS } from "@/shared/config/particles"

export interface Particle {
  id: number
  x: number
  y: number
  color: string
  tx: number
  ty: number
}
/**
 * Хук для спавна и управления частицами
 *
 * При вызове spawnParticles создаёт PARTICLES_COUNT частиц в точке (x, y)
 * Каждая частица получает случайный цвет из PARTICLE_COLORS
 * и случайное направление смещения в пределах PARTICLES_DISTANCE_PX
 * Частицы автоматически удаляются через PARTICLES_LIFETIME_MS
 * При размонтировании или вызове clearParticlesTimers все таймеры очищаются
 *
 * @returns particles - массив активных частиц для рендеринга
 * @returns spawnParticles - функция создания частиц в указанных координатах
 * @returns clearParticlesTimers - функция очистки всех таймеров частиц
 */

export const useParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]),
   timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([])

  const spawnParticles = useCallback((x: number, y: number) => {
    const createdAt = Date.now()

    const newParticles = Array.from({ length: PARTICLES_COUNT }, (_, index) => ({
      id: createdAt + index,
      x,
      y,
      color: PARTICLE_COLORS[
        Math.floor(Math.random() * PARTICLE_COLORS.length)
      ],
      tx: (Math.random() - 0.5) * PARTICLES_DISTANCE_PX,
      ty: (Math.random() - 0.5) * PARTICLES_DISTANCE_PX,
    }))

    setParticles((prevParticles) => [...prevParticles, ...newParticles])

    const timerId = setTimeout(() => {
      const particleIds = new Set(
        newParticles.map((particle) => particle.id),
      )

      setParticles((prevParticles) =>
        prevParticles.filter((particle) => !particleIds.has(particle.id)),
      )
    }, PARTICLES_LIFETIME_MS)

    timersRef.current.push(timerId)
  }, []);

  const clearParticlesTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  return {
    particles,
    spawnParticles,
    clearParticlesTimers,
  }
}