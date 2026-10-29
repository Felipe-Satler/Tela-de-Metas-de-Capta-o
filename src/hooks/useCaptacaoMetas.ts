import * as React from "react";
import {
  INDICADORES,
  type MetaIndicadorKey,
  type MetaVariante,
  campoDe,
} from "@/components/meta/metaIndicadores";

export type CaptacaoMetaRow = {
  mes: string; // AAAA-MM
  atualizado_em?: string | null;
  atualizado_por?: string | null;
} & Record<string, number | string | null | undefined>;

export const linhaVazia = (mes: string): CaptacaoMetaRow => {
  const base: Record<string, number> = {};
  for (const i of INDICADORES) {
    if (i.variantes) {
      for (const v of i.variantes) {
        base[campoDe(i.key, "plan", v)] = 0;
        base[campoDe(i.key, "real", v)] = 0;
      }
    } else {
      base[campoDe(i.key, "plan")] = 0;
      base[campoDe(i.key, "real")] = 0;
    }
  }
  return { mes, ...base };
};

export const valorDe = (
  row: CaptacaoMetaRow,
  key: MetaIndicadorKey,
  tipo: "plan" | "real",
  variante?: MetaVariante
) => {
  const r = row as Record<string, unknown>;
  const atual = r[campoDe(key, tipo, variante)];
  if (atual !== null && atual !== undefined) return Number(atual);
  if (variante === "total") return Number(r[campoDe(key, tipo)] ?? 0);
  return 0;
};

/** Dados fictícios de exemplo (jan–dez 2026). Nada é lido ou gravado externamente. */
function gerarMock(): CaptacaoMetaRow[] {
  const linhas: CaptacaoMetaRow[] = [];
  for (let m = 1; m <= 12; m++) {
    const f = 1 + (m - 1) * 0.04; // crescimento ao longo do ano
    const osc = [0.86, 0.94, 1.03, 0.91, 1.08, 0.97, 1.12, 0.89, 1.01, 0.95, 1.06, 0.92][m - 1]!;
    const r = (n: number) => Math.round(n);
    const investimentoPlan = r(40000 * f);
    const investimentoReal = r(investimentoPlan * (osc + 0.02));
    const leadsPlan = r(800 * f);
    const leadsReal = r(leadsPlan * osc);
    const inbPlan = r(leadsPlan * 0.6);
    const inbReal = r(leadsReal * 0.62);
    const agPlan = r(leadsPlan * 0.25);
    const agReal = r(leadsReal * 0.24);
    const reuPlan = r(agPlan * 0.7);
    const reuReal = r(agReal * 0.72);
    const venPlan = r(reuPlan * 0.3);
    const venReal = r(reuReal * 0.3 * osc);
    linhas.push({
      mes: `2026-${String(m).padStart(2, "0")}`,
      investimento_plan: investimentoPlan,
      investimento_real: investimentoReal,
      leads_plan: leadsPlan,
      leads_real: leadsReal,
      cpl_plan: r(investimentoPlan / leadsPlan),
      cpl_real: r(investimentoReal / Math.max(1, leadsReal)),
      leads_inbound_plan: inbPlan,
      leads_inbound_real: inbReal,
      agendamentos_total_plan: agPlan,
      agendamentos_total_real: agReal,
      agendamentos_inbound_plan: r(agPlan * 0.6),
      agendamentos_inbound_real: r(agReal * 0.58),
      reunioes_total_plan: reuPlan,
      reunioes_total_real: reuReal,
      reunioes_inbound_plan: r(reuPlan * 0.6),
      reunioes_inbound_real: r(reuReal * 0.63),
      vendas_total_plan: venPlan,
      vendas_total_real: venReal,
      vendas_inbound_plan: r(venPlan * 0.6),
      vendas_inbound_real: r(venReal * 0.55),
      novo_mrr_total_plan: venPlan * 1500,
      novo_mrr_total_real: venReal * 1550,
      novo_mrr_inbound_plan: r(venPlan * 0.6) * 1500,
      novo_mrr_inbound_real: r(venReal * 0.55) * 1550,
    });
  }
  return linhas;
}

/** Metas 100% mockadas, mantidas apenas em memória. */
export function useCaptacaoMetas() {
  const [rows, setRows] = React.useState<CaptacaoMetaRow[]>(gerarMock);

  const salvarMes = React.useCallback(async (row: CaptacaoMetaRow, email: string | null) => {
    const payload = { ...row, atualizado_em: new Date().toISOString(), atualizado_por: email };
    setRows((prev) =>
      [...prev.filter((r) => r.mes !== payload.mes), payload].sort((a, b) => a.mes.localeCompare(b.mes))
    );
    return { persistido: "local" as const };
  }, []);

  const removerMes = React.useCallback(async (mes: string) => {
    setRows((prev) => prev.filter((r) => r.mes !== mes));
  }, []);

  return {
    rows,
    loading: false,
    remoteAvailable: false,
    refresh: async () => setRows(gerarMock()),
    salvarMes,
    removerMes,
  };
}
