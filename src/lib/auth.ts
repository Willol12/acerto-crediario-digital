import { SignJWT, jwtVerify } from "jose";

export const COOKIE_SESSAO = "acerto_sessao";
export const COOKIE_ADMIN = "acerto_admin";
export const SESSAO_DIAS = 30;

export type Sessao = { slug: string };

function segredo(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    // Em produção é obrigatório; em dev cai num segredo fixo só pra rodar local
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET não definido — configure a variável de ambiente.");
    }
    return new TextEncoder().encode("segredo-de-dev-nao-usar-em-producao");
  }
  return new TextEncoder().encode(s);
}

// --- Sessão da LOJA (carrega qual loja está logada) ---
export async function criarTokenSessao(slug: string): Promise<string> {
  return await new SignJWT({ slug })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSAO_DIAS}d`)
    .sign(segredo());
}

export async function lerSessao(token: string | undefined): Promise<Sessao | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, segredo());
    return typeof payload.slug === "string" ? { slug: payload.slug } : null;
  } catch {
    return null;
  }
}

// --- Sessão do DONO (painel admin) ---
export async function criarTokenAdmin(): Promise<string> {
  return await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSAO_DIAS}d`)
    .sign(segredo());
}

export async function adminLogado(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, segredo());
    return payload.admin === true;
  } catch {
    return false;
  }
}
