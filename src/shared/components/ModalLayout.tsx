import { useEffect, useId, useRef } from 'react';
import type { MouseEvent, ReactNode, SyntheticEvent } from 'react';

type ModalSize = 'sm' | 'md' | 'lg';

type ModalLayoutProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: ModalSize;
    closeOnBackdrop?: boolean;
};

const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
};

type UseModalLayoutParams = Pick<ModalLayoutProps, 'isOpen' | 'onClose' | 'closeOnBackdrop'>;

const useModalLayout = ({ isOpen, onClose, closeOnBackdrop }: UseModalLayoutParams) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen && !dialog.open) dialog.showModal();
        if (!isOpen && dialog.open) dialog.close();

        document.body.style.overflow = isOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // El evento cancel cubre Escape: se previene para que todo cierre pase por onClose
    const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
        event.preventDefault();
        onClose();
    };

    // El click sobre el backdrop llega con el dialog como target, no con su contenido
    const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
        if (!closeOnBackdrop) return;
        if (event.target === dialogRef.current) onClose();
    };

    return { dialogRef, handleCancel, handleBackdropClick };
};

const ModalLayout = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    closeOnBackdrop = true,
}: ModalLayoutProps) => {
    const titleId = useId();
    const { dialogRef, handleCancel, handleBackdropClick } = useModalLayout({
        isOpen,
        onClose,
        closeOnBackdrop,
    });

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={handleCancel}
            onClick={handleBackdropClick}
            className={`m-auto w-full ${sizeClasses[size]} max-h-[85vh] overflow-hidden rounded-xl border border-zinc-600 bg-zinc-700 p-0 text-zinc-100 backdrop:bg-black/60`}
        >
            <div className="flex max-h-[85vh] flex-col">
                <header className="flex items-center justify-between gap-4 border-b border-zinc-600 px-5 py-4">
                    <h2 id={titleId} className="text-lg font-semibold">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-600 hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
                    >
                        <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            className="size-5"
                            aria-hidden="true"
                        >
                            <path d="M5 5l10 10M15 5L5 15" />
                        </svg>
                    </button>
                </header>

                <div className="overflow-y-auto px-5 py-4">{children}</div>

                {footer && (
                    <footer className="flex justify-end gap-2 border-t border-zinc-600 px-5 py-4">
                        {footer}
                    </footer>
                )}
            </div>
        </dialog>
    );
};

export default ModalLayout;
