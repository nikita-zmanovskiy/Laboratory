"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { CodeInputContainer } from "@/features/join-classroom"

import { ThemeToggle } from "@/shared/ui/ThemeToggle"

import { useRoleStore } from "../model/useRoleStore"

import { RoleCard } from "./RoleCard"

import styles from './roleCard.module.css'

export const RoleSelectPage = () => {
    const [showStudentInput, setShowStudentInput] = useState(false)
    const [animatingStudent, setAnimatingStudent] = useState(false)
    const [animatingTeacher, setAnimatingTeacher] = useState(false)
    const [particles, setParticles] = useState<Array<{id: number; x: number; y: number; color: string; tx: number; ty: number}>>([])
    const { setRole } = useRoleStore()
    const router = useRouter()

    if (showStudentInput) {
        return (
            <CodeInputContainer 
                onBack={() => {
                    setShowStudentInput(false)
                    setAnimatingStudent(false)
                }} 
            />
        )
    }
    const colors = ['#ff5d867d', '#7dcfff5c', '#7dcfff5c', '#7dcfff', '#ff5d867d']

    const spawnParticles = (x: number, y: number) => {
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
            id: Date.now() + i,
            x,
            y,
            color: colors[Math.floor(Math.random() * colors.length)],
            tx: (Math.random() - 0.5) * 300,
            ty: (Math.random() - 0.5) * 300,
        }))
        setParticles(prev => [...prev, ...newParticles])
        setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.includes(p))), 1500)
    }
    const handleStudentClick = (e: React.MouseEvent) => {
        const rect = (e.target as HTMLElement).closest('button')?.getBoundingClientRect()
        if (rect) {
            spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2)
        }
        setAnimatingStudent(true)
        setTimeout(() => {
            setShowStudentInput(true)
        }, 500)
    }
    const handleTeacherClick = (e: React.MouseEvent) => {
        const rect = (e.target as HTMLElement).closest('button')?.getBoundingClientRect()
        if (rect) {
            spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2)
        }
        setAnimatingTeacher(true)
        setTimeout(() => {
            setRole("teacher")
            router.push("/teacher")
        }, 500)
    }
    const StudentSvg = () => (
        <svg fill="var(--color-text-muted)" className='mr-1' xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
            <path d="M 24 4 C 19.599415 4 16 7.599415 16 12 L 16 16 L 12.5 16 C 10.032499 16 8 18.032499 8 20.5 L 8 39.5 C 8 41.967501 10.032499 44 12.5 44 L 35.5 44 C 37.967501 44 40 41.967501 40 39.5 L 40 20.5 C 40 18.032499 37.967501 16 35.5 16 L 19 16 L 19 12 C 19 9.220585 21.220585 7 24 7 C 26.647834 7 28.781049 9.0253952 28.978516 11.613281 A 1.5003761 1.5003761 0 1 0 31.970703 11.386719 C 31.656169 7.2646048 28.194166 4 24 4 z M 12.5 19 L 17.253906 19 A 1.50015 1.50015 0 0 0 17.740234 19 L 35.5 19 C 36.346499 19 37 19.653501 37 20.5 L 37 39.5 C 37 40.346499 36.346499 41 35.5 41 L 12.5 41 C 11.653501 41 11 40.346499 11 39.5 L 11 20.5 C 11 19.653501 11.653501 19 12.5 19 z M 24 27 A 3 3 0 0 0 24 33 A 3 3 0 0 0 24 27 z"></path>
        </svg>
    )
    
    const TeacherSvg = () => (
        <svg className='mr-1' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14.304 4.84395L17.156 7.69595M7 7H4C3.44772 7 3 7.44772 3 8V18C3 18.5523 3.44772 19 4 19H15C15.5523 19 16 18.5523 16 18V13.5M18.409 3.59095C18.5963 3.77817 18.745 4.00047 18.8464 4.24515C18.9478 4.48983 18.9999 4.75209 18.9999 5.01695C18.9999 5.2818 18.9478 5.54406 18.8464 5.78874C18.745 6.03342 18.5963 6.25573 18.409 6.44295L11.565 13.287L8 14L8.713 10.435L15.557 3.59095C15.7442 3.4036 15.9665 3.25498 16.2112 3.15359C16.4559 3.05219 16.7181 3 16.983 3C17.2479 3 17.5101 3.05219 17.7548 3.15359C17.9995 3.25498 18.2218 3.4036 18.409 3.59095Z" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    )

    return (
        <div className={`flex h-screen items-center justify-center ${styles.role__page}`}>
            {particles.map(p => (
                <div key={p.id} className={styles.particles}>
                    <div
                        className={styles.particle}
                        style={{
                            left: p.x,
                            top: p.y,
                            background: p.color,
                            '--tx': `${p.tx}px`,
                            '--ty': `${p.ty}px`,
                        } as React.CSSProperties}
                    />
                </div>
            ))}
            <div className="flex items-center gap-8 max-[1300px]:flex-col ">
                <section className="mr-2">
                    <h1 className={`mb-7 text-3xl font-bold ${styles.role__title} max-w-[420px]`}>Лаборатория Искусственного Интеллекта</h1>
                    <p className="-mt-4 max-w-[400px] text-sm text-[var(--color-text-muted)]">
                        Интерактивная платформа для изучения промпт-инжиниринга. 
                        Практикуйтесь в составлении промптов для нейросетей <span className="text-[var(--color-text-primary)]">GigaChat</span> и <span className="text-[var(--color-text-primary)]">Kandinsky</span>.
                    </p>
                    <div className="flex items-center">
                        <p className="mt-6 text-sm text-[var(--color-text-muted)]">Выберите вашу роль и начните обучение!</p>
                        <svg className="mt-6 ml-2" fill="var(--color-text-primary)" height='15px' width='15px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs></defs><title/><g data-name="Layer 2" id="Layer_2"><path d="M16.88,15.53,7,5.66A1,1,0,0,0,5.59,7.07l9.06,9.06-8.8,8.8a1,1,0,0,0,0,1.41h0a1,1,0,0,0,1.42,0l9.61-9.61A.85.85,0,0,0,16.88,15.53Z"/><path d="M26.46,15.53,16.58,5.66a1,1,0,0,0-1.41,1.41l9.06,9.06-8.8,8.8a1,1,0,0,0,0,1.41h0a1,1,0,0,0,1.41,0l9.62-9.61A.85.85,0,0,0,26.46,15.53Z"/></g></svg>
                    </div>
                    <ThemeToggle />
                </section>
                <div className="flex gap-14 max-[1300px]:gap-8 max-[670px]:gap-4">
                    <RoleCard
                        defaultImage="/images/student.webp"
                        hoverImage="/images/studentHi.webp"
                        title="Я ученик"
                        subTitle="Код класса"
                        description="Подключаюсь к уроку по коду класса"
                        svgIcon={<StudentSvg />}
                        gradient="red"
                        onClick={handleStudentClick}
                        animating={animatingStudent}
                    />
                    <RoleCard
                        defaultImage="/images/teacher.webp"
                        hoverImage="/images/teacherHi.webp"
                        title="Я преподаватель"
                        subTitle="Создать класс"
                        description="Создаю класс и слежу за активностью"
                        svgIcon={<TeacherSvg />}
                        gradient="blue"
                        onClick={handleTeacherClick}
                        animating={animatingTeacher}
                    />
                </div>
            </div>
        </div>
    )
}