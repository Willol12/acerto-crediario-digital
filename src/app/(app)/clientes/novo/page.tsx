import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { criarCliente } from "@/app/actions";

export const dynamic = "force-dynamic";

type Busca = Promise<{ voltar?: string; erro?: string }>;

export default async function NovoCliente({ searchParams }: { searchParams: Busca }) {
  const { voltar, erro } = await searchParams;

  return (
    <main className="flex flex-col gap-6 md:mx-auto md:w-full md:max-w-xl">
      <header className="reveal flex items-center gap-3">
        <Link
          href={voltar === "lancar" ? "/lancar" : "/clientes"}
          className="rounded-full border border-border bg-surface p-2 transition-colors hover:bg-surface-2"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass">Cadastro</p>
          <h1 className="font-display text-3xl font-black tracking-tight">Novo cliente</h1>
        </div>
      </header>

      {erro && (
        <p className="rounded-2xl bg-debt/10 px-4 py-3 text-sm font-bold text-debt">{erro}</p>
      )}

      <form
        action={criarCliente}
        className="reveal flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5 md:p-6"
        style={{ "--d": "80ms" } as React.CSSProperties}
      >
        <input type="hidden" name="voltar" value={voltar ?? ""} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="nome" className="px-1 text-sm font-bold">
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            required
            autoFocus
            autoComplete="off"
            placeholder="ex.: Maria Aparecida"
            className="w-full rounded-2xl border border-border bg-bg px-4 py-3.5 text-base font-bold"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="telefone" className="px-1 text-sm font-bold">
            WhatsApp <span className="font-normal text-muted">(com DDD)</span>
          </label>
          <input
            id="telefone"
            name="telefone"
            inputMode="tel"
            autoComplete="off"
            placeholder="ex.: (11) 98765-4321"
            className="w-full rounded-2xl border border-border bg-bg px-4 py-3.5 text-base"
          />
          <p className="px-1 text-xs text-muted">
            Com o número salvo, a cobrança do fim do mês sai pronta no WhatsApp.
          </p>
        </div>

        <button
          type="submit"
          className="mt-1 rounded-2xl bg-primary px-4 py-4 text-lg font-extrabold text-primary-fg shadow-lg shadow-primary/25 transition-colors hover:bg-primary-dark active:scale-[0.99]"
        >
          Salvar cliente
        </button>
      </form>
    </main>
  );
}
