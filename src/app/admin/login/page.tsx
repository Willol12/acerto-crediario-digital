import { ShieldCheck } from "lucide-react";
import { entrarAdmin } from "./actions";
import { getMeta } from "@/lib/db";

export const dynamic = "force-dynamic";

type Busca = Promise<{ erro?: string }>;

export default async function AdminLogin({ searchParams }: { searchParams: Busca }) {
  const { erro } = await searchParams;
  const semSenha = !(await getMeta("admin_senha_hash"));

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="reveal w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-display text-4xl font-black tracking-tight">
            Acerto<span className="text-brass">.</span>
          </p>
          <p className="mt-1 text-sm font-bold uppercase tracking-[0.2em] text-brass">
            Painel do dono
          </p>
        </div>

        {semSenha ? (
          <div className="rounded-3xl border border-border bg-surface p-6 text-sm leading-relaxed">
            <p className="font-bold">Senha do dono ainda não definida.</p>
            <p className="mt-2 text-muted">
              No computador, na pasta do projeto, rode:
            </p>
            <code className="mt-2 block rounded-xl bg-bg px-3 py-2 font-mono text-xs">
              npm run admin-senha -- sua-senha-forte
            </code>
            <p className="mt-2 text-muted">Depois recarregue esta página.</p>
          </div>
        ) : (
          <form
            action={entrarAdmin}
            className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6"
          >
            {erro && (
              <p className="rounded-2xl bg-debt/10 px-4 py-3 text-center text-sm font-bold text-debt">
                Senha incorreta.
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="senha" className="px-1 text-sm font-bold">
                Senha do dono
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                autoFocus
                autoComplete="current-password"
                className="w-full rounded-2xl border border-border bg-bg px-4 py-3.5 text-lg"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-4 text-lg font-extrabold text-bg transition-opacity hover:opacity-90 active:scale-[0.99]"
            >
              <ShieldCheck className="h-5 w-5" strokeWidth={2.5} />
              Entrar
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
