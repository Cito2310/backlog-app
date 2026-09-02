import { Link } from 'react-router';
import AuthField from '../components/AuthField';
import AuthLayout from '../components/AuthLayout';

const LoginPage = () => (
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
        <form className="space-y-4">
            <AuthField
                id="username"
                label="Usuario"
                type="text"
                placeholder="nombre de usuario"
                autoComplete="username"
            />
            <AuthField
                id="password"
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
            />

            <button
                type="submit"
                className="w-full rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
            >
                Entrar
            </button>
        </form>
    </AuthLayout>
);

export default LoginPage;
