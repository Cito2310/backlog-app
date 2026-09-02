export type User = {
    _id: string;
    username: string;
    recoveryCodeUsedAt: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

export type LoginResponse = { user: User; token: string };
export type RegisterResponse = { user: User; token: string; recoveryCode: string };
export type MeResponse = { user: User };

export type AuthBody = {
    username: string;
    password: string;
};

// Lo que se guarda en el localStorage: es la respuesta del login sin el recoveryCode
export type StoredAuth = { user: User; token: string };
