/** Agora no fuso de São Paulo, no formato do banco: "AAAA-MM-DD HH:MM:SS".
 * Calculado no app (não no banco) porque o servidor do Turso/Vercel roda em UTC. */
export function agoraSaoPaulo(): string {
  return new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

export function mesAtualSaoPaulo(): string {
  return agoraSaoPaulo().slice(0, 7);
}

export function formatarReais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Aceita "12,50", "1.234,56", "12.50" e "12". Retorna centavos ou null se inválido. */
export function parseValorParaCentavos(texto: string): number | null {
  const limpo = texto.trim().replace(/\s|R\$/gi, "");
  if (!limpo) return null;
  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo;
  const n = Number(normalizado);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

/** Normaliza pro formato do wa.me: só dígitos, com 55 na frente se for número BR sem código do país. */
export function telefoneParaWhatsApp(telefone: string | null): string | null {
  if (!telefone) return null;
  let digitos = telefone.replace(/\D/g, "");
  if (!digitos) return null;
  if (digitos.length === 10 || digitos.length === 11) digitos = "55" + digitos;
  return digitos;
}

export function montarMensagemCobranca(
  template: string,
  dados: { nome: string; valor: string; loja: string }
): string {
  return template
    .replaceAll("{nome}", dados.nome)
    .replaceAll("{valor}", dados.valor)
    .replaceAll("{loja}", dados.loja);
}

export function linkWhatsApp(telefone: string | null, mensagem: string): string | null {
  const digitos = telefoneParaWhatsApp(telefone);
  if (!digitos) return null;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensagem)}`;
}

/** "2026-06-08 14:30:00" -> dias inteiros desde então (0 = hoje), no fuso de São Paulo.
 * Compara só a parte da data, então não depende do fuso do servidor. */
export function diasAtras(dataLocal: string | null): number | null {
  if (!dataLocal) return null;
  const [ano, mes, dia] = dataLocal.slice(0, 10).split("-").map(Number);
  if (!ano || !mes || !dia) return null;
  const [hAno, hMes, hDia] = agoraSaoPaulo().slice(0, 10).split("-").map(Number);
  const diff = (Date.UTC(hAno, hMes - 1, hDia) - Date.UTC(ano, mes - 1, dia)) / 86400000;
  return Math.max(0, Math.round(diff));
}

export function formatarDataCurta(dataLocal: string): string {
  // "2026-06-08 14:30:00" -> "08/06"
  const [data] = dataLocal.split(" ");
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}
