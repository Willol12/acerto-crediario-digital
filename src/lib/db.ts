import { createClient, type Client } from "@libsql/client";
import { cookies } from "next/headers";
import { SCHEMA_CONTROL, SCHEMA_LOJA } from "./schema.mjs";
import { COOKIE_SESSAO, lerSessao } from "./auth";

// Arquitetura multi-loja com banco SEPARADO por loja:
//  - 1 banco de CONTROLE guarda a lista de lojas e onde fica o banco de cada uma.
//  - cada loja tem o PRÓPRIO banco (clientes/lançamentos) — isolamento físico total.
// A loja logada vem da sessão (cookie); resolvemos o banco dela por requisição.
const g = globalThis as unknown as {
  _ctrl?: Client;
  _ctrlSchema?: Promise<void>;
  _lojas?: Map<string, Client>;
  _lojasSchema?: Set<string>;
};

export function controlClient(): Client {
  if (!g._ctrl) {
    g._ctrl = createClient({
      url: process.env.CONTROL_DATABASE_URL ?? "file:data/control.db",
      authToken: process.env.CONTROL_AUTH_TOKEN,
    });
  }
  return g._ctrl;
}

// Garante o schema do banco de controle (lojas + meta) uma vez por processo
export function prontoControl(): Promise<void> {
  if (!g._ctrlSchema) {
    g._ctrlSchema = (async () => {
      await controlClient().batch(SCHEMA_CONTROL, "write");
    })();
  }
  return g._ctrlSchema;
}

// Chave/valor do dono no banco de controle (ex.: admin_senha_hash)
export async function getMeta(chave: string): Promise<string | undefined> {
  await prontoControl();
  const r = await controlClient().execute({
    sql: "SELECT valor FROM meta WHERE chave = :chave",
    args: { chave },
  });
  return r.rows[0]?.valor as string | undefined;
}

export async function setMeta(chave: string, valor: string): Promise<void> {
  await prontoControl();
  await controlClient().execute({
    sql: `INSERT INTO meta (chave, valor) VALUES (:chave, :valor)
          ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`,
    args: { chave, valor },
  });
}

export type LojaInfo = {
  slug: string;
  nome: string;
  senha_hash: string;
  db_url: string;
  db_token: string | null;
};

export async function lojaPorSlug(slug: string): Promise<LojaInfo | undefined> {
  await prontoControl();
  const r = await controlClient().execute({
    sql: "SELECT * FROM lojas WHERE slug = :slug",
    args: { slug },
  });
  return r.rows[0] as unknown as LojaInfo | undefined;
}

// Cliente libSQL do banco de UMA loja (cacheado por processo; schema garantido 1x)
async function clienteDaLoja(slug: string): Promise<Client> {
  if (!g._lojas) g._lojas = new Map();
  if (!g._lojasSchema) g._lojasSchema = new Set();

  let c = g._lojas.get(slug);
  if (!c) {
    const loja = await lojaPorSlug(slug);
    if (!loja) throw new Error(`Loja não encontrada: ${slug}`);
    c = createClient({ url: loja.db_url, authToken: loja.db_token ?? undefined });
    g._lojas.set(slug, c);
  }
  if (!g._lojasSchema.has(slug)) {
    await c.batch(SCHEMA_LOJA, "write");
    g._lojasSchema.add(slug);
  }
  return c;
}

// Slug da loja logada, lido da sessão. Lança se não houver sessão (rotas são protegidas).
export async function lojaAtual(): Promise<string> {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao) throw new Error("Sem sessão ativa.");
  return sessao.slug;
}

// Toda query do app passa por aqui — SEMPRE no banco da loja logada, nunca de outra.
export async function sql(query: string, args: Record<string, unknown> = {}) {
  const c = await clienteDaLoja(await lojaAtual());
  return c.execute({ sql: query, args: args as never });
}

