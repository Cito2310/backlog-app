const Navbar = () => (
    <header className="border-b border-zinc-700">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <p className="text-xs font-medium tracking-[0.2em] text-zinc-400 uppercase">
                Backlog App
            </p>

            <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-400">cito</span>
                <button
                    type="button"
                    className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
                >
                    Salir
                </button>
            </div>
        </div>
    </header>
);

export default Navbar;
