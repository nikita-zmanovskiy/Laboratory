import styles from './filePreview.module.css'

interface FilePreviewProps {
    imagePreview: string
    isLoading: boolean
    onRemove: () => void
}

export const FilePreview = ({ imagePreview, isLoading, onRemove }: FilePreviewProps) => (
    <div
        onClick={onRemove}
        className={`${styles.filePreview__wrapper} group relative h-20 w-20 overflow-hidden rounded-xl border border-[var(--color-border-primary)] ${isLoading ? "cursor-default" : "cursor-pointer"}`}
    >
        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
        <div className={`absolute inset-0 flex items-center justify-center bg-[var(--color-bg-primary)]/40 ${isLoading ? "" : "opacity-0 group-hover:opacity-100"}`}>
            <div className="rounded-full bg-white/20 p-1.5 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4 text-[var(--color-text-primary)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
        </div>
    </div>
)