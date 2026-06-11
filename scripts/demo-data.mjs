// Dataset de demonstração (Mercearia do Zé). Usado pelo seed e pelo nova-loja --demo.
// [nome, telefone, [tipo, centavos, descricao, diasAtras][]]
export const CLIENTES_DEMO = [
  ["Maria Aparecida", "(11) 98765-4321", [
    ["compra", 4350, "Arroz 5kg e feijão", 28],
    ["compra", 1890, "Pão e leite", 21],
    ["pagamento", 4000, null, 15],
    ["compra", 6720, "Carne moída 2kg", 9],
    ["compra", 2540, "Ovos e óleo", 3],
  ]],
  ["Seu Antônio", "(11) 97654-3210", [
    ["compra", 12000, "Gás de cozinha", 18],
    ["compra", 3480, "Café e açúcar", 11],
    ["pagamento", 5000, null, 6],
  ]],
  ["Dona Lúcia", null, [
    ["compra", 5230, "Compras da semana", 13],
    ["compra", 2110, "Pão de cada dia", 5],
  ]],
  ["Francisca Souza", "(11) 96543-2109", [
    ["compra", 8900, "Feira do mês", 32],
    ["pagamento", 8900, null, 12],
    ["compra", 4470, "Frango e legumes", 4],
  ]],
  ["Pedro Henrique", "(11) 95432-1098", [
    ["compra", 1550, "Refrigerante e salgadinho", 8],
    ["compra", 980, "Pão na chapa", 2],
    ["compra", 760, "Leite", 0],
  ]],
  ["Ana Paula", "(11) 94321-0987", [
    ["compra", 6300, "Material de limpeza", 25],
    ["pagamento", 6300, null, 10],
  ]],
  ["Sebastião Ramos", "(11) 93210-9876", [
    ["compra", 15890, "Compras do mês", 30],
    ["pagamento", 7000, null, 16],
    ["compra", 5340, "Carne e arroz", 7],
  ]],
];

// Data N dias atrás, no formato do banco e no fuso de São Paulo
export function diasAtrasSP(dias) {
  const d = new Date(Date.now() - dias * 86400000);
  return d.toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" });
}
