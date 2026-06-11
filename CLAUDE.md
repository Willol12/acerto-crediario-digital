# Acerto — crediário digital

**Marca: "Acerto."** (de "passar pra acertar a conta"). Produto pra vender a comércios locais que
ainda controlam o crediário informal (fiado) em papel: o comerciante lança a venda em segundos no
celular e cobra no fim do mês com mensagem pronta no WhatsApp. O negócio: **setup R$100–200 +
mensalidade R$25–40 por comerciante**. O diferencial de venda não é o app, é a implantação
presencial + migração da caixinha de papel + suporte. Ver `kit-venda.md`.

Vocabulário no produto: NUNCA escrever "fiado" na UI (palavra da dor, não da marca) — usar
"venda (na conta)", "conta aberta", "crediário". Na conversa de venda o comerciante fala "fiado"
e tudo bem; a marca responde com "Acerto".

## Stack e comandos
- Next.js 16 (App Router, server actions) + Tailwind 4 + **@libsql/client** (Turso). Sem Prisma.
- **Multi-loja com banco SEPARADO por loja** (database-per-tenant): 1 banco de CONTROLE
  (`SCHEMA_CONTROL`, tabela `lojas`) lista as lojas e onde fica o banco de cada uma; cada loja tem
  o próprio banco (`SCHEMA_LOJA`: clientes/lançamentos/config). Vazamento entre lojas é
  fisicamente impossível. `db.ts`: `sql()`/`sqlBatch()` resolvem a loja logada pela sessão
  (cookie) e conectam no banco DELA — nunca de outra. Schemas em `src/lib/schema.mjs`.
- **Auth**: login usuário(slug)+senha por loja (bcrypt, guardado no banco de controle) + sessão
  JWT (jose) carregando o slug, em cookie HttpOnly/Secure/SameSite. Telas logadas vivem no grupo
  `(app)/`.
- **Painel do dono** em `/admin` (cookie `acerto_admin` separado; senha em `meta.admin_senha_hash`
  no controle, definida por `npm run admin-senha -- <senha>`). Cria/lista lojas e troca senha por
  tela. Provisiona o banco da loja: API do Turso se `TURSO_PLATFORM_TOKEN`+`TURSO_ORG` setados;
  senão arquivo local (dev); ou URL/token colados à mão. Lógica em `src/lib/admin.ts`.
- `src/proxy.ts`: `/admin/*` exige sessão de dono; `/login` é entrada da loja; resto exige loja.
  NÃO há cadastro público (vende presencial); self-service + cobrança Mercado Pago = fase futura.
- Banco: sem env vars, controle = `file:data/control.db` e cada loja = `file:data/loja-<slug>.db`
  (dev local); com `CONTROL_DATABASE_URL`+`CONTROL_AUTH_TOKEN`, o controle vai pro Turso e cada
  loja aponta pro seu próprio banco Turso (registrado via `nova-loja`).
- Scripts (leem `.env.local` via Node --env-file-if-exists):
  `npm run seed` recria a loja demo "mercearia-do-ze"/"demo1234";
  `npm run nova-loja -- --slug X --nome "Y" --senha Z [--db-url --db-token --demo --reset]`
  provisiona uma loja; `npm run senha -- --slug X --senha Z` troca a senha.
- **Datas**: sempre gravadas pelo app no fuso de São Paulo (`agoraSaoPaulo()` em format.ts) —
  nunca usar datetime('now') do SQLite, o servidor roda em UTC.
- **Cascade**: não confiar em ON DELETE CASCADE no Turso remoto (FK pode estar off) — excluir
  cliente apaga os lançamentos explicitamente via `sqlBatch` em `actions.ts`. Deploy: `DEPLOY.md`.

## Decisões de produto (não "melhorar" sem pensar)
- **Valores em centavos (INTEGER)** — nunca float pra dinheiro.
- **Cobrança via link `wa.me`** com mensagem pré-preenchida — NÃO usar API não-oficial de WhatsApp
  (risco de banir o número do comerciante). API oficial só quando houver receita que pague.
- Saldo = soma(compras) − soma(pagamentos), calculado do extrato; não existe coluna de saldo.
  (No schema os tipos continuam `compra`/`pagamento` — renomear tipo no banco não vale o risco.)
- Mobile-first: o comerciante usa atrás do balcão, no celular, com pressa. Botões grandes, poucos
  passos, PT-BR simples (nada de jargão de sistema).
- Template da mensagem com placeholders `{nome}`, `{valor}`, `{loja}` em Ajustes.

## Design system ("livro-caixa moderno")
- Paleta em `globals.css` (@theme): papel `#f3f1e9`, verde-cédula `#0b4f30` (primary), vermelho
  dívida `#a82917` (debt), latão `#96752f` (brass, só em eyebrows/detalhes), WhatsApp `#1d9e4e`.
- Fontes: Archivo (display/títulos), **Atkinson Hyperlegible** (corpo — escolhida por legibilidade
  pra comerciante de mais idade, não trocar por modismo), Spline Sans Mono (valores R$, com .tnum).
- Assinaturas visuais: cartão `.banknote`/`.banknote-debt` (textura de cédula), `.ledger-head`
  (filete duplo de livro contábil), `.pautado` (linhas tracejadas), `.stamp` (carimbo "EM DIA"),
  `.reveal` (entrada em cascata, respeita prefers-reduced-motion).
- Responsivo: BottomNav no celular (<md), Sidebar fixa no desktop (md+, 240px) — itens de navegação
  compartilhados em `components/nav-itens.ts`. Painel vira grid de 3 colunas no desktop; página do
  cliente vira 2 colunas (resumo | extrato).

## Próximos passos (quando o 1º comerciante fechar)
1. Ativar backup/PITR de cada banco no Turso + testar restauração; 2. rate limit de login por IP
(Upstash free); 3. rodar checklist de pentest antes de dado real; 4. fase 2 = VPS São Paulo
mensal quando houver receita (ver DEPLOY.md). Provisionar nova loja = `npm run nova-loja`.
