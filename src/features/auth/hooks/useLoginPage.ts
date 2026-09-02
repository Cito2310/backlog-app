import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { AuthBody } from '@/types/auth';
import { applyApiError } from '@/shared/applyApiError';
import { login } from '../authThunks';

type RedirectState = { from?: string } | null;

const USERNAME_RULES = {
    required: 'Escribí tu usuario',
    minLength: { value: 3, message: 'Mínimo 3 caracteres' },
    maxLength: { value: 30, message: 'Máximo 30 caracteres' },
};

const PASSWORD_RULES = {
    required: 'Escribí tu contraseña',
    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
};

export const useLoginPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isSubmitting = useAppSelector((state) => state.auth.status === 'loading');

    const { register, handleSubmit, setError, formState } = useForm<AuthBody>({
        defaultValues: { username: '', password: '' },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await dispatch(login(values));

            const from = (location.state as RedirectState)?.from;
            void navigate(from ?? '/projects', { replace: true });
        } catch (error) {
            applyApiError(error, setError, ['username', 'password']);
        }
    });

    return {
        onSubmit,
        isSubmitting,
        errors: formState.errors,
        usernameField: register('username', USERNAME_RULES),
        passwordField: register('password', PASSWORD_RULES),
    };
};
