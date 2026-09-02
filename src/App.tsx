import { setTokenProvider, setUnauthorizedHandler } from '@/shared/api';
import { removeItem, writeItem } from '@/shared/api/localStorage';
import { STORAGE_KEYS } from '@/shared/api/storageKeys';
import { store } from '@/store/store';
import { authCleared } from './features/auth/authSlice';
import { loadUserByLocalStorage } from './features/auth/authThunks';

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

const App = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
            <h1 className="text-2xl font-semibold text-slate-100">Backlog App</h1>
        </div>
    );
};

export default App;
