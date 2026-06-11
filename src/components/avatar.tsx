import clsx from "clsx";

// Círculo com as iniciais do cliente — verde quando em dia, vermelho quando devendo
export function Avatar({
  nome,
  devendo = false,
  className,
}: {
  nome: string;
  devendo?: boolean;
  className?: string;
}) {
  const iniciais = nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      className={clsx(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold",
        devendo ? "bg-debt/10 text-debt" : "bg-primary/10 text-primary",
        className
      )}
    >
      {iniciais}
    </span>
  );
}
