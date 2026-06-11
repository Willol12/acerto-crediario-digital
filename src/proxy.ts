import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ADMIN, COOKIE_SESSAO, adminLogado, lerSessao } from "@/lib/auth";

// Next.js 16: o antigo "middleware" se chama "proxy".
//  - /admin/*  exige a sessão do DONO (painel admin)
//  - /login    é a entrada da LOJA
//  - resto     exige a sessão da LOJA
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const ehDono = await adminLogado(request.cookies.get(COOKIE_ADMIN)?.value);
    if (pathname === "/admin/login") {
      return ehDono ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
    }
    return ehDono ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const sessao = await lerSessao(request.cookies.get(COOKIE_SESSAO)?.value);
  if (pathname === "/login") {
    return sessao ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }
  return sessao ? NextResponse.next() : NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    // Roda em tudo, menos assets estáticos e imagens
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
