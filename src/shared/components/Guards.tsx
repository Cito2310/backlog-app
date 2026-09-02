import { useAppSelector } from "@/store/store";
import { Navigate, Outlet, useLocation } from "react-router";

export const ProtectedRoute = () => {
    const token = useAppSelector((state) => state.auth.token);
    const location = useLocation();

    // from queda guardado para volver acá después del login, en vez de ir siempre a /projects
    return token ? (
        <Outlet />
    ) : (
        <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
};

export const GuestRoute = () => {
    const token = useAppSelector((state) => state.auth.token);

    return token ? <Navigate to="/projects" replace /> : <Outlet />;
};