"use client"

import { useCallback, useRef, useState } from "react"

export interface Particle {
  id: number
  x: number
  y: number
  color: string
  tx: number
  ty: number
}

const PARTICLE_COLORS = [
  "#ff5d867d",
  "#7dcfff5c",
  "#7dcfff5c",
  "#7dcfff",
  "#ff5d867d",
]

const PARTICLES_COUNT = 30
const PARTICLES_LIFETIME_MS = 1500
const PARTICLES_DISTANCE_PX = 300

export const useParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([])
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([])

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