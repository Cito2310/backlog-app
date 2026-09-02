import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { recoveryCodeAcknowledged } from '../authSlice';

export const useRecoveryCodeModal = () => {
    const dispatch = useAppDispatch();
    const code = useAppSelector((state) => state.auth.pendingRecoveryCode);

    const [hasCopied, setHasCopied] = useState(false);
    const [copyFailed, setCopyFailed] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(code ?? '');
            setCopyFailed(false);
        } catch {
            // Sin portapapeles hay que destrabar igual, o el modal queda imposible de cerrar
            setCopyFailed(true);
        }
        setHasCopied(true);
    };

    const acknowledge = () => {
        dispatch(recoveryCodeAcknowledged());
        setHasCopied(false);
        setCopyFailed(false);
        setIsConfirmed(false);
    };

    return {
        code,
        hasCopied,
        copyFailed,
        isConfirmed,
        setIsConfirmed,
        copyCode,
        acknowledge,
        canContinue: hasCopied && isConfirmed,
    };
};
