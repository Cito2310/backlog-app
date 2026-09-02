import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { isApiError } from '@/shared/api';

// El 400 es el único que dice qué campo falló; el resto va a root, que es el cartel general
export const applyApiError = <T extends FieldValues>(
    error: unknown,
    setError: UseFormSetError<T>,
    fields: string[],
) => {
    if (!isApiError(error)) {
        setError('root', { message: 'Ocurrió un error inesperado' });
        return;
    }

    if (error.isValidationError) {
        error.errors.forEach(({ field, msg }) => {
            if (fields.includes(field)) setError(field as Path<T>, { message: msg });
        });
        return;
    }

    setError('root', { message: error.msg });
};
