import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { isApiError } from '@/shared/api';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { AuthBody } from '@/types/auth';
import { applyApiError } from '@/shared/applyApiError';
import { register as registerAccount } from '../authThunks';

type RegisterBody = AuthBody & { confirmPassword: string };

const USERNAME_RULES = {
    required: 'Elegí un usuario',
    minLength: { value: 3, message: 'Mínimo 3 caracteres' },
    maxLength: { value: 30, message: 'Máximo 30 caracteres' },
    pattern: {
        value: /^[a-z0-9._-]+$/i,
        message: 'Solo letras, números, punto, guion y guion bajo',
    },
};

const PASSWORD_RULES = {
    required: 'Elegí una contraseña',
    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
};

export const useRegisterPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const isSubmitting = useAppSelector((state) => state.auth.status === 'loading');

    const { register, handleSubmit, setError, formState, getValues } = useForm<RegisterBody>({
        defaultValues: { username: '', password: '', confirmPassword: '' },
    });

    const onSubmit = handleSubmit(async ({ username, password }) => {
        try {
            await dispatch(registerAccount({ username, password }));
            void navigate('/projects', { replace: true });
        } catch (error) {
            // El 409 no trae errors[], pero sabemos que siempre es el username duplicado
            if (isApiError(error) && error.status === 409) {
                setError('username', { message: 'Ese usuario ya está tomado' });
                return;
            }

            applyApiError(error, setError, ['username', 'password']);
        }
    });

    return {
        onSubmit,
        isSubmitting,
        errors: formState.errors,
        usernameField: register('username', USERNAME_RULES),
        passwordField: register('password', PASSWORD_RULES),
        confirmPasswordField: register('confirmPassword', {
            required: 'Repetí la contraseña',
            validate: (value) => value === getValues('password') || 'Las contraseñas no coinciden',
        }),
    };
};
