"use client"

import styles from './templateHomePage.module.css'
import { ChatRoomWidget } from "@/widgets/chat-room"
import { LessonTimer } from "@/shared/ui/lesson-timer/ui/LessonTimer"
import { NotificationToast } from "@/shared/ui/notification-toast/ui/NotificationToast"
import { ClassroomClosedModal } from "@/shared/ui/ClassroomClosedModal"
import { useTemplateHomePage } from "../model/useTemplateHomePage"

export function TemplateHomePage() {
  const {
    sessionId,
    expiresAt,
    showNotification,
    notificationMessage,
    dismissNotification,
    isClosed,
    closeMessage,
    isExpired,
    handleExit,
    handleExitToHome,
  } = useTemplateHomePage()

  return (
    <main className="mx-auto flex h-screen w-full max-w-5xl flex-col overflow-hidden px-4 !pb-0">
            {showNotification && (
                <NotificationToast message={notificationMessage} onClose={dismissNotification} />
            )}
            <header className={`${styles.template__header} max-[650px]:p-5 page__animation-opacity p-10 mb-4 flex items-center justify-between `}>
                <div className={`${styles.header__info} flex gap-4`}>
                    {sessionId && (
                        <span className="text-xs text-[var(--color-text-muted)] font-mono" title="ID вашей сессии">
                            {sessionId}
                        </span>
                    )}
                    {expiresAt && <LessonTimer expiresAt={expiresAt} />}
                </div>
                <button
                    onClick={handleExit}
                    className={`${styles.template__exit} cursor-pointer flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-hover)]`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Выйти
                </button>
            </header>
            <ChatRoomWidget />
            {(isClosed || isExpired) && (
                <ClassroomClosedModal
                    message={closeMessage || "Время урока истекло"}
                    onExit={handleExitToHome}
                />
            )}
        </main>
  )
}