import type { ReactNode } from 'react';

type AuthLayoutProps = {
    title: string;
    subtitle: string;
    children: ReactNode;
    footer: ReactNode;
};

const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => (
    <div className="flex min-h-screen items-center justify-center bg-zinc-800 px-4 py-10">
        <div className="w-full max-w-sm">
            <p className="mb-5 text-center text-xs font-medium tracking-[0.2em] text-zinc-400 uppercase">
                Backlog App
            </p>

            <div className="rounded-xl border border-zinc-600 bg-zinc-700 p-6 shadow-xl shadow-black/30">
                <div className="mb-6 text-center">
                    <h1 className="text-xl font-semibold text-zinc-50">{title}</h1>
                    <p className="mt-1.5 text-sm text-zinc-400">{subtitle}</p>
                </div>

                {children}
            </div>

            <p className="mt-6 text-center text-sm text-zinc-400">{footer}</p>
        </div>
    </div>
);

export default AuthLayout;
