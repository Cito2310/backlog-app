import RecoveryCodeModal from '@/features/auth/components/RecoveryCodeModal';
import Navbar from '@/features/navbar/Navbar';
import { useAppSelector } from '@/store/store';
import { Navigate, Outlet, useLocation } from 'react-router';

export const ProtectedRoute = () => {
    const token = useAppSelector((state) => state.auth.token);
    const location = useLocation();

    // from queda guardado para volver acá después del login, en vez de ir siempre a /projects
    if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

    return (
        <div className="min-h-screen bg-zinc-800">
            <Navbar />
            <Outlet />
            <RecoveryCodeModal />
        </div>
    );
};

export const GuestRoute = () => {
    const token = useAppSelector((state) => state.auth.token);

    return token ? <Navigate to="/projects" replace /> : <Outlet />;
};
