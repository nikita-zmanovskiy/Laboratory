import { useEffect, useRef,useState } from 'react'

import styles from './Modal.module.css'

interface CodeInputProps {
    code: string
    isLoading: boolean
    error: string | null
    onCodeChange: (value: string) => void
    onSubmit: () => void
    onBack: () => void
}

export const CodeInput = ({
    code,
    isLoading,
    error,
    onCodeChange,
    onSubmit,
    onBack,
}: CodeInputProps) => {
    const [visibleError, setVisibleError] = useState<string | null>(null)
    const [showHint, setShowHint] = useState(true)
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (error) {
            setShowHint(false)
            setTimeout(() => setVisibleError(error), 200)
        } else if (visibleError) {
            setVisibleError(null)
            setTimeout(() => setShowHint(true), 200)
        } else {
            setShowHint(true)
        }
    }, [error])

    const handleBoxClick = () => {
        inputRef.current?.focus()
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
        onCodeChange(value)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && code.length === 6 && !isLoading) {
            onSubmit()
        }
    }

    return (
        <div className={`${styles.code__wrapper} page__animation-opacity flex h-screen items-center justify-center`}>
            <div className="flex w-100 flex-col page__animation items-center gap-4 rounded-2xl p-8 relative">
                {isLoading && (
                    <div className="absolute inset-0 rounded-2xl z-10 bg-transparent flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative h-10 w-10">
                                <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                            </div>
                            <p className="text-sm text-white/80">Подключаемся к классу...</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <h2 className="text-lg text-[var(--color-text-primary)] font-semibold">Код класса</h2>
                    <svg fill="var(--color-text-primary)" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24">
                        <path d="M20,15 L20,13 L21,13 C21.5522847,13 22,12.5522847 22,12 C22,11.4477153 21.5522847,11 21,11 L11.9514124,11 L11.7157487,10.3332461 C11.0154711,8.35197855 9.13614903,7 7,7 C4.23857625,7 2,9.23857625 2,12 C2,14.7614237 4.23857625,17 7,17 C9.13614903,17 11.0154711,15.6480214 11.7157487,13.6667539 L11.9514124,13 L18,13 L18,15 L20,15 Z M22,17 L16,17 L16,15 L13.326396,15 C12.1852426,17.4064194 9.74415335,19 7,19 C3.13400675,19 0,15.8659932 0,12 C0,8.13400675 3.13400675,5 7,5 C9.74415335,5 12.1852426,6.59358057 13.326396,9 L21,9 C22.6568542,9 24,10.3431458 24,12 C24,13.3062188 23.1651924,14.4174579 22,14.8292943 L22,17 Z M7,14 C8.1045695,14 9,13.1045695 9,12 C9,10.8954305 8.1045695,10 7,10 C5.8954305,10 5,10.8954305 5,12 C5,13.1045695 5.8954305,14 7,14 Z"/>
                    </svg>
                </div>

                <div className="relative w-full h-6">
                    <p className={`text-sm text-center text-[var(--color-text-muted)] absolute inset-0 transition-all duration-300 ${
                        showHint && !visibleError ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}>
                        Введите код комнаты, чтобы войти
                    </p>
                    <p className={`text-sm text-[var(--color-text-error)] text-center absolute inset-0 transition-all duration-300 ${
                        visibleError ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}>
                        {visibleError || ""}
                    </p>
                </div>
                
                <div className="relative" onClick={handleBoxClick}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={code}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        maxLength={6}
                        disabled={isLoading}
                        autoComplete="off"
                        className="absolute opacity-0 w-0 h-0"
                    />
                    <div className="flex gap-3">
                        {[0, 1, 2, 3, 4, 5].map((i) => {
                            const isFilled = !!code[i]
                            const isNext = isFocused && code.length < 6 && i === code.length
                            
                            return (
                                <div
                                    key={i}
                                    className={`w-12 h-14 bg-[var(--color-bg-primary)] rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                                        isFilled
                                            ? 'border-[#ff5d86] bg-[#ff5d86]/10 text-[var(--color-text-primary)] shadow-[0_0_10px_rgba(255,93,134,0.15)]'
                                            : isNext
                                                ? 'border-[#ff5d86]/40 bg-[#ff5d86]/5 text-[var(--color-text-secondary)] shadow-[0_0_6px_rgba(255,93,134,0.08)]'
                                                : 'border-[var(--color-border-primary)] text-[var(--color-text-muted)]'
                                    } ${!isLoading ? 'cursor-text' : 'cursor-default'}`}
                                >
                                    {code[i] || ''}
                                </div>
                            )
                        })}
                    </div>
                </div>
                
                <div className="flex gap-3 mt-2">
                    <button
                        onClick={onBack}
                        disabled={isLoading}
                        className="rounded-xl cursor-pointer bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] px-6 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Назад
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isLoading || code.length !== 6}
                        className={`rounded-xl px-6 py-2 text-sm font-medium text-white transition-all ${
                            isLoading 
                            ? "bg-[#ff5d867a] cursor-wait" 
                            : code.length === 6 
                                ? "bg-[#ff5d86] hover:bg-[#ff5d867a]/90 cursor-pointer" 
                                : "bg-[#ff5d862f] cursor-not-allowed"                        
                        }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            </span>
                        ) : (
                            "Войти"
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}