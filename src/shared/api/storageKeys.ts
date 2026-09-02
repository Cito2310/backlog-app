const PREFIX = 'backlog-app';

export const STORAGE_KEYS = {
    auth: `${PREFIX}.auth`,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
