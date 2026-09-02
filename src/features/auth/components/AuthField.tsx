import type { UseFormRegisterReturn } from 'react-hook-form';

type AuthFieldProps = {
    id: string;
    label: string;
    type: string;
    placeholder: string;
    hint?: string;
    autoComplete?: string;
    field?: UseFormRegisterReturn;
    error?: string;
};

const AuthField = ({
    id,
    label,
    type,
    placeholder,
    hint,
    autoComplete,
    field,
    error,
}: AuthFieldProps) => (
    <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-zinc-300">
            {label}
        </label>
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            {...field}
            className={`w-full rounded-lg border bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:outline-none ${
                error
                    ? 'border-red-500/70 focus:border-red-400 focus:ring-red-500/40'
                    : 'border-zinc-600 focus:border-zinc-400 focus:ring-zinc-500'
            }`}
        />
        {error ? (
            <p id={`${id}-error`} className="mt-1.5 text-xs text-red-400">
                {error}
            </p>
        ) : (
            hint && (
                <p id={`${id}-hint`} className="mt-1.5 text-xs text-zinc-400">
                    {hint}
                </p>
            )
        )}
    </div>
);

export default AuthField;
