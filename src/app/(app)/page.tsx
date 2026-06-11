import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { getConfig, listarDevedores, recebidoNoMes, totalAReceber } from "@/lib/db";
import { diasAtras, formatarReais, mesAtualSaoPaulo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Painel() {
  const loja = await getConfig("nome_loja", "Minha loja");
  const { total_centavos, devedores } = await totalAReceber();
  const listaDevedores = await listarDevedores();
  const recebido = await recebidoNoMes(mesAtualSaoPaulo());

  return (
    <main className="flex flex-col gap-6">
      <header className="reveal">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass">Acerto</p>
        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">{loja}</h1>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <div
          className="banknote reveal relative overflow-hidden rounded-3xl p-5 text-primary-fg md:col-span-2 md:p-7"
          style={{ "--d": "60ms" } as React.CSSProperties}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] opacity-70">
            Total a receber
          </p>
          <p className="tnum mt-2 font-mono text-4xl font-semibold md:text-5xl">
            {formatarReais(total_centavos)}
          </p>
          <p className="mt-3 text-sm opacity-80">
            {devedores === 0
              ? "Ninguém devendo — tudo em dia"
              : devedores === 1
                ? "1 cliente com conta aberta"
                : `${devedores} clientes com conta aberta`}
          </p>
          <p className="absolute bottom-4 right-5 hidden text-[9px] font-bold uppercase tracking-[0.34em] opacity-40 md:block">
            Crediário digital
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
          <div
            className="reveal rounded-3xl border border-border bg-surface p-4 md:p-5"
            style={{ "--d": "120ms" } as React.CSSProperties}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              Devedores
            </p>
            <p className="tnum mt-1 font-mono text-2xl font-semibold text-debt">{devedores}</p>
          </div>
          <div
            className="reveal rounded-3xl border border-border bg-surface p-4 md:p-5"
            style={{ "--d": "180ms" } as React.CSSProperties}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              Recebido no mês
            </p>
            <p className="tnum mt-1 font-mono text-2xl font-semibold text-primary">
              {formatarReais(recebido)}
            </p>
          </div>
        </div>
      </section>

      <section className="reveal flex flex-col gap-3" style={{ "--d": "240ms" } as React.CSSProperties}>
        <div className="ledger-head flex items-baseline justify-between px-1">
          <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.14em] text-ink">
            Quem está devendo
          </h2>
          <span className="text-xs text-muted">{listaDevedores.length} no livro</span>
        </div>

        {listaDevedores.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface p-7 text-center">
            <span className="stamp text-primary">Tudo em dia</span>
            <p className="mt-3 text-sm text-muted">
              Toque em <span className="font-bold text-primary">Lançar</span> para anotar a
              primeira venda na conta.
            </p>
            <Link
              href="/lancar"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-bold text-primary-fg"
            >
              <Plus className="h-4 w-4" strokeWidth={3} /> Lançar venda
            </Link>
          </div>
        ) : (
          <div className="pautado overflow-hidden rounded-3xl border border-border bg-surface">
            {listaDevedores.map((c) => {
              const dias = diasAtras(c.ultima_compra);
              const atrasado = dias !== null && dias >= 30;
              return (
                <Link
                  key={c.id}
                  href={`/clientes/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2 active:bg-surface-2 md:px-5"
                >
                  <Avatar nome={c.nome} devendo />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{c.nome}</p>
                    <p className={`text-xs ${atrasado ? "font-bold text-debt" : "text-muted"}`}>
                      {dias === null
                        ? "sem compras"
                        : dias === 0
                          ? "comprou hoje"
                          : `comprou há ${dias} ${dias === 1 ? "dia" : "dias"}`}
                    </p>
                  </div>
                  <p className="hidden w-36 shrink-0 text-sm text-muted md:block">
                    {c.telefone || "sem telefone"}
                  </p>
                  <p className="tnum shrink-0 font-mono font-semibold text-debt">
                    {formatarReais(c.saldo_centavos)}
                  </p>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
