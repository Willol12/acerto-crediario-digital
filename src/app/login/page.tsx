import { Lock } from "lucide-react";
import { entrar } from "./actions";

export const dynamic = "force-dynamic";

type Busca = Promise<{ erro?: string }>;

export default async function Login({ searchParams }: { searchParams: Busca }) {
  const { erro } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="reveal w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-display text-4xl font-black tracking-tight">
            Acerto<span className="text-brass">.</span>
          </p>
          <p className="mt-1 text-sm text-muted">crediário digital</p>
        </div>

        <form
          action={entrar}
          className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6"
        >
          {erro && (
            <p className="rounded-2xl bg-debt/10 px-4 py-3 text-center text-sm font-bold text-debt">
              Usuário ou senha incorretos. Tente de novo.
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="usuario" className="px-1 text-sm font-bold">
              Usuário da loja
            </label>
            <input
              id="usuario"
              name="usuario"
              required
              autoFocus
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="ex.: mercearia-do-ze"
              className="w-full rounded-2xl border border-border bg-bg px-4 py-3.5 text-lg"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="px-1 text-sm font-bold">
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-border bg-bg px-4 py-3.5 text-lg"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-lg font-extrabold text-primary-fg shadow-lg shadow-primary/25 transition-colors hover:bg-primary-dark active:scale-[0.99]"
          >
            <Lock className="h-5 w-5" strokeWidth={2.5} />
            Entrar
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Esqueceu a senha? Fale com quem instalou o sistema.
        </p>
      </div>
    </main>
  );
}
