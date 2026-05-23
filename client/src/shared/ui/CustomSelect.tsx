import { useEffect, useRef,useState } from "react"

import styles from "./customSelect.module.css"

export interface CustomSelectOption<T extends string | number = string> {
    label: string
    value: T
}

interface CustomSelectProps<T extends string | number = string> {
    value: T
    options: CustomSelectOption<T>[]
    onChange: (value: T) => void
    disabled?: boolean
    label?: string
    placeholder?: string
    compact?: boolean
    className?: string
}

export function CustomSelect<T extends string | number = string>({
    value,
    options,
    onChange,
    disabled = false,
    label,
    placeholder = "Выберите...",
    compact = false,
    className = "",
}: CustomSelectProps<T>) {
    const [open, setOpen] = useState(false)
    const [closing, setClosing] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const handleClose = () => {
        setClosing(true)
        setTimeout(() => {
            setOpen(false)
            setClosing(false)
        }, 150)
    }

    const handleToggle = () => {
        if (disabled) return
        if (open) {
            handleClose()
        } else {
            setOpen(true)
        }
    }

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                if (open) handleClose()
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [open])

    const selected = options.find((o) => o.value === value)

    return (
        <div ref={ref} className={`relative ${className}`}>
            {label && (
                <label className={`block text-sm font-medium ${styles.label} ${compact ? "" : "mb-1"}`}>
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                className={`${styles.trigger} w-full rounded-xl text-sm text-left disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-2 ${
                    compact ? `${styles.triggerCompact} px-3 py-1.5` : "px-4 py-3 mt-1"
                }`}
            >
                <span className={selected ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}>
                    {selected ? selected.label : placeholder}
                </span>
                <svg
                    className={`h-4 w-4 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {open && (
                <div
                    className={`${styles.dropdown} absolute z-30 mt-1 w-full min-w-full rounded-xl border border-[var(--color-border-primary)] py-1 shadow-xl ${
                        closing ? styles.closing : ""
                    }`}
                >
                    {options.map((opt) => (
                        <button
                            key={String(opt.value)}
                            type="button"
                            onClick={() => {
                                onChange(opt.value)
                                handleClose()
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-bg-hover)] cursor-pointer ${
                                opt.value === value ? "text-[var(--color-accent)]" : "text-[var(--color-text-primary)]"
                            } ${compact ? "py-2" : ""}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}