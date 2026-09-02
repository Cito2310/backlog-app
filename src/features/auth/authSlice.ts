import type { LoginResponse, RegisterResponse, StoredAuth, User } from '@/types/auth';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type Status = 'uninitialized' | 'ok' | 'loading' | 'failed' | 'success';

type AuthState = {
    token: string | null;
    user: User | null;
    status: Status;
    error: string | null;
    pendingRecoveryCode: string | null;
};

const initialState: AuthState = {
    token: null,
    user: null,
    status: 'uninitialized',
    error: null,
    pendingRecoveryCode: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        authRequestStarted: (state) => {
            state.status = 'loading';
            state.error = null;
        },
        authRequestFailed: (state, action: PayloadAction<string>) => {
            state.status = 'failed';
            state.error = action.payload;
        },

        authLoaded: (state, action: PayloadAction<LoginResponse | RegisterResponse>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.status = 'success';
            state.error = null;
            state.pendingRecoveryCode =
                'recoveryCode' in action.payload ? action.payload.recoveryCode : null;
        },

        authRestored: (state, action: PayloadAction<StoredAuth>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.status = 'ok';
            state.error = null;
            state.pendingRecoveryCode = null;
        },

        authCleared: (state) => {
            state.error = null;
            state.pendingRecoveryCode = null;
            state.status = 'ok';
            state.user = null;
            state.token = null;
        },

        userRefreshed: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },

        recoveryCodeAcknowledged: (state) => {
            state.pendingRecoveryCode = null;
        },
    },
});

export const {
    authCleared,
    authLoaded,
    authRequestFailed,
    authRequestStarted,
    authRestored,
    recoveryCodeAcknowledged,
    userRefreshed,
} = authSlice.actions;
