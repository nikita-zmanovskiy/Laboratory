import { useEffect, useRef } from 'react'
import Image from 'next/image'
import styles from './roleCard.module.css'

interface RoleCardProps {
    title: string
    description: string
    defaultImage: string
    hoverImage: string
    subTitle: string
    svgIcon: React.ReactNode
    gradient: 'red' | 'blue'
    onClick: () => void
    animating?: boolean
}

export const RoleCard = ({ title, animating, subTitle, description, defaultImage, hoverImage, svgIcon, gradient, onClick }: RoleCardProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const el = buttonRef.current
        if (!el) return
        
        if (!animating) {
            el.style.animation = 'none'
            el.offsetHeight
            el.style.animation = ''
            el.style.transform = ''
            el.style.opacity = ''
        }
    }, [animating])

    return (
        <button onClick={onClick} ref={buttonRef} className={`${styles.button} ${
            animating ? (gradient === 'red' ? styles.flyAway : styles.flyAwayRight) : ''
        }
        ${
            gradient === 'red' ? 'origin-bottom-left hover:rotate-[-5deg]' : 'origin-bottom-right hover:rotate-[5deg]'
        }
         cursor-pointer group transition-all ease-out isolate duration-500 relative p-5 active:scale-95`}>
        
          <div className={styles.blur__overlay}></div>
            <div className={`${gradient === 'red' ? styles.animatedGlowRed : styles.animatedGlowBlue} w-76 max-[750px]:w-64 rounded-3xl`}>
                <div className='h-70 max-[750px]:h-64'></div>
            </div>
            <div className={`${styles.card__content} page__animation-opacity w-full relative  h-70 bg-[#0d0e12] rounded-[23px] p-6 flex flex-col items-center gap-4`}>
                <div className={`${styles.card__select} ${gradient !== 'red' ? styles.card__select_right : ''}`}>
                    <svg width={20} height={20} fill='#282828' xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24">
                        <g id="grid" />
                        <g id="icon">
                            <path d="M6.294,18.246c0.128,0,0.256-0.049,0.354-0.146L18.14,6.607c0.195-0.195,0.195-0.512,0-0.707s-0.512-0.195-0.707,0L6.294,17.039l-5.44-5.44c-0.195-0.195-0.512-0.195-0.707,0s-0.195,0.512,0,0.707L5.94,18.1C6.038,18.197,6.166,18.246,6.294,18.246z" />
                            <path d="M23.146,5.9L11.654,17.393c-0.195,0.195-0.195,0.512,0,0.707c0.098,0.098,0.226,0.146,0.354,0.146s0.256-0.049,0.354-0.146L23.854,6.607c0.195-0.195,0.195-0.512,0-0.707S23.342,5.705,23.146,5.9z" />
                        </g>
                    </svg>
                </div>
                <div className={`${styles.image__container} ${gradient !== 'red' ? styles.image__container_right : ''} relative max-[750px]:!h-40 max-[750px]:!w-40 h-16 w-16`}>
                    <Image
                        src={defaultImage}
                        alt={title}
                        fill
                        quality={100}
                        unoptimized
                        priority
                        className="absolute inset-0 object-contain transition-all duration-500 ease-out group-hover:opacity-0 group-hover:scale-90"
                    />
                    <Image
                        src={hoverImage}
                        alt={title}
                        fill
                        quality={100}
                        unoptimized
                        priority
                        className="absolute inset-0 object-contain opacity-0 scale-110 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-100"
                    />
                </div>
                <div className={styles.description}>
                    <h2 className="text-xl font-semibold mb-2 text-[#fff] tracking-wide">{title}</h2>
                    <p className="text-sm leading-relaxed text-[#9ca3af]">{description}</p>
                    <div className={`${styles.sub__description} pt-4`}>
                        <div className={styles.sub__wrapper}>
                            {svgIcon}
                            <p className="text-[#9ca3af] text-sm">{subTitle}</p>
                        </div>
                        <span className={`${styles.glowButton} ${gradient !== 'red' ? styles.glowButton_blue : ''} text-[#9ca3af]`}>Вход</span>
                    </div>
                </div>
            </div>
        </button>
    )
}

RoleCard.displayName = "RoleCard"