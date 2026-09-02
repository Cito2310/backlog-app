type AuthFieldProps = {
    id: string;
    label: string;
    type: string;
    placeholder: string;
    hint?: string;
    autoComplete?: string;
};

const AuthField = ({ id, label, type, placeholder, hint, autoComplete }: AuthFieldProps) => (
    <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-zinc-300">
            {label}
        </label>
        <input
            id={id}
            name={id}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:outline-none"
        />
        {hint && <p className="mt-1.5 text-xs text-zinc-400">{hint}</p>}
    </div>
);

export default AuthField;
