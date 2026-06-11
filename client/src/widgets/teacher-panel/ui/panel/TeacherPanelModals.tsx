import { ClassroomClosedModal } from "@/shared/ui/ClassroomClosedModal"
import { ConfirmModal } from "@/shared/ui/ConfirmModal"
import { TeacherPanelModalsProps } from "../../types"


export const TeacherPanelModals = ({
    showConfirm,
    isDeactivating,
    isExpired,
    onConfirmDeactivate,
    onCloseConfirm,
    onExitToHome,
}: TeacherPanelModalsProps) => (
    <>
        {showConfirm && (
            <ConfirmModal
                title="Завершить урок?"
                message="Все ученики потеряют доступ к классу. Это действие нельзя отменить."
                confirmLabel="Завершить"
                cancelLabel="Отмена"
                isLoading={isDeactivating}
                onConfirm={onConfirmDeactivate}
                onCancel={onCloseConfirm}
            />
        )}
        {isExpired && (
            <ClassroomClosedModal
                message="Время урока истекло"
                onExit={onExitToHome}
            />
        )}
    </>
)
