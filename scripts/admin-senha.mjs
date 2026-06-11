// Define/troca a senha do DONO (acesso ao painel /admin).
// Uso: npm run admin-senha -- sua-senha-forte
import bcrypt from "bcryptjs";
import { controlClient } from "./provisionar.mjs";
import { SCHEMA_CONTROL } from "../src/lib/schema.mjs";

const senha = process.argv[2];
if (!senha || senha.length < 8) {
  console.error("Uso: npm run admin-senha -- <senha com 8+ caracteres>");
  process.exit(1);
}

const ctrl = controlClient();
await ctrl.batch(SCHEMA_CONTROL, "write");
await ctrl.execute({
  sql: `INSERT INTO meta (chave, valor) VALUES ('admin_senha_hash', :h)
        ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`,
  args: { h: bcrypt.hashSync(senha, 12) },
});
console.log("Senha do dono definida. Acesse /admin/login.");
