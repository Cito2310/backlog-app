import ModalLayout from '@/shared/components/ModalLayout';
import { useRecoveryCodeModal } from '../hooks/useRecoveryCodeModal';

const RecoveryCodeModal = () => {
    const {
        acknowledge,
        canContinue,
        code,
        copyCode,
        copyFailed,
        hasCopied,
        isConfirmed,
        setIsConfirmed,
    } = useRecoveryCodeModal();

    return (
        <ModalLayout
            isOpen={code !== null}
            onClose={acknowledge}
            title="Guardá tu código de recuperación"
            size="sm"
            dismissible={false}
            footer={
                <button
                    type="button"
                    onClick={acknowledge}
                    disabled={!canContinue}
                    className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Continuar
                </button>
            }
        >
            <div className="space-y-4">
                <div className="rounded-lg border border-amber-900/40 bg-amber-950/40 px-3 py-2.5">
                    <p className="text-xs text-amber-200/80">
                        Se muestra <strong>una sola vez</strong>. Si lo perdés no hay forma de
                        recuperar tu cuenta, y si recargás esta página desaparece.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 font-mono text-sm break-all text-zinc-100 select-all">
                        {code}
                    </code>
                    <button
                        type="button"
                        onClick={() => void copyCode()}
                        className="shrink-0 rounded-lg border border-zinc-600 px-3 py-2 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-600"
                    >
                        {hasCopied ? 'Copiado' : 'Copiar'}
                    </button>
                </div>

                {copyFailed && (
                    <p className="text-xs text-amber-300">
                        No se pudo usar el portapapeles. Seleccionalo y copialo a mano.
                    </p>
                )}

                <label className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <input
                        type="checkbox"
                        checked={isConfirmed}
                        onChange={(event) => setIsConfirmed(event.target.checked)}
                        className="mt-0.5 size-4 shrink-0 accent-zinc-100"
                    />
                    Ya lo guardé en un lugar seguro
                </label>

                {!hasCopied && (
                    <p className="text-xs text-zinc-400">Copiá el código para poder continuar.</p>
                )}
            </div>
        </ModalLayout>
    );
};

export default RecoveryCodeModal;
