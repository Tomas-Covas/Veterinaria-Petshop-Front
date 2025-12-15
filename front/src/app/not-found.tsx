import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] bg-[#FBE5CB]">
      {/* Top "navbar-like" strip */}
      <div className="sticky top-0 z-10 border-b border-black/5 bg-[#F2EAE2]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            {/* Simple paw mark */}
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-black/5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M7.5 10.8c-1.1 0-2-1.05-2-2.35S6.4 6.1 7.5 6.1s2 1.05 2 2.35-.9 2.35-2 2.35Zm9 0c-1.1 0-2-1.05-2-2.35S15.4 6.1 16.5 6.1s2 1.05 2 2.35-.9 2.35-2 2.35ZM10.2 8.4c-1.05 0-1.9-.98-1.9-2.2S9.15 4 10.2 4s1.9.98 1.9 2.2-.85 2.2-1.9 2.2Zm3.6 0c-1.05 0-1.9-.98-1.9-2.2S12.75 4 13.8 4s1.9.98 1.9 2.2-.85 2.2-1.9 2.2Z"
                  fill="#FEA537"
                />
                <path
                  d="M12 20c-3.6 0-7-2.2-7-5.1 0-2.1 1.8-3.2 3.7-2.5.9.3 1.7.8 2.4 1.4.6.5 1.8.5 2.4 0 .7-.6 1.5-1.1 2.4-1.4 1.9-.7 3.7.4 3.7 2.5C19 17.8 15.6 20 12 20Z"
                  fill="#FF8C34"
                />
              </svg>
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-gray-900">Huellitas</span>
              <span className="-mt-1 block text-sm font-semibold text-[#FEA537]">Pet</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-gray-700 md:flex">
            <Link className="hover:text-gray-900" href="/store">Tienda</Link>
            <Link className="hover:text-gray-900" href="/ourHistory">Historia</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-xl bg-[#FEA537] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 active:translate-y-[1px]"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Orange gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C34] via-[#FFA344] to-[#FFB466]" />
        <div className="absolute inset-0 opacity-25">
          {/* soft pattern */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/30 blur-2xl" />
          <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-white/25 blur-2xl" />
          <div className="absolute left-1/2 top-40 h-80 w-80 -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-16">
          <div className="grid items-center gap-10 md:grid-cols-[1.1fr_.9fr]">
            <div className="text-white">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                <span className="h-2 w-2 rounded-full bg-white" />
                Error 404
              </p>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
                Uy… esta página se fue a olfatear por ahí 🐾
              </h1>

              <p className="mt-3 max-w-xl text-white/90">
                No encontramos lo que buscabas. Podés volver al inicio, ir a la tienda o buscar un producto.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-white/95 active:translate-y-[1px]"
                >
                  Volver al inicio
                </Link>
                <Link
                  href="/store"
                  className="rounded-2xl bg-black/15 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-black/20 active:translate-y-[1px]"
                >
                  Ir a la tienda
                </Link>
              </div>

              {/* Search-like bar */}
              <div className="mt-7 rounded-2xl bg-[#FDE8D2]/95 p-3 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-3 rounded-xl bg-[#FDE8D2] px-4 py-3 ring-1 ring-black/10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                      stroke="#7A5A3A"
                      strokeWidth="2"
                    />
                    <path
                      d="M16.5 16.5 21 21"
                      stroke="#7A5A3A"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    placeholder="Buscar productos por nombre o descripción…"
                    className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-500 outline-none"
                  />
                  <button
                    type="button"
                    className="rounded-xl bg-[#FEA537] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 active:translate-y-[1px]"
                  >
                    Buscar
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {["Alimentos", "Juguetes", "Higiene", "Accesorios"].map((t) => (
                    <Link
                      key={t}
                      href={`/store?category=${encodeURIComponent(t)}`}
                      className="rounded-full bg-white/70 px-3 py-1 font-semibold text-gray-700 ring-1 ring-black/5 hover:bg-white"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* 404 Card */}
            <div className="relative">
              <div className="rounded-3xl bg-white/90 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Código</p>
                    <p className="text-6xl font-extrabold tracking-tight text-gray-900">404</p>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#FF8C34] to-[#FEA537] text-white shadow-sm">
                    <span className="text-lg">🐶</span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-700">
                  Si llegaste acá desde un link interno, avisame y lo corregimos.
                </p>

                <div className="mt-6 grid gap-3">
                  <Link
                    href="/ourHistory"
                    className="group flex items-center justify-between rounded-2xl bg-[#F2EAE2] px-4 py-3 text-sm font-semibold text-gray-900 ring-1 ring-black/5 transition hover:brightness-98"
                  >
                    Conocer nuestra historia
                    <span className="opacity-60 transition group-hover:translate-x-0.5">→</span>
                  </Link>
                  <Link
                    href="/ourTeam"
                    className="group flex items-center justify-between rounded-2xl bg-[#F2EAE2] px-4 py-3 text-sm font-semibold text-gray-900 ring-1 ring-black/5 transition hover:brightness-98"
                  >
                    Ver nuestro equipo
                    <span className="opacity-60 transition group-hover:translate-x-0.5">→</span>
                  </Link>
                  <Link
                    href="/auth/login"
                    className="group flex items-center justify-between rounded-2xl bg-[#F2EAE2] px-4 py-3 text-sm font-semibold text-gray-900 ring-1 ring-black/5 transition hover:brightness-98"
                  >
                    Inicia sesión
                    <span className="opacity-60 transition group-hover:translate-x-0.5">→</span>
                  </Link>
                </div>
              </div>

              <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer hint */}
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 text-center text-xs text-gray-700/80">
        Volvé cuando quieras 🐾
      </div>
    </main>
  );
}
