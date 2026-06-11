// Dois schemas: o banco de CONTROLE (registro das lojas) e o banco de cada LOJA.
// Cada loja tem seu próprio banco — isolamento físico, uma nunca enxerga a outra.

// Banco de controle: a lista de lojas, onde fica o banco de cada uma, e a senha do dono.
export const SCHEMA_CONTROL = [
  `CREATE TABLE IF NOT EXISTS lojas (
    slug TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    senha_hash TEXT NOT NULL,
    db_url TEXT NOT NULL,
    db_token TEXT,
    criado_em TEXT NOT NULL
  )`,
  // chave/valor do dono (ex.: admin_senha_hash) — credencial do painel admin
  `CREATE TABLE IF NOT EXISTS meta (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  )`,
];

// Banco de cada loja: clientes, lançamentos e config da própria loja.
export const SCHEMA_LOJA = [
  `CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT,
    criado_em TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS lancamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('compra', 'pagamento')),
    valor_centavos INTEGER NOT NULL CHECK (valor_centavos > 0),
    descricao TEXT,
    criado_em TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_lancamentos_cliente ON lancamentos(cliente_id)`,
  `CREATE TABLE IF NOT EXISTS config (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  )`,
];
