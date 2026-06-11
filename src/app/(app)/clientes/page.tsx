import Link from "next/link";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { listarClientesComSaldo } from "@/lib/db";
import { diasAtras, formatarReais } from "@/lib/format";

export const dynamic = "force-dynamic";

type Busca = Promise<{ q?: string }>;

export default async function Clientes({ searchParams }: { searchParams: Busca }) {
  const { q } = await searchParams;
  const clientes = await listarClientesComSaldo(q?.trim() || undefined);

  return (
    <main className="flex flex-col gap-6">
      <header className="reveal flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass">Livro</p>
          <h1 className="font-display text-3xl font-black tracking-tight">Clientes</h1>
        </div>
        <Link
          href="/clientes/novo"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-fg transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" strokeWidth={3} /> Novo
        </Link>
      </header>

      <form action="/clientes" className="reveal relative" style={{ "--d": "60ms" } as React.CSSProperties}>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar pelo nome…"
          className="w-full rounded-2xl border border-border bg-surface py-3 pl-11 pr-4 text-base md:max-w-md"
        />
      </form>

      {clientes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-7 text-center">
          <p className="font-bold">
            {q ? `Nenhum cliente encontrado para “${q}”.` : "Nenhum cliente cadastrado ainda."}
          </p>
          {!q && (
            <p className="mt-1 text-sm text-muted">
              Cadastre quem compra na conta com você — leva menos de 30 segundos.
            </p>
          )}
        </div>
      ) : (
        <div
          className="pautado reveal overflow-hidden rounded-3xl border border-border bg-surface"
          style={{ "--d": "120ms" } as React.CSSProperties}
        >
          {clientes.map((c) => {
            const devendo = c.saldo_centavos > 0;
            const dias = diasAtras(c.ultima_compra);
            return (
              <Link
                key={c.id}
                href={`/clientes/${c.id}`}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2 active:bg-surface-2 md:px-5"
              >
                <Avatar nome={c.nome} devendo={devendo} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{c.nome}</p>
                  <p className="text-xs text-muted">{c.telefone || "sem telefone"}</p>
                </div>
                <p className="hidden w-40 shrink-0 text-sm text-muted md:block">
                  {dias === null
                    ? "sem compras"
                    : dias === 0
                      ? "comprou hoje"
                      : `última compra há ${dias}d`}
                </p>
                {devendo ? (
                  <p className="tnum shrink-0 font-mono font-semibold text-debt">
                    {formatarReais(c.saldo_centavos)}
                  </p>
                ) : (
                  <span className="stamp shrink-0 text-primary">em dia</span>
                )}
                <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
