"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { provisionarLoja, trocarSenhaLoja } from "@/lib/admin";

export async function criarLoja(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const dbUrl = String(formData.get("db_url") ?? "").trim() || undefined;
  const dbToken = String(formData.get("db_token") ?? "").trim() || undefined;

  let slugCriado: string;
  try {
    const r = await provisionarLoja({ nome, slug, senha, dbUrl, dbToken });
    slugCriado = r.slug;
  } catch (e) {
    // redirect() retorna `never` — o erro de provisionamento não vaza pra cá
    redirect(`/admin?erro=${encodeURIComponent(e instanceof Error ? e.message : "Erro ao criar a loja.")}`);
  }

  revalidatePath("/admin");
  redirect(`/admin?criada=${encodeURIComponent(slugCriado)}`);
}

export async function mudarSenhaLoja(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  try {
    await trocarSenhaLoja(slug, senha);
  } catch (e) {
    redirect(`/admin?erro=${encodeURIComponent(e instanceof Error ? e.message : "Erro ao trocar a senha.")}`);
  }

  revalidatePath("/admin");
  redirect(`/admin?senha_ok=${encodeURIComponent(slug)}`);
}
