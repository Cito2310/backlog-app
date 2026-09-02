import { Link } from 'react-router';
import AuthField from '../components/AuthField';
import AuthLayout from '../components/AuthLayout';
import { useRegisterPage } from '../hooks/useRegisterPage';

const RegisterPage = () => {
    const { confirmPasswordField, errors, isSubmitting, onSubmit, passwordField, usernameField } =
        useRegisterPage();

    return (
        <AuthLayout
            title="Creá tu cuenta"
            subtitle="Empezá a ordenar tus proyectos en features y tickets"
            footer={
                <>
                    ¿Ya tenés cuenta?{' '}
                    <Link to="/login" className="font-medium text-zinc-200 hover:text-white">
                        Iniciá sesión
                    </Link>
                </>
            }
        >
            <form className="space-y-4" onSubmit={onSubmit} autoComplete="off" noValidate>
                <AuthField
                    field={usernameField}
                    error={errors.username?.message}
                    id="username"
                    label="Usuario"
                    type="text"
                    placeholder="nombre de usuario"
                    hint="Entre 3 y 30 caracteres. Solo letras, números, punto, guion y guion bajo."
                    autoComplete="off"
                />
                <AuthField
                    field={passwordField}
                    error={errors.password?.message}
                    id="password"
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    hint="Mínimo 8 caracteres."
                    autoComplete="off"
                />
                <AuthField
                    field={confirmPasswordField}
                    error={errors.confirmPassword?.message}
                    id="confirmPassword"
                    label="Repetí la contraseña"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="off"
                />

                <div className="rounded-lg border border-amber-900/40 bg-amber-950/40 px-3 py-2.5">
                    <p className="text-xs text-amber-200/70">
                        Al terminar te vamos a mostrar un <strong>código de recuperación</strong>.
                        Se muestra una sola vez: guardalo antes de continuar.
                    </p>
                </div>

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
                    {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default RegisterPage;
