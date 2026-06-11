# Deploy do Acerto — passo a passo (fase free: Vercel + Turso)

Arquitetura: **um app pra todas as lojas, banco SEPARADO por loja**. Um banco de "controle"
guarda a lista de lojas (usuário, senha, e onde fica o banco de cada uma). No login, o usuário
identifica a loja → o app conecta no banco DAQUELA loja. Uma loja nunca toca no banco da outra.

## Passo 1 — Banco de CONTROLE no Turso (~3 min)

1. No painel [turso.tech](https://app.turso.tech): **Create Database** → nome `acerto-controle`
   → localização **AWS US East (Virginia)**.
   IMPORTANTE: TODOS os bancos (controle + lojas) na MESMA região, e o app na Vercel em `iad1`
   (já configurado no `vercel.json`). App e banco juntos = consultas rápidas. Não use São Paulo
   no app com banco nos EUA — separados, cada consulta vira uma viagem lenta.
2. Abra o banco → **Connect** → copie a **URL** (`libsql://...`) e um **Token** (Read & Write).

## Passo 2 — Configurar a sua máquina (~2 min)

1. Copie `.env.example` → `.env.local` e preencha:
   - `CONTROL_DATABASE_URL` = a URL do `acerto-controle`
   - `CONTROL_AUTH_TOKEN` = o token
   - `SESSION_SECRET` = gere com:
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Passo 3 — Senha do dono + provisionamento automático (~3 min)

1. Defina a senha do **painel do dono**: `npm run admin-senha -- SUA-SENHA-DE-DONO`
2. (Recomendado) Pra criar o banco de cada loja sozinho pelo painel, pegue no Turso:
   **Settings → API Tokens** → crie um token → ele é o `TURSO_PLATFORM_TOKEN`. O `TURSO_ORG` é o
   nome da sua conta/org no Turso. Coloque os dois no `.env.local` e depois na Vercel.
   - Sem isso, dá pra criar loja colando URL+token de um banco que você cria à mão no painel, ou
     pelo CLI: `npm run nova-loja -- --slug mercearia-ze --nome "Mercearia do Zé" --senha FORTE
     --db-url libsql://... --db-token eyJ...`

## Passo 3b — Criar as lojas (pelo painel, depois do deploy)

Acesse `/admin/login` com a senha de dono → **Nova loja**: nome, usuário e senha. Com o
`TURSO_PLATFORM_TOKEN` configurado, o banco da loja é criado e registrado sozinho. É isso que você
faz ao fechar cada comerciante. (Pra demonstrar, a loja "Mercearia do Zé" já existe via
`npm run seed`: usuário `mercearia-do-ze`, senha `demo1234`.)

## Passo 4 — Deploy na Vercel (~5 min)

1. Na pasta `acerto`: `npx vercel` → login → aceite os padrões (projeto "acerto").
2. Variáveis (painel Vercel → Settings → Environment Variables, ou `npx vercel env add`):
   - `CONTROL_DATABASE_URL`, `CONTROL_AUTH_TOKEN`, `SESSION_SECRET`, `TZ=America/Sao_Paulo`
   - (provisionamento automático) `TURSO_PLATFORM_TOKEN`, `TURSO_ORG`, `TURSO_GROUP=default`
3. `npx vercel --prod` → abra a URL **no celular (4G)**: deve cair no login.
   O painel do dono fica em `/admin/login`.

## Teste de aceite (faça uma vez, no celular)

- [ ] URL abre no login (teste /clientes direto na barra — tem que voltar pro login)
- [ ] Usuário/senha errados recusam; certos entram
- [ ] Lançar venda → aparece no extrato → painel soma
- [ ] Botão Cobrar abre o WhatsApp com a mensagem pronta
- [ ] Ajustes → Sair → volta pro login
- [ ] **Isolamento**: pelo /admin crie uma 2ª loja, entre nela — tem que estar VAZIA (não vê a 1ª)
- [ ] **Admin**: /admin sem senha de dono cai no /admin/login; com senha, lista e cria lojas

## Segurança — estado atual

Feito e VERIFICADO: login usuário+senha por loja (bcrypt); **banco fisicamente separado por loja**
(vazamento entre lojas impossível); sessão JWT assinada em cookie HttpOnly/Secure/SameSite (JS do
navegador não acessa — testado); todas as rotas bloqueadas pelo proxy; sem cadastro público; dados
mínimos (nome + telefone); HTTPS automático da Vercel; freio de 800 ms em login errado.

Antes de DADO REAL do comerciante (piloto), fazer ainda:
1. Backup: ativar o backup/PITR de cada banco no Turso e testar 1 restauração;
2. Rate limit de login mais forte por IP (ex.: Upstash free) — o freio atual basta pra demo;
3. Rodar o checklist de pentest (adaptar o que existe do trading-journal).

## Quando o 1º cliente pagar (fase 2 — resumo)

VPS em **São Paulo** (Vultr/Lightsail/Magalu, ~R$ 30/mês, mensal), backup diário automático pra
storage externo gratuito (R2/B2), domínio próprio (~R$ 40/ano), monitor de uptime gratuito.
**Não pague nada antes do 1º cliente.** Detalhes quando chegar lá.
