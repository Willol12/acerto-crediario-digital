import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { TEMPLATE_PADRAO, getConfig, listarDevedores, totalAReceber } from "@/lib/db";
import { formatarReais, linkWhatsApp, montarMensagemCobranca } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Fechamento() {
  const loja = await getConfig("nome_loja", "Minha loja");
  const template = await getConfig("template_cobranca", TEMPLATE_PADRAO);
  const devedores = await listarDevedores();
  const { total_centavos } = await totalAReceber();

  return (
    <main className="flex flex-col gap-6 md:max-w-3xl">
      <header className="reveal">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass">
          Fim do mês
        </p>
        <h1 className="font-display text-3xl font-black tracking-tight">Cobrança</h1>
        <p className="mt-1 text-sm text-muted">
          Toque em <span className="font-bold text-whats">Cobrar</span>: a mensagem abre pronta no
          seu WhatsApp — você só confere e envia. Sem constrangimento, sem esquecer ninguém.
        </p>
      </header>

      <section
        className="reveal flex items-baseline justify-between rounded-3xl border border-border bg-surface px-5 py-4"
        style={{ "--d": "60ms" } as React.CSSProperties}
      >
        <p className="text-sm font-bold text-muted">A receber</p>
        <p className="tnum font-mono text-2xl font-semibold text-debt">
          {formatarReais(total_centavos)}
        </p>
      </section>

      {devedores.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-7 text-center">
          <span className="stamp text-primary">Tudo em dia</span>
          <p className="mt-3 text-sm text-muted">Todas as contas estão quitadas.</p>
        </div>
      ) : (
        <div
          className="pautado reveal overflow-hidden rounded-3xl border border-border bg-surface"
          style={{ "--d": "120ms" } as React.CSSProperties}
        >
          {devedores.map((c) => {
            const mensagem = montarMensagemCobranca(template, {
              nome: c.nome.split(" ")[0],
              valor: formatarReais(c.saldo_centavos),
              loja,
            });
            const wa = linkWhatsApp(c.telefone, mensagem);
            return (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3.5 md:px-5">
                <Avatar nome={c.nome} devendo />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/clientes/${c.id}`}
                    className="truncate font-bold hover:text-primary"
                  >
                    {c.nome}
                  </Link>
                  <p className="tnum font-mono text-sm font-semibold text-debt">
                    {formatarReais(c.saldo_centavos)}
                  </p>
                </div>
                {wa ? (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-whats px-4 py-2.5 text-sm font-extrabold text-white transition-transform active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
                    Cobrar
                  </a>
                ) : (
                  <Link
                    href={`/clientes/${c.id}`}
                    className="shrink-0 rounded-full border border-border px-3 py-2 text-xs font-bold text-muted hover:bg-surface-2"
                  >
                    sem telefone
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="px-1 text-xs text-muted">
        A mensagem usa o modelo definido em{" "}
        <Link href="/config" className="font-bold text-primary">
          Ajustes
        </Link>
        .
      </p>
    </main>
  );
}
