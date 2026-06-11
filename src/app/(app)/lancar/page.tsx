import Link from "next/link";
import { Plus } from "lucide-react";
import { lancar } from "@/app/actions";
import { listarClientesComSaldo } from "@/lib/db";
import { formatarReais } from "@/lib/format";

export const dynamic = "force-dynamic";

type Busca = Promise<{ cliente?: string; tipo?: string; valor?: string; erro?: string }>;

export default async function Lancar({ searchParams }: { searchParams: Busca }) {
  const { cliente, tipo, valor, erro } = await searchParams;
  const clientes = await listarClientesComSaldo();
  const clienteSelecionado = cliente ? Number(cliente) : undefined;
  const ehPagamento = tipo === "pagamento";

  return (
    <main className="flex flex-col gap-6 md:mx-auto md:w-full md:max-w-xl">
      <header className="reveal">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass">
          Novo lançamento
        </p>
        <h1 className="font-display text-3xl font-black tracking-tight">Lançar</h1>
        <p className="mt-1 text-sm text-muted">Anote em segundos, sem papelzinho.</p>
      </header>

      {erro && (
        <p className="rounded-2xl bg-debt/10 px-4 py-3 text-sm font-bold text-debt">{erro}</p>
      )}

      {clientes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-7 text-center">
          <p className="font-bold">Cadastre o primeiro cliente para começar.</p>
          <Link
            href="/clientes/novo?voltar=lancar"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-bold text-primary-fg"
          >
            <Plus className="h-4 w-4" strokeWidth={3} /> Novo cliente
          </Link>
        </div>
      ) : (
        <form
          action={lancar}
          className="reveal flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5 md:p-6"
          style={{ "--d": "80ms" } as React.CSSProperties}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cliente" className="px-1 text-sm font-bold">
              Cliente
            </label>
            <select
              id="cliente"
              name="cliente"
              required
              defaultValue={clienteSelecionado ?? ""}
              className="w-full appearance-none rounded-2xl border border-border bg-bg px-4 py-3.5 text-base font-bold"
            >
              <option value="" disabled>
                Escolha o cliente…
              </option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                  {c.saldo_centavos > 0 ? ` — deve ${formatarReais(c.saldo_centavos)}` : ""}
                </option>
              ))}
            </select>
            <Link
              href="/clientes/novo?voltar=lancar"
              className="self-start px-1 text-sm font-bold text-primary"
            >
              + Cadastrar novo cliente
            </Link>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="px-1 text-sm font-bold">O que é?</span>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer rounded-2xl border border-border bg-bg px-3 py-3 text-center font-bold text-muted transition-colors has-[:checked]:border-debt has-[:checked]:bg-debt has-[:checked]:text-white">
                <input
                  type="radio"
                  name="tipo"
                  value="compra"
                  defaultChecked={!ehPagamento}
                  className="sr-only"
                />
                Venda (na conta)
              </label>
              <label className="flex-1 cursor-pointer rounded-2xl border border-border bg-bg px-3 py-3 text-center font-bold text-muted transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-fg">
                <input
                  type="radio"
                  name="tipo"
                  value="pagamento"
                  defaultChecked={ehPagamento}
                  className="sr-only"
                />
                Pagamento
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="valor" className="px-1 text-sm font-bold">
              Valor (R$)
            </label>
            <input
              id="valor"
              name="valor"
              inputMode="decimal"
              autoComplete="off"
              required
              placeholder="0,00"
              defaultValue={valor ?? ""}
              className="tnum w-full rounded-2xl border border-border bg-bg px-4 py-3.5 font-mono text-3xl font-semibold placeholder:text-muted/40"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="descricao" className="px-1 text-sm font-bold">
              O que levou? <span className="font-normal text-muted">(opcional)</span>
            </label>
            <input
              id="descricao"
              name="descricao"
              autoComplete="off"
              placeholder="ex.: 2kg de carne, gás, pão…"
              className="w-full rounded-2xl border border-border bg-bg px-4 py-3.5 text-base"
            />
          </div>

          <button
            type="submit"
            className="mt-1 rounded-2xl bg-primary px-4 py-4 text-lg font-extrabold text-primary-fg shadow-lg shadow-primary/25 transition-colors hover:bg-primary-dark active:scale-[0.99]"
          >
            Salvar lançamento
          </button>
        </form>
      )}
    </main>
  );
}
