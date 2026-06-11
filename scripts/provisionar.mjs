// Provisiona uma loja: cria/atualiza o banco dela e registra no banco de controle.
// Funciona local (arquivo por loja) e em produção (banco Turso, passando --db-url/--db-token).
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import { SCHEMA_CONTROL, SCHEMA_LOJA } from "../src/lib/schema.mjs";
import { CLIENTES_DEMO, diasAtrasSP } from "./demo-data.mjs";

function ehArquivo(url) {
  return !url || url.startsWith("file:");
}

export function controlClient() {
  const url = process.env.CONTROL_DATABASE_URL ?? "file:data/control.db";
  if (ehArquivo(url)) fs.mkdirSync("data", { recursive: true });
  return createClient({ url, authToken: process.env.CONTROL_AUTH_TOKEN });
}

async function seedDemo(loja) {
  for (const [nome, telefone, lancamentos] of CLIENTES_DEMO) {
    const r = await loja.execute({
      sql: "INSERT INTO clientes (nome, telefone, criado_em) VALUES (:nome, :telefone, :agora)",
      args: { nome, telefone, agora: diasAtrasSP(40) },
    });
    const clienteId = Number(r.lastInsertRowid);
    for (const [tipo, centavos, descricao, dias] of lancamentos) {
      await loja.execute({
        sql: `INSERT INTO lancamentos (cliente_id, tipo, valor_centavos, descricao, criado_em)
              VALUES (:cliente, :tipo, :valor, :descricao, :agora)`,
        args: { cliente: clienteId, tipo, valor: centavos, descricao, agora: diasAtrasSP(dias) },
      });
    }
  }
}

export async function provisionar({ slug, nome, senha, demo = false, reset = false, dbUrl, dbToken }) {
  if (!slug || !nome || !senha) throw new Error("Informe slug, nome e senha.");
  if (senha.length < 8) throw new Error("A senha precisa de 8+ caracteres.");
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("Slug só pode ter letras minúsculas, números e hífen.");

  // Onde fica o banco desta loja: explícito (Turso, em produção) ou arquivo local (dev)
  const url = dbUrl ?? `file:data/loja-${slug}.db`;
  const token = dbToken ?? null;
  if (ehArquivo(url)) fs.mkdirSync("data", { recursive: true });

  const loja = createClient({ url, authToken: token ?? undefined });
  await loja.batch(SCHEMA_LOJA, "write");
  if (reset) {
    await loja.batch(["DELETE FROM lancamentos", "DELETE FROM clientes", "DELETE FROM config"], "write");
  }
  await loja.execute({
    sql: `INSERT INTO config (chave, valor) VALUES ('nome_loja', :n)
          ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`,
    args: { n: nome },
  });
  if (demo) await seedDemo(loja);

  // Registra (ou atualiza) a loja no banco de controle
  const ctrl = controlClient();
  await ctrl.batch(SCHEMA_CONTROL, "write");
  await ctrl.execute({
    sql: `INSERT INTO lojas (slug, nome, senha_hash, db_url, db_token, criado_em)
          VALUES (:slug, :nome, :hash, :url, :token, :agora)
          ON CONFLICT(slug) DO UPDATE SET
            nome = excluded.nome, senha_hash = excluded.senha_hash,
            db_url = excluded.db_url, db_token = excluded.db_token`,
    args: {
      slug,
      nome,
      hash: bcrypt.hashSync(senha, 12),
      url,
      token,
      agora: diasAtrasSP(0),
    },
  });

  return { slug, url: ehArquivo(url) ? url : "(Turso)" };
}
