"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_ITENS, navAtivo } from "@/components/nav-itens";

// Navegação lateral — só aparece no desktop (md+); no celular vale a BottomNav
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-border bg-surface md:flex">
      <div className="px-6 pb-7 pt-8">
        <p className="font-display text-[26px] font-black leading-none tracking-tight">
          Acerto<span className="text-brass">.</span>
        </p>
        <p className="mt-1.5 text-xs text-muted">crediário digital</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITENS.map(({ href, rotulo, Icone }) => {
          const ativo = navAtivo(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px]",
                ativo
                  ? "bg-primary/10 font-bold text-primary"
                  : "font-medium text-muted hover:bg-surface-2 hover:text-ink"
              )}
            >
              <Icone className="h-5 w-5" strokeWidth={ativo ? 2.5 : 2} />
              {rotulo}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-6 py-5 text-[11px] leading-relaxed text-muted">
        Suporte direto no WhatsApp
        <br />
        com quem instalou.
      </div>
    </aside>
  );
}
