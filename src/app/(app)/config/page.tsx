import { LogOut } from "lucide-react";
import { salvarConfig } from "@/app/actions";
import { sair } from "@/app/login/actions";
import { TEMPLATE_PADRAO, getConfig } from "@/lib/db";
import { formatarReais, montarMensagemCobranca } from "@/lib/format";

export const dynamic = "force-dynamic";

type Busca = Promise<{ salvo?: string }>;

export default async function Config({ searchParams }: { searchParams: Busca }) {
  const { salvo } = await searchParams;
  const loja = await getConfig("nome_loja", "Minha loja");
  const template = await getConfig("template_cobranca", TEMPLATE_PADRAO);
  const exemplo = montarMensagemCobranca(template, {
    nome: "Maria",
    valor: formatarReais(8750),
    loja,
  });

  return (
    <main className="flex flex-col gap-6 md:mx-auto md:w-full md:max-w-xl">
      <header className="reveal">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass">
          Configuração
        </p>
        <h1 className="font-display text-3xl font-black tracking-tight">Ajustes</h1>
      </header>

      {salvo && (
        <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary">
          Ajustes salvos ✔
        </p>
      )}

      <form
        action={salvarConfig}
        className="reveal flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5 md:p-6"
        style={{ "--d": "80ms" } as React.CSSProperties}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nome_loja" className="px-1 text-sm font-bold">
            Nome da loja
          </label>
          <input
            id="nome_loja"
            name="nome_loja"
            required
            defaultValue={loja}
            className="w-full rounded-2xl border border-border bg-bg px-4 py-3.5 text-base font-bold"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="template_cobranca" className="px-1 text-sm font-bold">
            Mensagem de cobrança
          </label>
          <textarea
            id="template_cobranca"
            name="template_cobranca"
            required
            rows={6}
            defaultValue={template}
            className="w-full rounded-2xl border border-border bg-bg px-4 py-3.5 text-base leading-relaxed"
          />
          <p className="px-1 text-xs text-muted">
            Use <span className="font-bold">{"{nome}"}</span>,{" "}
            <span className="font-bold">{"{valor}"}</span> e{" "}
            <span className="font-bold">{"{loja}"}</span> — eles são trocados automaticamente em
            cada cobrança.
          </p>
        </div>

        <button
          type="submit"
          className="rounded-2xl bg-primary px-4 py-4 text-lg font-extrabold text-primary-fg shadow-lg shadow-primary/25 transition-colors hover:bg-primary-dark active:scale-[0.99]"
        >
          Salvar ajustes
        </button>
      </form>

      <section
        className="reveal flex flex-col gap-2"
        style={{ "--d": "140ms" } as React.CSSProperties}
      >
        <div className="ledger-head px-1">
          <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.14em]">
            Como o cliente recebe
          </h2>
        </div>
        <div className="rounded-3xl rounded-bl-md bg-[#dcf8c6] p-4 text-sm leading-relaxed text-[#111b21] shadow">
          {exemplo}
        </div>
      </section>

      <form action={sair} className="mt-2">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 font-bold text-muted transition-colors hover:text-debt"
        >
          <LogOut className="h-4 w-4" />
          Sair do sistema
        </button>
      </form>
    </main>
  );
}
