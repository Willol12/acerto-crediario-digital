import { KeyRound } from "lucide-react";
import { definirSenhaDono } from "./actions";

export const dynamic = "force-dynamic";

type Busca = Promise<{ erro?: string }>;

export default async function AdminSetup({ searchParams }: { searchParams: Busca }) {
  const { erro } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="reveal w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-display text-4xl font-black tracking-tight">
            Acerto<span className="text-brass">.</span>
          </p>
          <p className="mt-1 text-sm font-bold uppercase tracking-[0.2em] text-brass">
            Definir senha do dono
          </p>
        </div>

        <form
          action={definirSenhaDono}
          className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6"
        >
          {erro === "chave" && (
            <p className="rounded-2xl bg-debt/10 px-4 py-3 text-center text-sm font-bold text-debt">
              Chave de configuração incorreta.
            </p>
          )}
          {erro === "senha" && (
            <p className="rounded-2xl bg-debt/10 px-4 py-3 text-center text-sm font-bold text-debt">
              A senha precisa de 8+ caracteres.
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="chave" className="px-1 text-sm font-bold">
              Chave de configuração
            </label>
            <input
              id="chave"
              name="chave"
              required
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="cole o SESSION_SECRET"
              className="w-full rounded-2xl border border-border bg-bg px-4 py-3.5 font-mono text-sm"
            />
            <p className="px-1 text-xs text-muted">
              É o <span className="font-mono">SESSION_SECRET</span> que você pôs na Vercel — só você
              tem. Serve pra garantir que ninguém além de você defina a senha.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="px-1 text-sm font-bold">
              Nova senha do dono <span className="font-normal text-muted">(8+ caracteres)</span>
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-border bg-bg px-4 py-3.5 text-lg"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-4 text-lg font-extrabold text-bg transition-opacity hover:opacity-90 active:scale-[0.99]"
          >
            <KeyRound className="h-5 w-5" strokeWidth={2.5} />
            Definir senha
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Guardou a senha? Vá para <span className="font-bold">/admin/login</span>.
        </p>
      </div>
    </main>
  );
}
