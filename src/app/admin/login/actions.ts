"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getMeta } from "@/lib/db";
import { COOKIE_ADMIN, SESSAO_DIAS, criarTokenAdmin } from "@/lib/auth";

export async function entrarAdmin(formData: FormData) {
  const senha = String(formData.get("senha") ?? "");
  const hash = await getMeta("admin_senha_hash");
  const ok = !!hash && senha.length > 0 && (await bcrypt.compare(senha, hash));

  if (!ok) {
    await new Promise((r) => setTimeout(r, 800));
    redirect("/admin/login?erro=1");
  }

  const jar = await cookies();
  jar.set(COOKIE_ADMIN, await criarTokenAdmin(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSAO_DIAS,
  });
  redirect("/admin");
}

export async function sairAdmin() {
  const jar = await cookies();
  jar.delete(COOKIE_ADMIN);
  redirect("/admin/login");
}
