import { useState, useEffect } from 'react'
import { CustomSelect } from '@/shared/ui/CustomSelect'
import styles from './createClassroom.module.css'

interface CreateClassroomFormProps {
    title: string
    grade: number
    duration: number
    isLoading: boolean
    error: string | null
    durationOptions: { label: string; value: number }[]
    onTitleChange: (value: string) => void
    onGradeChange: (value: number) => void
    onDurationChange: (value: number) => void
    onSubmit: () => void
    onBack: () => void
    onOpenCurrentClass: () => void
    currentClass: { code: string; title: string; expires_at: string } | null
    loadingMessage?: string
}

const gradeOptions = [5, 6, 7, 8, 9, 10, 11]

export const CreateClassroomForm = ({
    title,
    grade,
    duration,
    isLoading,
    error,
    durationOptions,
    onTitleChange,
    onGradeChange,
    onDurationChange,
    onSubmit,
    onBack,
    currentClass, 
    onOpenCurrentClass,
    loadingMessage = "Создаём класс...",
}: CreateClassroomFormProps) => {
    const [visibleError, setVisibleError] = useState<string | null>(null)

    useEffect(() => {
        if (error) {
            setVisibleError(error)
        } else {
            const timer = setTimeout(() => setVisibleError(null), 300)
            return () => clearTimeout(timer)
        }
    }, [error])

    return (
        <div className={`${styles.createClassroom__wrapper} page__animation-opacity flex h-screen items-center justify-center relative`}>
            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--color-bg-primary)]/80">
                    <div className="flex flex-col items-center gap-3">
                        <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        <p className="text-sm text-white/80">{loadingMessage}</p>
                    </div>
                </div>
            )}

            {currentClass && (
                <button
                    onClick={onOpenCurrentClass}
                    disabled={isLoading}
                    className={`${styles.createClassroom__button} rounded-xl page__animation max-w-[200px] cursor-pointer bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/20 px-4 py-2 text-sm text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Текущий урок: {currentClass.title}
                </button>
            )}
            <div className="w-full page__animation max-w-md rounded-2xl p-8">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Создание класса</h1>
                    <svg width="18px" height="18px" fill="var(--color-text-primary)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g id="EDUCATION_OUTLINE" data-name="EDUCATION OUTLINE"><path d="M139,135c-24.73,0-39.23,11.78-44.39,29.5L116,171.21c3.51-10.71,13.54-14.7,23-14.7,14.31,0,20.63,5.65,21.51,17.72-18.4,2.73-34.65,5-45.75,8.57-16.65,5.74-24,16.16-24,31.45,0,17.32,12.36,31.73,35.24,31.73,16.74,0,27.94-5.35,36.89-17v14.11h20.54V178.52c0-9.06-.29-16.55-4-24C172.58,140.64,157.69,135,139,135Zm18.88,74.86c-2.34,7.31-11.19,17.43-27.16,17.43-11.09,0-16.94-5.65-16.94-13.34,0-6.81,4.68-10.8,12.76-13.82,7.4-2.53,16.93-4,33.68-6.62C160.12,198.38,159.83,205.09,157.88,209.86Z"/><path d="M307.3,190.49c0-31.93-19.08-55.49-48.87-55.49-10.51,0-19.17,2.92-26.18,8.08V102.87H208.59V243.06h20.74v-7.79c7.49,6.82,17.52,10.71,30,10.71C288.42,246,307.3,222,307.3,190.49Zm-78,0C229.33,170,237,156,254.93,156c18.88,0,27.55,15.38,27.55,34.46,0,19.28-8.47,34.46-26.77,34.46C236.82,225,229.33,210.84,229.33,190.49Z"/><path d="M374.37,246c23.46,0,40.3-11.88,46.82-33.29l-23.94-5.36C393.64,218.14,386.83,224,374.37,224c-17.62,0-26.58-13.43-26.67-33.49C347.79,171.21,356,157,374.37,157c10.55,0,19.58,6.42,23.29,17.4a.56.56,0,0,0,.68.37l22.31-6a.59.59,0,0,0,.41-.7c-5.15-20.41-22.76-33-46.4-33-31.93,0-51.68,23.27-51.79,55.49C323,222.23,341.86,246,374.37,246Z"/><path d="M15.32,337.14c17.91,3.54,47.8,7.75,82.73,11.4L67.16,488.91a19,19,0,0,0,14.48,22.64,18.52,18.52,0,0,0,4.1.45,19,19,0,0,0,18.53-14.92l9.52-43.25c25.78,2.31,82.44,6.78,134,6.78q4.11,0,8.12,0c37.61.37,91.76-2.21,142.34-6.75l9.52,43.26A19,19,0,0,0,426.35,512a18.66,18.66,0,0,0,4.1-.45,19,19,0,0,0,14.47-22.64l-30.8-140c32.78-3.3,62-7.2,82.32-10.95a19,19,0,1,0-6.89-37.37c-5.21,1-11.34,2-18.25,3,2.28-28.59,4-68.16,4-91.84-.06-33.68-3.74-104.6-8-125.08l-.05-.25c-8.24-37.18-43-70.77-81-78.16C369,4.86,311.63,1.17,273.71.27,272.57.23,266,0,256.77,0c-10.52,0-17.92.18-18.66.2C200.45.92,139.5,4.8,121.89,8.31c-37.95,7.39-72.77,41-81,78.16a2,2,0,0,0,0,.24c-4.26,20.47-7.94,91.4-8,125.16,0,23.13,1.68,62,3.9,90.5-5.28-.86-10-1.7-14.07-2.51a19,19,0,0,0-7.36,37.28ZM390.06,416.4c-48.07,4.18-98.64,6.53-133.92,6.17h-.38q-3.91,0-7.93,0c-47.11,0-98.84-3.86-125.81-6.2l14.15-64.3c36.85,3.06,76.2,5.16,111.51,5.16H268.6c33.45-.11,71.25-2,107.37-4.88ZM70.84,211.87c.06-33.64,3.84-101,7.17-117.31,5.06-22.51,28-44.46,51.17-49l.11,0c14-2.79,71.33-6.66,109.62-7.39H239c.07,0,7.39-.18,17.74-.18,9.14,0,15.54.25,15.6.25h.31c38.28.89,92.86,4.66,106.19,7.32l.1,0c23.19,4.5,46.12,26.45,51.17,49,3.33,16.29,7.11,83.68,7.17,117.24,0,24.84-2.06,69.62-4.56,96.87-47.93,5.52-110.65,10.42-164.28,10.6-6,0-20.73,0-20.76,0-56.43,0-123.25-5.49-172.39-11.51C72.86,280.47,70.88,236.22,70.84,211.87Z"/></g></svg>
                </div>
                <div className="relative h-5 mt-1">
                    <p className={`text-sm text-[var(--color-text-secondary)] absolute inset-0 transition-all duration-300 ${
                        visibleError ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
                    }`}>
                        Заполните данные для нового урока
                    </p>
                    <p className={`text-sm text-[var(--color-text-error)] absolute inset-0 transition-all duration-300 ${
                        visibleError ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}>
                        {visibleError || ""}
                    </p>
                </div>

                <div className="mt-6 space-y-4">
                    <div className="flex center items-center">
                        <label className={`block text-sm font-medium mr-2 ${styles.label}`}>Название класса</label>
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => onTitleChange(e.target.value)}
                                placeholder="Например: 7А Физика"
                                maxLength={100}
                                disabled={isLoading}
                                className={`mt-1 w-full rounded-xl px-4 py-3.5 text-sm disabled:opacity-50 ${styles.input}`}
                            />
                            <div className={`${styles.create__limit} absolute right-3 font-mono text-[11px] ${title.length >= 100 ? styles.counterLimit : styles.counter}`}>
                                {title.length}/100
                            </div>
                        </div>
                    </div>

                    <CustomSelect
                        label="Класс (возраст)"
                        value={grade}
                        options={gradeOptions.map((g) => ({ label: `${g} класс`, value: g }))}
                        onChange={onGradeChange}
                        disabled={isLoading}
                    />

                    <CustomSelect
                        label="Длительность"
                        value={duration}
                        options={durationOptions}
                        onChange={onDurationChange}
                        disabled={isLoading}
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={onBack}
                            disabled={isLoading}
                            className={`flex-1 cursor-pointer rounded-xl px-4 py-3 text-sm font-medium transition-all ${styles.backButton}`}
                        >
                            Назад
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={isLoading || !title.trim()}
                            className={`flex-1 rounded-xl cursor-pointer px-4 py-3 text-sm font-medium text-white relative overflow-hidden ${styles.submitButton}`}
                        >
                            {isLoading && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                </span>
                            )}
                            <span className={isLoading ? 'invisible' : ''}>Создать класс</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}