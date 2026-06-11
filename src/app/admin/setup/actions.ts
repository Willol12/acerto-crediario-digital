"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { setMeta } from "@/lib/db";

// A chave de configuração é o próprio SESSION_SECRET — só quem o tem pode definir
// ou recuperar a senha do dono. Em dev cai no segredo fixo de desenvolvimento.
function chaveConfig(): string {
  return process.env.SESSION_SECRET ?? "segredo-de-dev-nao-usar-em-producao";
}

export async function definirSenhaDono(formData: FormData) {
  const chave = String(formData.get("chave") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (chave !== chaveConfig()) {
    await new Promise((r) => setTimeout(r, 800));
    redirect("/admin/setup?erro=chave");
  }
  if (senha.length < 8) {
    redirect("/admin/setup?erro=senha");
  }

  await setMeta("admin_senha_hash", bcrypt.hashSync(senha, 12));
  redirect("/admin/login?definida=1");
}
