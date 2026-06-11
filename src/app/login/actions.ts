"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { lojaPorSlug } from "@/lib/db";
import { COOKIE_SESSAO, SESSAO_DIAS, criarTokenSessao } from "@/lib/auth";

export async function entrar(formData: FormData) {
  const usuario = String(formData.get("usuario") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  const loja = usuario ? await lojaPorSlug(usuario) : undefined;
  const ok = !!loja && senha.length > 0 && (await bcrypt.compare(senha, loja.senha_hash));

  if (!ok) {
    // Freia força bruta e não revela se foi o usuário ou a senha que errou
    await new Promise((r) => setTimeout(r, 800));
    redirect("/login?erro=1");
  }

  const jar = await cookies();
  jar.set(COOKIE_SESSAO, await criarTokenSessao(loja!.slug), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSAO_DIAS,
  });
  redirect("/");
}

export async function sair() {
  const jar = await cookies();
  jar.delete(COOKIE_SESSAO);
  redirect("/login");
}
