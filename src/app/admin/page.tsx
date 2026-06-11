import { LogOut, Plus, Store } from "lucide-react";
import { criarLoja, mudarSenhaLoja } from "./actions";
import { sairAdmin } from "./login/actions";
import { listarLojas } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Busca = Promise<{ criada?: string; senha_ok?: string; erro?: string }>;

export default async function AdminPainel({ searchParams }: { searchParams: Busca }) {
  const { criada, senha_ok, erro } = await searchParams;
  const lojas = await listarLojas();
  const autoProvisiona = process.env.TURSO_PLATFORM_TOKEN && process.env.TURSO_ORG;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12">
      <header className="reveal mb-6 flex items-center justify-between">
        <div>
          <p className="font-display text-3xl font-black tracking-tight">
            Acerto<span className="text-brass">.</span>
          </p>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brass">Painel do dono</p>
        </div>
        <form action={sairAdmin}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-bold text-muted hover:text-ink"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </form>
      </header>

      {criada && (
        <p className="reveal mb-4 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary">
          Loja “{criada}” criada. Usuário: <span className="font-mono">{criada}</span> — passe a
          senha que você definiu pro comerciante.
        </p>
      )}
      {senha_ok && (
        <p className="reveal mb-4 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary">
          Senha da loja “{senha_ok}” atualizada.
        </p>
      )}
      {erro && (
        <p className="reveal mb-4 rounded-2xl bg-debt/10 px-4 py-3 text-sm font-bold text-debt">
          {erro}
        </p>
      )}

      <section className="reveal mb-6 rounded-3xl border border-border bg-surface p-5 md:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-extrabold">
          <Plus className="h-5 w-5 text-primary" strokeWidth={3} /> Nova loja
        </h2>
        <form action={criarLoja} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nome" className="px-1 text-sm font-bold">
              Nome da loja
            </label>
            <input
              id="nome"
              name="nome"
              required
              placeholder="ex.: Padaria União"
              className="w-full rounded-2xl border border-border bg-bg px-4 py-3 text-base"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="slug" className="px-1 text-sm font-bold">
              Usuário <span className="font-normal text-muted">(login da loja, sem espaços)</span>
            </label>
            <input
              id="slug"
              name="slug"
              required
              autoCapitalize="none"
              spellCheck={false}
              placeholder="ex.: padaria-uniao"
              pattern="[a-z0-9-]{3,40}"
              className="w-full rounded-2xl border border-border bg-bg px-4 py-3 font-mono text-base"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="px-1 text-sm font-bold">
              Senha da loja <span className="font-normal text-muted">(8+ caracteres)</span>
            </label>
            <input
              id="senha"
              name="senha"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-border bg-bg px-4 py-3 text-base"
            />
          </div>

          {!autoProvisiona && (
            <details className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm">
              <summary className="cursor-pointer font-bold text-muted">
                Banco da loja (avançado)
              </summary>
              <p className="mt-2 text-xs text-muted">
                Sem a API do Turso configurada, a loja é criada num arquivo local (ótimo pra
                testar). Em produção, cole aqui a URL e o token do banco que você criou no painel do
                Turso — ou configure <span className="font-mono">TURSO_PLATFORM_TOKEN</span> +{" "}
                <span className="font-mono">TURSO_ORG</span> pra criar sozinho.
              </p>
              <input
                name="db_url"
                placeholder="libsql://… (opcional)"
                className="mt-2 w-full rounded-xl border border-border bg-bg px-3 py-2 font-mono text-xs"
              />
              <input
                name="db_token"
                placeholder="token do banco (opcional)"
                className="mt-2 w-full rounded-xl border border-border bg-bg px-3 py-2 font-mono text-xs"
              />
            </details>
          )}

          <button
            type="submit"
            className="mt-1 rounded-2xl bg-primary px-4 py-3.5 font-extrabold text-primary-fg shadow-lg shadow-primary/25 transition-colors hover:bg-primary-dark active:scale-[0.99]"
          >
            Criar loja
          </button>
          <p className="px-1 text-xs text-muted">
            {autoProvisiona
              ? "O banco da loja é criado automaticamente no Turso."
              : "Modo local: a loja é criada num arquivo (dev). Configure o Turso pra produção."}
          </p>
        </form>
      </section>

      <section className="reveal">
        <h2 className="ledger-head mb-3 flex items-center gap-2 px-1 font-display text-sm font-extrabold uppercase tracking-[0.14em]">
          <Store className="h-4 w-4" /> Lojas ({lojas.length})
        </h2>
        {lojas.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted">
            Nenhuma loja ainda. Crie a primeira acima.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {lojas.map((loja) => (
              <div key={loja.slug} className="rounded-3xl border border-border bg-surface p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-bold">{loja.nome}</p>
                  <p className="font-mono text-xs text-muted">{loja.slug}</p>
                </div>
                <form action={mudarSenhaLoja} className="mt-3 flex gap-2">
                  <input type="hidden" name="slug" value={loja.slug} />
                  <input
                    name="senha"
                    type="password"
                    required
                    minLength={8}
                    placeholder="nova senha (8+)"
                    autoComplete="new-password"
                    className="flex-1 rounded-xl border border-border bg-bg px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-xl border border-border px-3 py-2 text-sm font-bold text-ink hover:bg-surface-2"
                  >
                    Trocar senha
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
