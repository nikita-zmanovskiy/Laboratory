"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import type { MouseEventHandler, ReactNode } from "react"

import styles from "./roleCard.module.css"

interface RoleCardProps {
  title: string
  description: string
  defaultImage: string
  hoverImage: string
  subTitle: string
  svgIcon: ReactNode
  gradient: "red" | "blue"
  onClick: MouseEventHandler<HTMLButtonElement>
  animating?: boolean
}

export const RoleCard = ({
  title,
  animating = false,
  subTitle,
  description,
  defaultImage,
  hoverImage,
  svgIcon,
  gradient,
  onClick,
}: RoleCardProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const button = buttonRef.current

    if (!button || animating) {
      return
    }

    button.style.animation = "none"
    void button.offsetHeight
    button.style.animation = ""
    button.style.transform = ""
    button.style.opacity = ""
  }, [animating])

  return (
    <button
      type="button"
      onClick={onClick}
      ref={buttonRef}
      className={`${styles.button} ${
        animating
          ? gradient === "red"
            ? styles.flyAway
            : styles.flyAwayRight
          : ""
      } ${
        gradient === "red"
          ? "origin-bottom-left hover:rotate-[-5deg]"
          : "origin-bottom-right hover:rotate-[5deg]"
      } group relative isolate cursor-pointer p-5 transition-all duration-500 ease-out active:scale-95`}
      aria-label={`${title}. ${description}`}
    >
      <div className={styles.blur__overlay} />

      <div
        className={`${
          gradient === "red"
            ? styles.animatedGlowRed
            : styles.animatedGlowBlue
        } w-76 rounded-3xl max-[750px]:w-64 max-[480px]:h-56 max-[480px]:w-56`}
      >
        <div className="h-70 max-[750px]:h-64" />
      </div>

      <div
        className={`${styles.card__content} page__animation-opacity relative flex h-70 w-full flex-col items-center gap-4 rounded-[23px] bg-[#0d0e12] p-6 max-[750px]:h-64 max-[480px]:h-56`}
      >
        <div
          className={`${styles.card__select} ${
            gradient !== "red" ? styles.card__select_right : ""
          }`}
          aria-hidden="true"
        >
          <svg
            width={20}
            height={20}
            fill="#282828"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g id="grid" />
            <g id="icon">
              <path d="M6.294,18.246c0.128,0,0.256-0.049,0.354-0.146L18.14,6.607c0.195-0.195,0.195-0.512,0-0.707s-0.512-0.195-0.707,0L6.294,17.039l-5.44-5.44c-0.195-0.195-0.512-0.195-0.707,0s-0.195,0.512,0,0.707L5.94,18.1C6.038,18.197,6.166,18.246,6.294,18.246z" />
              <path d="M23.146,5.9L11.654,17.393c-0.195,0.195-0.195,0.512,0,0.707c0.098,0.098,0.226,0.146,0.354,0.146s0.256-0.049,0.354-0.146L23.854,6.607c0.195-0.195,0.195-0.512,0-0.707S23.342,5.705,23.146,5.9z" />
            </g>
          </svg>
        </div>

        <div
          className={`${styles.image__container} ${
            gradient !== "red" ? styles.image__container_right : ""
          } relative h-16 w-16 max-[750px]:!h-40 max-[750px]:!w-40`}
        >
          <Image
            src={defaultImage}
            alt={title}
            fill
            quality={70}
            sizes="(max-width: 768px) 90vw, 378px"
            fetchPriority="high"
            className="absolute inset-0 object-contain transition-all duration-500 ease-out group-hover:scale-90 group-hover:opacity-0"
          />

          <Image
            src={hoverImage}
            alt=""
            fill
            sizes="(max-width: 768px) 90vw, 378px"
            quality={70}
            className="absolute inset-0 scale-110 object-contain opacity-0 transition-all duration-500 ease-out group-hover:scale-100 group-hover:opacity-100"
          />
        </div>

        <div className={styles.description}>
          <h2 className="mb-2 text-xl font-semibold tracking-wide text-white">
            {title}
          </h2>

          <p className="text-sm leading-relaxed text-[#9ca3af]">
            {description}
          </p>

          <div className={`${styles.sub__description} pt-4`}>
            <div className={styles.sub__wrapper}>
              {svgIcon}
              <p className="text-sm text-[#9ca3af]">{subTitle}</p>
            </div>

            <span
              className={`${styles.glowButton} ${
                gradient !== "red" ? styles.glowButton_blue : ""
              } text-[#9ca3af]`}
            >
              Вход
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}