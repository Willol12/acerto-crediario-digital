// Cria/recria a loja de demonstração pra desenvolvimento rápido.
// Uso: npm run seed   ->  usuário "mercearia-do-ze", senha "demo1234"
import { provisionar } from "./provisionar.mjs";

const { slug } = await provisionar({
  slug: "mercearia-do-ze",
  nome: "Mercearia do Zé",
  senha: "demo1234",
  demo: true,
  reset: true,
});

console.log(`Demo pronta. Login:  usuário "${slug}"  /  senha "demo1234"`);
console.log('Pra trocar a senha:  npm run senha -- --slug mercearia-do-ze --senha <nova>');
