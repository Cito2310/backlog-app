import { Navigate, Route, Routes } from 'react-router';
import { setTokenProvider, setUnauthorizedHandler } from '@/shared/api';
import { removeItem, writeItem } from '@/shared/api/localStorage';
import { STORAGE_KEYS } from '@/shared/api/storageKeys';
import { store } from '@/store/store';
import { authCleared } from './features/auth/authSlice';
import { loadUserByLocalStorage } from './features/auth/authThunks';
import { GuestRoute, ProtectedRoute } from './shared/components/Guards';

const initApp = () => {
    setTokenProvider(() => store.getState().auth.token);
    setUnauthorizedHandler(() => store.dispatch(authCleared()));

    let lastToken = store.getState().auth.token;
    let lastUser = store.getState().auth.user;

    store.subscribe(() => {
        const { token, user } = store.getState().auth;
        if (token === lastToken && user === lastUser) return;

        lastToken = token;
        lastUser = user;

        if (token && user) writeItem(STORAGE_KEYS.auth, { token, user });
        else removeItem(STORAGE_KEYS.auth);
    });

    void store.dispatch(loadUserByLocalStorage());
};

initApp();


const Placeholder = ({ title }: { title: string }) => (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
    </div>
);

const App = () => (
    <Routes>
        <Route element={<GuestRoute />}>
            <Route path="/login" element={<Placeholder title="Login" />} />
            <Route path="/register" element={<Placeholder title="Registro" />} />
        </Route>

        <Route element={<ProtectedRoute />}>
            <Route path="/projects" element={<Placeholder title="Proyectos" />} />
            <Route path="/projects/:id" element={<Placeholder title="Detalle del proyecto" />} />
            <Route path="/account" element={<Placeholder title="Cuenta" />} />
        </Route>

        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="*" element={<Placeholder title="404" />} />
    </Routes>
);

export default App;
