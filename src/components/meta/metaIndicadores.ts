export type MetaIndicadorKey =
  | "agendamentos"
  | "investimento"
  | "leads"
  | "cpl"
  | "leads_inbound"
  | "reunioes"
  | "vendas"
  | "novo_mrr";

export type MetaVariante = "total" | "inbound";

export type MetaIndicador = {
  key: MetaIndicadorKey;
  label: string;
  tipo: "moeda" | "numero";
  /** Quando presente, o indicador tem versões Total e Inbound. */
  variantes?: MetaVariante[];
};

export const VARIANTES: MetaVariante[] = ["total", "inbound"];

export const varianteLabel = (v: MetaVariante) => (v === "total" ? "Total" : "Inbound");

export const INDICADORES: MetaIndicador[] = [
  { key: "investimento", label: "Investimento", tipo: "moeda" },
  { key: "leads_inbound", label: "Leads Inbound", tipo: "numero" },
  { key: "cpl", label: "CPL", tipo: "moeda" },
  { key: "leads", label: "Leads", tipo: "numero" },
  { key: "agendamentos", label: "Agendamentos", tipo: "numero", variantes: VARIANTES },
  { key: "reunioes", label: "Reuniões", tipo: "numero", variantes: VARIANTES },
  { key: "vendas", label: "Vendas", tipo: "numero", variantes: VARIANTES },
  { key: "novo_mrr", label: "nMRR", tipo: "moeda", variantes: VARIANTES },
];

/** Nome da coluna/campo no registro do mês. */
export const campoDe = (key: MetaIndicadorKey, tipo: "plan" | "real", variante?: MetaVariante) =>
  variante ? `${key}_${variante}_${tipo}` : `${key}_${tipo}`;

/** Chave única de série (para totais, gráficos e formulários). */
export const serieKey = (key: MetaIndicadorKey, variante?: MetaVariante) =>
  variante ? `${key}:${variante}` : key;

export type MetaSerie = {
  id: string;
  key: MetaIndicadorKey;
  variante?: MetaVariante;
  label: string;
  tipo: MetaIndicador["tipo"];
};

/** Todas as séries existentes (indicadores simples + variantes). */
export const SERIES: MetaSerie[] = INDICADORES.flatMap((ind) =>
  ind.variantes
    ? ind.variantes.map((v) => ({
        id: serieKey(ind.key, v),
        key: ind.key,
        variante: v,
        label: `${ind.label} (${varianteLabel(v)})`,
        tipo: ind.tipo,
      }))
    : [{ id: serieKey(ind.key), key: ind.key, label: ind.label, tipo: ind.tipo }]
);

export const fmtValor = (v: number, tipo: MetaIndicador["tipo"]) =>
  tipo === "moeda"
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
    : v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

export const fmtPct = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

/** Verde a partir de 100%, âmbar de 80% a 99%, vermelho abaixo. */
export const corAtingimento = (pct: number) =>
  pct >= 100 ? "text-primary" : pct >= 80 ? "text-amber-500" : "text-destructive";
