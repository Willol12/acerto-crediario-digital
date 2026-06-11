// Provisiona uma loja nova (o que você roda ao fechar um cliente).
//
// Local (dev), banco em arquivo:
//   npm run nova-loja -- --slug padaria-uniao --nome "Padaria União" --senha senhaforte
//
// Produção (Turso): crie o banco da loja no painel do Turso, pegue URL + token e passe:
//   npm run nova-loja -- --slug padaria-uniao --nome "Padaria União" --senha senhaforte \
//     --db-url libsql://... --db-token eyJ...
//
// Flags: --demo (carrega dados de exemplo)  --reset (zera antes)
import { provisionar } from "./provisionar.mjs";

function arg(nome) {
  const i = process.argv.indexOf(`--${nome}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}
const tem = (nome) => process.argv.includes(`--${nome}`);

try {
  const { slug, url } = await provisionar({
    slug: arg("slug"),
    nome: arg("nome"),
    senha: arg("senha"),
    dbUrl: arg("db-url"),
    dbToken: arg("db-token"),
    demo: tem("demo"),
    reset: tem("reset"),
  });
  console.log(`Loja "${slug}" provisionada. Banco: ${url}`);
  console.log(`Login:  usuário "${slug}"  /  a senha que você definiu.`);
} catch (e) {
  console.error("Erro:", e.message);
  process.exit(1);
}
