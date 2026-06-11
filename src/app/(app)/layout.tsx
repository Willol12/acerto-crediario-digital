import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESSAO, lerSessao } from "@/lib/auth";
import { lojaPorSlug } from "@/lib/db";
import { BottomNav } from "@/components/bottom-nav";
import { Sidebar } from "@/components/sidebar";

// Shell das telas logadas: sidebar no desktop, barra de baixo no celular.
// Também valida que a loja da sessão ainda existe — se foi removida, manda pro login
// (em vez de estourar erro lá dentro ao tentar abrir um banco que não existe).
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao || !(await lojaPorSlug(sessao.slug))) {
    redirect("/sair");
  }

  return (
    <>
      <Sidebar />
      <div className="md:pl-60">
        <div className="mx-auto w-full max-w-md px-4 pb-28 pt-6 md:max-w-5xl md:px-10 md:pb-16 md:pt-10">
          {children}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
