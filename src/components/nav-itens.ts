import { Home, Users, Plus, MessageCircle, Settings } from "lucide-react";

export const NAV_ITENS = [
  { href: "/", rotulo: "Painel", Icone: Home },
  { href: "/clientes", rotulo: "Clientes", Icone: Users },
  { href: "/lancar", rotulo: "Lançar", Icone: Plus, destaque: true },
  { href: "/fechamento", rotulo: "Cobrança", Icone: MessageCircle },
  { href: "/config", rotulo: "Ajustes", Icone: Settings },
] as const;

export function navAtivo(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
