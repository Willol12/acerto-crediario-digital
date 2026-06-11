"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setConfig, sql, sqlBatch } from "@/lib/db";
import { agoraSaoPaulo, parseValorParaCentavos } from "@/lib/format";

// App pequeno e todo dinâmico: revalida a árvore inteira de uma vez
function revalidarTudo() {
  revalidatePath("/", "layout");
}

export async function criarCliente(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim() || null;
  const voltar = String(formData.get("voltar") ?? "");

  if (!nome) {
    redirect(
      `/clientes/novo?erro=${encodeURIComponent("Informe o nome do cliente.")}` +
        (voltar ? `&voltar=${voltar}` : "")
    );
  }

  const r = await sql(
    `INSERT INTO clientes (nome, telefone, criado_em) VALUES (:nome, :telefone, :agora)`,
    { nome, telefone, agora: agoraSaoPaulo() }
  );
  revalidarTudo();

  const id = Number(r.lastInsertRowid);
  redirect(voltar === "lancar" ? `/lancar?cliente=${id}` : `/clientes/${id}`);
}

export async function atualizarCliente(formData: FormData) {
  const id = Number(formData.get("id"));
  const nome = String(formData.get("nome") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim() || null;
  if (!id || !nome) redirect(`/clientes/${id}?erro=${encodeURIComponent("Informe o nome.")}`);

  await sql(`UPDATE clientes SET nome = :nome, telefone = :telefone WHERE id = :id`, {
    nome,
    telefone,
    id,
  });
  revalidarTudo();
  redirect(`/clientes/${id}`);
}

export async function excluirCliente(formData: FormData) {
  const id = Number(formData.get("id"));
  if (id) {
    // Apaga o histórico junto, sem depender do ON DELETE CASCADE (FK pode não
    // estar ativa no Turso remoto). Batch = atômico.
    await sqlBatch([
      { sql: `DELETE FROM lancamentos WHERE cliente_id = :id`, args: { id } },
      { sql: `DELETE FROM clientes WHERE id = :id`, args: { id } },
    ]);
    revalidarTudo();
  }
  redirect("/clientes");
}

export async function lancar(formData: FormData) {
  const clienteId = Number(formData.get("cliente"));
  const tipo = String(formData.get("tipo") ?? "compra");
  const valorTexto = String(formData.get("valor") ?? "");
  const descricao = String(formData.get("descricao") ?? "").trim() || null;

  const voltarComErro = (erro: string) =>
    redirect(
      `/lancar?erro=${encodeURIComponent(erro)}` +
        (clienteId ? `&cliente=${clienteId}` : "") +
        `&tipo=${tipo === "pagamento" ? "pagamento" : "compra"}`
    );

  if (!clienteId) voltarComErro("Escolha o cliente.");
  if (tipo !== "compra" && tipo !== "pagamento") voltarComErro("Tipo inválido.");

  const centavos = parseValorParaCentavos(valorTexto);
  if (centavos === null) voltarComErro("Valor inválido. Use o formato 12,50.");

  await sql(
    `INSERT INTO lancamentos (cliente_id, tipo, valor_centavos, descricao, criado_em)
     VALUES (:cliente, :tipo, :valor, :descricao, :agora)`,
    { cliente: clienteId, tipo, valor: centavos, descricao, agora: agoraSaoPaulo() }
  );
  revalidarTudo();
  redirect(`/clientes/${clienteId}`);
}

export async function excluirLancamento(formData: FormData) {
  const id = Number(formData.get("id"));
  const clienteId = Number(formData.get("cliente"));
  if (id) {
    await sql(`DELETE FROM lancamentos WHERE id = :id`, { id });
    revalidarTudo();
  }
  redirect(clienteId ? `/clientes/${clienteId}` : "/");
}

export async function salvarConfig(formData: FormData) {
  const nomeLoja = String(formData.get("nome_loja") ?? "").trim();
  const template = String(formData.get("template_cobranca") ?? "").trim();
  if (nomeLoja) await setConfig("nome_loja", nomeLoja);
  if (template) await setConfig("template_cobranca", template);
  revalidarTudo();
  redirect("/config?salvo=1");
}
