import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import { SCHEMA_LOJA } from "./schema.mjs";
import { controlClient, lojaPorSlug, prontoControl } from "./db";

const TURSO_API = "https://api.turso.tech";

function temPlataformaTurso(): boolean {
  return !!process.env.TURSO_PLATFORM_TOKEN && !!process.env.TURSO_ORG;
}

async function tursoFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${TURSO_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.TURSO_PLATFORM_TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Turso API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// Cria um banco novo no Turso e gera o token de acesso dele.
async function criarBancoTurso(slug: string): Promise<{ url: string; token: string }> {
  const org = process.env.TURSO_ORG!;
  const group = process.env.TURSO_GROUP ?? "default";
  const nome = `acerto-${slug}`;

  const criado = await tursoFetch(`/v1/organizations/${org}/databases`, {
    method: "POST",
    body: JSON.stringify({ name: nome, group }),
  });
  const hostname: string | undefined = criado?.database?.Hostname;
  if (!hostname) throw new Error("Turso não retornou o Hostname do banco.");

  const tok = await tursoFetch(`/v1/organizations/${org}/databases/${nome}/auth/tokens`, {
    method: "POST",
  });
  if (!tok?.jwt) throw new Error("Turso não retornou o token do banco.");

  return { url: `libsql://${hostname}`, token: tok.jwt };
}

export type LojaResumo = { slug: string; nome: string; criado_em: string };

export async function listarLojas(): Promise<LojaResumo[]> {
  await prontoControl();
  const r = await controlClient().execute(
    "SELECT slug, nome, criado_em FROM lojas ORDER BY nome COLLATE NOCASE"
  );
  return r.rows as unknown as LojaResumo[];
}

export function validarSlug(slug: string): string {
  const s = slug.trim().toLowerCase();
  if (!/^[a-z0-9-]{3,40}$/.test(s)) {
    throw new Error("Usuário só pode ter letras minúsculas, números e hífen (3 a 40 caracteres).");
  }
  return s;
}

// Provisiona a loja: cria o banco dela (Turso em produção, arquivo local em dev,
// ou usa db_url/db_token informados manualmente) e registra no banco de controle.
export async function provisionarLoja(opts: {
  slug: string;
  nome: string;
  senha: string;
  dbUrl?: string;
  dbToken?: string | null;
}): Promise<{ slug: string; onde: string }> {
  const slug = validarSlug(opts.slug);
  const nome = opts.nome.trim();
  if (!nome) throw new Error("Informe o nome da loja.");
  if (opts.senha.length < 8) throw new Error("A senha precisa de 8+ caracteres.");

  if (await lojaPorSlug(slug)) {
    throw new Error(`Já existe uma loja com o usuário "${slug}".`);
  }

  let url = opts.dbUrl?.trim();
  let token: string | null = opts.dbToken?.trim() || null;
  let onde: string;

  if (url) {
    onde = "banco informado manualmente";
  } else if (temPlataformaTurso()) {
    const r = await criarBancoTurso(slug);
    url = r.url;
    token = r.token;
    onde = "novo banco no Turso";
  } else {
    // Dev local: um arquivo por loja
    fs.mkdirSync("data", { recursive: true });
    url = `file:data/loja-${slug}.db`;
    token = null;
    onde = "arquivo local";
  }

  // Cria o schema no banco da loja e grava o nome dela
  const loja = createClient({ url, authToken: token ?? undefined });
  await loja.batch(SCHEMA_LOJA, "write");
  await loja.execute({
    sql: `INSERT INTO config (chave, valor) VALUES ('nome_loja', :n)
          ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`,
    args: { n: nome },
  });

  // Registra no banco de controle
  await controlClient().execute({
    sql: `INSERT INTO lojas (slug, nome, senha_hash, db_url, db_token, criado_em)
          VALUES (:slug, :nome, :hash, :url, :token, :agora)`,
    args: {
      slug,
      nome,
      hash: bcrypt.hashSync(opts.senha, 12),
      url,
      token,
      agora: new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" }),
    },
  });

  return { slug, onde };
}

export async function trocarSenhaLoja(slug: string, senha: string): Promise<void> {
  if (senha.length < 8) throw new Error("A senha precisa de 8+ caracteres.");
  await prontoControl();
  const r = await controlClient().execute({
    sql: "UPDATE lojas SET senha_hash = :hash WHERE slug = :slug",
    args: { hash: bcrypt.hashSync(senha, 12), slug },
  });
  if (r.rowsAffected === 0) throw new Error(`Loja "${slug}" não encontrada.`);
}
