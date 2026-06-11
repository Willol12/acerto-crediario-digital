import { NextResponse } from "next/server";
import { COOKIE_SESSAO } from "@/lib/auth";

// Logout da loja por GET (usado quando a sessão aponta pra uma loja que não existe mais).
export async function GET(request: Request) {
  const res = NextResponse.redirect(new URL("/login", request.url));
  res.cookies.delete(COOKIE_SESSAO);
  return res;
}
