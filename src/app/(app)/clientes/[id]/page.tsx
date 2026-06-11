import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Trash2 } from "lucide-react";
import { atualizarCliente, excluirCliente, excluirLancamento } from "@/app/actions";
import { Avatar } from "@/components/avatar";
import { ConfirmSubmit } from "@/components/confirm-submit";
import {
  TEMPLATE_PADRAO,
  extratoDoCliente,
  getConfig,
  obterClienteComSaldo,
} from "@/lib/db";
import {
  formatarDataCurta,
  formatarReais,
  linkWhatsApp,
  montarMensagemCobranca,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PaginaCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await obterClienteComSaldo(Number(id));
  if (!cliente) notFound();

  const devendo = cliente.saldo_centavos > 0;
  const extrato = await extratoDoCliente(cliente.id);
  const loja = await getConfig("nome_loja", "Minha loja");
  const template = await getConfig("template_cobranca", TEMPLATE_PADRAO);
  const mensagem = montarMensagemCobranca(template, {
    nome: cliente.nome.split(" ")[0],
    valor: formatarReais(cliente.saldo_centavos),
    loja,
  });
  const wa = devendo ? linkWhatsApp(cliente.telefone, mensagem) : null;
  const valorPrefill = (cliente.saldo_centavos / 100).toFixed(2).replace(".", ",");

  return (
    <main className="flex flex-col gap-6">
      <header className="reveal flex items-center gap-3">
        <Link
          href="/clientes"
          className="rounded-full border border-border bg-surface p-2 transition-colors hover:bg-surface-2"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Avatar nome={cliente.nome} devendo={devendo} className="h-11 w-11" />
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-black tracking-tight md:text-3xl">
            {cliente.nome}
          </h1>
          <p className="text-sm text-muted">{cliente.telefone || "sem telefone cadastrado"}</p>
        </div>
      </header>

      <div className="flex flex-col gap-5 md:grid md:grid-cols-[340px_1fr] md:items-start md:gap-6">
        <div className="flex flex-col gap-4">
          <section
            className={`${devendo ? "banknote-debt" : "banknote"} reveal relative overflow-hidden rounded-3xl p-5 text-primary-fg`}
            style={{ "--d": "60ms" } as React.CSSProperties}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] opacity-70">
              {devendo ? "Está devendo" : "Saldo"}
            </p>
            <p className="tnum mt-2 font-mono text-4xl font-semibold">
              {formatarReais(cliente.saldo_centavos)}
            </p>
            {!devendo && (
              <span className="stamp mt-3 inline-block -rotate-3 text-primary-fg">Em dia</span>
            )}
          </section>

          <section className="reveal flex gap-2" style={{ "--d": "120ms" } as React.CSSProperties}>
            <Link
              href={`/lancar?cliente=${cliente.id}&tipo=compra`}
              className="flex-1 rounded-2xl border-2 border-debt px-3 py-3 text-center font-bold text-debt transition-colors hover:bg-debt/10 active:bg-debt/10"
            >
              + Venda
            </Link>
            <Link
              href={`/lancar?cliente=${cliente.id}&tipo=pagamento${
                devendo ? `&valor=${encodeURIComponent(valorPrefill)}` : ""
              }`}
              className="flex-1 rounded-2xl border-2 border-primary px-3 py-3 text-center font-bold text-primary transition-colors hover:bg-primary/10 active:bg-primary/10"
            >
              Receber
            </Link>
          </section>

          {devendo &&
            (wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="reveal flex items-center justify-center gap-2 rounded-2xl bg-whats px-4 py-4 text-lg font-extrabold text-white shadow-lg shadow-whats/25 transition-transform active:scale-[0.99]"
                style={{ "--d": "180ms" } as React.CSSProperties}
              >
                <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
                Cobrar no WhatsApp
              </a>
            ) : (
              <p className="rounded-2xl bg-surface-2 px-4 py-3 text-center text-sm text-muted">
                Cadastre o WhatsApp dele em <span className="font-bold">Editar cliente</span> para
                cobrar com um toque.
              </p>
            ))}

          <details className="rounded-3xl border border-border bg-surface px-4 py-3">
            <summary className="cursor-pointer font-bold">Editar cliente</summary>
            <form action={atualizarCliente} className="mt-3 flex flex-col gap-3">
              <input type="hidden" name="id" value={cliente.id} />
              <div className="flex flex-col gap-1">
                <label htmlFor="nome" className="text-sm font-bold">
                  Nome
                </label>
                <input
                  id="nome"
                  name="nome"
                  required
                  defaultValue={cliente.nome}
                  className="rounded-2xl border border-border bg-bg px-4 py-3"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="telefone" className="text-sm font-bold">
                  WhatsApp (com DDD)
                </label>
                <input
                  id="telefone"
                  name="telefone"
                  inputMode="tel"
                  defaultValue={cliente.telefone ?? ""}
                  placeholder="ex.: (11) 98765-4321"
                  className="rounded-2xl border border-border bg-bg px-4 py-3"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl bg-primary px-4 py-3 font-bold text-primary-fg transition-colors hover:bg-primary-dark"
              >
                Salvar alterações
              </button>
            </form>
            <form action={excluirCliente} className="mt-2">
              <input type="hidden" name="id" value={cliente.id} />
              <ConfirmSubmit
                mensagem={`Excluir ${cliente.nome} e TODO o histórico? Não dá pra desfazer.`}
                className="w-full rounded-2xl px-4 py-3 font-bold text-debt transition-colors hover:bg-debt/10 active:bg-debt/10"
              >
                Excluir cliente
              </ConfirmSubmit>
            </form>
          </details>
        </div>

        <section
          className="reveal flex flex-col gap-3"
          style={{ "--d": "160ms" } as React.CSSProperties}
        >
          <div className="ledger-head flex items-baseline justify-between px-1">
            <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.14em]">
              Extrato
            </h2>
            <span className="text-xs text-muted">
              {extrato.length} {extrato.length === 1 ? "lançamento" : "lançamentos"}
            </span>
          </div>
          {extrato.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted">
              Nenhum lançamento ainda.
            </p>
          ) : (
            <div className="pautado overflow-hidden rounded-3xl border border-border bg-surface">
              {extrato.map((l) => (
                <div key={l.id} className="flex items-center gap-3 px-4 py-3 md:px-5">
                  <p className="tnum w-12 shrink-0 font-mono text-sm font-semibold text-muted">
                    {formatarDataCurta(l.criado_em)}
                  </p>
                  <p className="min-w-0 flex-1 truncate text-sm">
                    {l.descricao || (l.tipo === "compra" ? "Venda na conta" : "Pagamento")}
                  </p>
                  <p
                    className={`tnum shrink-0 font-mono font-semibold ${
                      l.tipo === "compra" ? "text-debt" : "text-primary"
                    }`}
                  >
                    {l.tipo === "compra" ? "+" : "−"} {formatarReais(l.valor_centavos)}
                  </p>
                  <form action={excluirLancamento} className="shrink-0">
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="cliente" value={cliente.id} />
                    <ConfirmSubmit
                      mensagem="Apagar este lançamento?"
                      className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-debt active:bg-surface-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </ConfirmSubmit>
                  </form>
                </div>
              ))}
            </div>
          )}
          <p className="px-1 text-xs text-muted">
            O extrato é a sua prova: se o cliente contestar, mostre item por item.
          </p>
        </section>
      </div>
    </main>
  );
}