// Várias instruções atômicas no banco da loja logada (ex.: excluir cliente + histórico)
export async function sqlBatch(statements: { sql: string; args?: Record<string, unknown> }[]) {
  const c = await clienteDaLoja(await lojaAtual());
  return c.batch(
    statements.map((s) => ({ sql: s.sql, args: (s.args ?? {}) as never })),
    "write"
  );
}

export type Cliente = {
  id: number;
  nome: string;
  telefone: string | null;
  criado_em: string;
};

export type Lancamento = {
  id: number;
  cliente_id: number;
  tipo: "compra" | "pagamento";
  valor_centavos: number;
  descricao: string | null;
  criado_em: string;
};

export type ClienteComSaldo = Cliente & {
  saldo_centavos: number;
  ultima_compra: string | null;
};

const SELECT_COM_SALDO = `
  SELECT
    c.*,
    COALESCE(SUM(CASE WHEN l.tipo = 'compra' THEN l.valor_centavos ELSE -l.valor_centavos END), 0) AS saldo_centavos,
    MAX(CASE WHEN l.tipo = 'compra' THEN l.criado_em END) AS ultima_compra
  FROM clientes c
  LEFT JOIN lancamentos l ON l.cliente_id = c.id
`;

export async function listarClientesComSaldo(busca?: string): Promise<ClienteComSaldo[]> {
  const where = busca ? `WHERE c.nome LIKE :busca COLLATE NOCASE` : "";
  const r = await sql(
    `${SELECT_COM_SALDO} ${where} GROUP BY c.id ORDER BY saldo_centavos DESC, c.nome COLLATE NOCASE`,
    busca ? { busca: `%${busca}%` } : {}
  );
  return r.rows as unknown as ClienteComSaldo[];
}

export async function listarDevedores(): Promise<ClienteComSaldo[]> {
  return (await listarClientesComSaldo()).filter((c) => c.saldo_centavos > 0);
}

export async function obterClienteComSaldo(id: number): Promise<ClienteComSaldo | undefined> {
  const r = await sql(`${SELECT_COM_SALDO} WHERE c.id = :id GROUP BY c.id`, { id });
  return r.rows[0] as unknown as ClienteComSaldo | undefined;
}

export async function extratoDoCliente(clienteId: number): Promise<Lancamento[]> {
  const r = await sql(
    `SELECT * FROM lancamentos WHERE cliente_id = :id ORDER BY criado_em DESC, id DESC`,
    { id: clienteId }
  );
  return r.rows as unknown as Lancamento[];
}

export async function totalAReceber(): Promise<{ total_centavos: number; devedores: number }> {
  const linhas = await listarDevedores();
  return {
    total_centavos: linhas.reduce((soma, c) => soma + c.saldo_centavos, 0),
    devedores: linhas.length,
  };
}

/** Soma dos pagamentos do mês informado ("AAAA-MM", calculado no fuso de São Paulo). */
export async function recebidoNoMes(mesAtual: string): Promise<number> {
  const r = await sql(
    `SELECT COALESCE(SUM(valor_centavos), 0) AS total
     FROM lancamentos
     WHERE tipo = 'pagamento' AND substr(criado_em, 1, 7) = :mes`,
    { mes: mesAtual }
  );
  return Number(r.rows[0].total);
}

export const TEMPLATE_PADRAO =
  "Olá, {nome}! Aqui é da {loja}, tudo bem? 🙂 Passando pra lembrar da sua conta com a gente: o total está em {valor}. Quando puder passar pra acertar, a gente agradece! Qualquer dúvida sobre o extrato é só pedir.";

export async function getConfig(chave: string, padrao: string): Promise<string> {
  const r = await sql(`SELECT valor FROM config WHERE chave = :chave`, { chave });
  return (r.rows[0]?.valor as string | undefined) ?? padrao;
}

export async function setConfig(chave: string, valor: string): Promise<void> {
  await sql(
    `INSERT INTO config (chave, valor) VALUES (:chave, :valor)
     ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`,
    { chave, valor }
  );
}
