# Acerto — crediário digital

Sistema de crediário (fiado) para comércios locais: o lojista lança a venda na conta em segundos
pelo celular e cobra no fim do mês com mensagem pronta no WhatsApp.

- **Stack:** Next.js 16 (App Router) · Tailwind 4 · Turso/libSQL · sessão JWT (jose) · bcrypt
- **Multi-loja:** cada loja tem o **próprio banco** (isolamento físico); um banco de controle
  guarda o registro das lojas. Painel do dono em `/admin` cria e gerencia as lojas.

## Rodar local

```bash
npm install
npm run seed        # cria a loja demo  (usuário: mercearia-do-ze / senha: demo1234)
npm run admin-senha -- sua-senha-de-dono
npm run dev
```

Sem variáveis de ambiente, roda 100% local (bancos em `data/*.db`).

## Deploy

Veja **DEPLOY.md** (Vercel + Turso, passo a passo). Variáveis em `.env.example`.

## Comandos

| Comando | O quê |
|---|---|
| `npm run seed` | Recria a loja de demonstração |
| `npm run nova-loja -- --slug X --nome "Y" --senha Z` | Provisiona uma loja (CLI) |
| `npm run senha -- --slug X --senha Z` | Troca a senha de uma loja |
| `npm run admin-senha -- Z` | Define a senha do painel do dono |
