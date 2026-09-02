import { Link } from 'react-router';
import FormField from '@/shared/components/FormField';
import AuthLayout from '../components/AuthLayout';
import { useLoginPage } from '../hooks/useLoginPage';

const LoginPage = () => {
    const { errors, isSubmitting, onSubmit, passwordField, usernameField } = useLoginPage();

    return (
        <AuthLayout
            title="Iniciá sesión"
            subtitle="Entrá para ver el backlog de tus proyectos"
            footer={
                <>
                    ¿No tenés cuenta?{' '}
                    <Link to="/register" className="font-medium text-zinc-200 hover:text-white">
                        Creá una
                    </Link>
                </>
            }
        >
            <form className="space-y-4" onSubmit={onSubmit} noValidate>
                <FormField
                    field={usernameField}
                    error={errors.username?.message}
                    id="username"
                    label="Usuario"
                    type="text"
                    placeholder="nombre de usuario"
                    autoComplete="username"
                />
                <FormField
                    field={passwordField}
                    error={errors.password?.message}
                    id="password"
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                />

                {errors.root && (
                    <p
                        role="alert"
                        className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-300"
                    >
                        {errors.root.message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? 'Entrando…' : 'Entrar'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;
