// Troca a senha de acesso de uma loja já cadastrada.
// Uso: npm run senha -- --slug mercearia-do-ze --senha nova-senha-forte
import bcrypt from "bcryptjs";
import { controlClient } from "./provisionar.mjs";

function arg(nome) {
  const i = process.argv.indexOf(`--${nome}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

const slug = arg("slug");
const senha = arg("senha");
if (!slug || !senha || senha.length < 8) {
  console.error("Uso: npm run senha -- --slug <loja> --senha <senha com 8+ caracteres>");
  process.exit(1);
}

const ctrl = controlClient();
const r = await ctrl.execute({
  sql: "UPDATE lojas SET senha_hash = :hash WHERE slug = :slug",
  args: { hash: bcrypt.hashSync(senha, 12), slug },
});

if (r.rowsAffected === 0) {
  console.error(`Loja "${slug}" não encontrada.`);
  process.exit(1);
}
console.log(`Senha da loja "${slug}" atualizada.`);
