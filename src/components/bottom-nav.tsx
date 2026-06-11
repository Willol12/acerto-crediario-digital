"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_ITENS, navAtivo } from "@/components/nav-itens";

// Navegação de baixo — só no celular (escondida em md+, onde entra a Sidebar)
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur md:hidden">
      <div className="mx-auto flex w-full max-w-md items-end justify-between px-3 pb-2 pt-1.5">
        {NAV_ITENS.map(({ href, rotulo, Icone, ...item }) => {
          const ativo = navAtivo(pathname, href);
          if ("destaque" in item && item.destaque) {
            return (
              <Link
                key={href}
                href={href}
                className="-mt-7 flex flex-col items-center gap-1"
                aria-label={rotulo}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-fg shadow-lg shadow-primary/30 active:scale-95">
                  <Icone className="h-7 w-7" strokeWidth={2.5} />
                </span>
                <span className="text-[11px] font-bold text-primary">{rotulo}</span>
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5",
                ativo ? "text-primary" : "text-muted"
              )}
            >
              <Icone className="h-6 w-6" strokeWidth={ativo ? 2.5 : 2} />
              <span className={clsx("text-[11px]", ativo ? "font-bold" : "font-medium")}>
                {rotulo}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
