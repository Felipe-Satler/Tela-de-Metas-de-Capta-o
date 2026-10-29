import { Pencil } from "lucide-react";
import { mesLabel } from "@/lib/metaDatas";
import { type CaptacaoMetaRow, valorDe } from "@/hooks/useCaptacaoMetas";
import { INDICADORES, corAtingimento, fmtPct, fmtValor } from "./metaIndicadores";

interface Props {
  rows: CaptacaoMetaRow[];
  isAdmin: boolean;
  onEditar: (mes: string) => void;
}

export function MetaTabelaMensal({ rows, isAdmin, onEditar }: Props) {
  return (
    <div className="neu-card rounded-xl p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Resumo mensal</h3>
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto neu-scroll">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10 bg-background">
            <tr className="border-b border-border">
              <th className="py-2 px-3 text-left text-muted-foreground font-medium whitespace-nowrap">
                Mês
              </th>
              <th className="py-2 px-3 text-left text-muted-foreground font-medium whitespace-nowrap">
                Indicador
              </th>
              <th className="py-2 px-3 text-left text-muted-foreground font-medium whitespace-nowrap">
                Planejado
              </th>
              <th className="py-2 px-3 text-left text-muted-foreground font-medium whitespace-nowrap">
                Real
              </th>
              <th className="py-2 px-3 text-left text-muted-foreground font-medium whitespace-nowrap">
                Diferença
              </th>
              <th className="py-2 px-3 text-left text-muted-foreground font-medium whitespace-nowrap">
                % Meta
              </th>
              {isAdmin && (
                <th className="py-2 px-3 text-left text-muted-foreground font-medium">Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="py-6 text-center text-muted-foreground">
                  Nenhum período cadastrado.
                </td>
              </tr>
            )}
            {rows.map((r) =>
              INDICADORES.map((ind, idx) => {
                // Indicadores com variantes exibem a linha Total no resumo.
                const variante = ind.variantes ? ("total" as const) : undefined;
                const plan = valorDe(r, ind.key, "plan", variante);
                const real = valorDe(r, ind.key, "real", variante);
                const diff = real - plan;
                const pct = plan > 0 ? (real / plan) * 100 : 0;
                return (
                  <tr
                    key={`${r.mes}-${ind.key}`}
                    className="border-b border-border/70 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-2 px-3 whitespace-nowrap text-foreground font-medium">
                      {idx === 0 ? mesLabel(r.mes) : ""}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-foreground">{ind.label}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-foreground">
                      {fmtValor(plan, ind.tipo)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-foreground">
                      {fmtValor(real, ind.tipo)}
                    </td>
                    <td
                      className={`py-2 px-3 whitespace-nowrap font-medium ${diff >= 0 ? "text-primary" : "text-destructive"}`}
                    >
                      {diff >= 0 ? "+" : "−"}
                      {fmtValor(Math.abs(diff), ind.tipo)}
                    </td>
                    <td className={`py-2 px-3 whitespace-nowrap font-semibold ${corAtingimento(pct)}`}>
                      {plan > 0 ? fmtPct(pct) : "—"}
                    </td>
                    {isAdmin && (
                      <td className="py-2 px-3 whitespace-nowrap">
                        {idx === 0 && (
                          <button
                            onClick={() => onEditar(r.mes)}
                            className="neu-button rounded-lg px-2 py-1 text-[11px] text-primary inline-flex items-center gap-1"
                          >
                            <Pencil className="h-3 w-3" />
                            Editar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
