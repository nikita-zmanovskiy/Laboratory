"use client"

import type { CSSProperties } from "react"

import { ScreenSizeWarning } from "@/shared/ui/ScreenSizeWarningModal"

import { useRoleSelectPage } from "../hooks/useRoleSelectPage"

import { CodeInputContainer } from "./CodeInputContainer"
import { RoleCard } from "./RoleCard"
import { StudentIcon } from "./StudentIcon"
import { TeacherIcon } from "./TeacherIcon"

import styles from "./roleCard.module.css"

export const RoleSelectPage = () => {
  const {
    showStudentInput,
    animatingStudent,
    animatingTeacher,
    particles,
    handleBackToRoles,
    handleStudentClick,
    handleTeacherClick,
  } = useRoleSelectPage()

  if (showStudentInput) {
    return <CodeInputContainer onBack={handleBackToRoles} />
  }

  return (
    <main
      className={`flex min-h-screen w-full items-center justify-center overflow-x-hidden px-4 py-8 ${styles.role__page}`}
    >
      <ScreenSizeWarning />

      {particles.map((particle) => (
        <div key={particle.id} className={styles.particles}>
          <div
            className={styles.particle}
            style={
              {
                left: particle.x,
                top: particle.y,
                background: particle.color,
                "--tx": `${particle.tx}px`,
                "--ty": `${particle.ty}px`,
              } as CSSProperties
            }
          />
        </div>
      ))}

      <div className="flex w-full max-w-6xl min-w-0 flex-col items-center justify-center gap-8 max-[1230px]:!gap-4 min-[1200px]:flex-row min-[1200px]:gap-16">
        <section
          className="flex min-w-0 max-w-md flex-col items-center px-2 text-center min-[1200px]:items-start min-[1200px]:text-left"
          aria-labelledby="role-select-title"
        >
          <h1
            id="role-select-title"
            className={`mb-4 max-w-[420px] text-2xl font-bold leading-tight max-[780px]:mt-10 sm:mb-7 sm:text-3xl ${styles.role__title}`}
          >
            Лаборатория Искусственного Интеллекта
          </h1>

          <p className="max-w-[380px] text-sm leading-relaxed text-[var(--color-text-muted)] sm:max-w-none">
            Интерактивная платформа для изучения промпт-инжиниринга.
            Практикуйтесь в составлении промптов для нейросетей{" "}
            <span className="font-medium text-[var(--color-text-primary)]">
              GigaChat
            </span>{" "}
            и{" "}
            <span className="font-medium text-[var(--color-text-primary)]">
              Kandinsky
            </span>
            .
          </p>

          <div className="mt-4 flex items-center justify-center sm:mt-6 lg:justify-start">
            <p className="text-sm text-[var(--color-text-muted)] max-[480px]:text-xs">
              Выберите вашу роль и начните обучение!
            </p>

            <svg
              className="ml-2 shrink-0"
              fill="var(--color-text-primary)"
              height="15"
              width="15"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              <g data-name="Layer 2">
                <path d="M16.88,15.53,7,5.66A1,1,0,0,0,5.59,7.07l9.06,9.06-8.8,8.8a1,1,0,0,0,0,1.41h0a1,1,0,0,0,1.42,0l9.61-9.61A.85.85,0,0,0,16.88,15.53Z" />
                <path d="M26.46,15.53,16.58,5.66a1,1,0,0,0-1.41,1.41l9.06,9.06-8.8,8.8a1,1,0,0,0,0,1.41h0a1,1,0,0,0,1.41,0l9.62-9.61A.85.85,0,0,0,26.46,15.53Z" />
              </g>
            </svg>
          </div>
        </section>

        <section
          className="flex w-full min-w-0 flex-col items-center justify-center gap-6 max-[1300px]:!gap-4 sm:gap-8 md:flex-row lg:gap-14"
          aria-label="Выбор роли"
        >
          <RoleCard
            defaultImage="/images/student.webp"
            hoverImage="/images/studentHi.webp"
            title="Я ученик"
            subTitle="Код класса"
            description="Подключаюсь к уроку по коду класса"
            svgIcon={<StudentIcon />}
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
            svgIcon={<TeacherIcon />}
            gradient="blue"
            onClick={handleTeacherClick}
            animating={animatingTeacher}
          />
        </section>
      </div>
    </main>
  )
}