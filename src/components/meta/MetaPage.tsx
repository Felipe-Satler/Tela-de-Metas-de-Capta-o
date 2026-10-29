import * as React from "react";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import { format, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Filter, Plus, X } from "lucide-react";
import { MetaKPIGrid, type MetaTotais } from "@/components/meta/MetaKPIGrid";
import { MetaEvolucaoChart } from "@/components/meta/MetaEvolucaoChart";
import { MetaFunilConversao } from "@/components/meta/MetaFunilConversao";
import { MetaEditDialog } from "@/components/meta/MetaEditDialog";

import { SERIES } from "@/components/meta/metaIndicadores";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { type CaptacaoMetaRow, useCaptacaoMetas, valorDe } from "@/hooks/useCaptacaoMetas";
import { mesLabel } from "@/lib/metaDatas";

const PERIODO_EDICAO_KEY = "companium.captacao.metas.periodoEdicao";

/** Visual neumórfico para os calendários dos filtros de data. */
const CAL_CLASSNAMES = {
  month_caption: "flex h-9 w-full items-center justify-center px-9 mb-1",
  caption_label: "select-none text-sm font-semibold text-foreground capitalize",
  nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
  button_previous:
    "neu-button h-8 w-8 p-0 inline-flex items-center justify-center text-muted-foreground hover:text-foreground",
  button_next:
    "neu-button h-8 w-8 p-0 inline-flex items-center justify-center text-muted-foreground hover:text-foreground",
  weekday: "text-muted-foreground flex-1 select-none text-[0.7rem] font-medium lowercase pb-1",
  week: "mt-1 flex w-full",
  day: "group/day relative aspect-square h-full w-full select-none p-0.5 text-center",
  today: "rounded-md ring-1 ring-primary/40 data-[selected=true]:ring-0",
  outside: "text-muted-foreground/40 aria-selected:text-muted-foreground/40",
} as const;


export default function MetaPage() {
  // Troque por seu contexto de auth. Por padrão, edição liberada.
  const user = null as { email?: string } | null;
  const isAdmin = true;
  const { rows, loading, salvarMes } = useCaptacaoMetas();

  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(() => startOfMonth(new Date()));
  const [dateTo, setDateTo] = React.useState<Date | undefined>(() => new Date());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  // Período de edição persistido: sobrevive ao fechar/reabrir o diálogo e ao recarregar a página.
  const [periodoEdicao, setPeriodoEdicao] = React.useState<DateRange | undefined>(() => ({
    from: startOfMonth(new Date()),
    to: new Date(),
  }));
  const [salvando, setSalvando] = React.useState(false);

  // Restaura o período salvo (somente no cliente, para não quebrar a hidratação).
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(PERIODO_EDICAO_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { from?: string; to?: string };
        if (p.from) setPeriodoEdicao({ from: new Date(p.from), to: p.to ? new Date(p.to) : undefined });
      }
    } catch {
      /* ignora */
    }
  }, []);

  React.useEffect(() => {
    if (periodoEdicao?.from) {
      localStorage.setItem(
        PERIODO_EDICAO_KEY,
        JSON.stringify({
          from: periodoEdicao.from.toISOString(),
          to: periodoEdicao.to ? periodoEdicao.to.toISOString() : undefined,
        })
      );
    } else {
      localStorage.removeItem(PERIODO_EDICAO_KEY);
    }
  }, [periodoEdicao]);

  const inicioEf = dateFrom ? format(dateFrom, "yyyy-MM") : null;
  const fimEf = dateTo ? format(dateTo, "yyyy-MM") : null;

  const filtradas = React.useMemo(
    () =>
      rows
        .filter((r) => (!inicioEf || r.mes >= inicioEf) && (!fimEf || r.mes <= fimEf))
        .sort((a, b) => a.mes.localeCompare(b.mes)),
    [rows, inicioEf, fimEf]
  );

  const totais = React.useMemo(() => {
    const acc: MetaTotais = {};
    for (const s of SERIES) acc[s.id] = { plan: 0, real: 0 };
    for (const r of filtradas) {
      for (const s of SERIES) {
        const alvo = acc[s.id]!;
        alvo.plan += valorDe(r, s.key, "plan", s.variante);
        alvo.real += valorDe(r, s.key, "real", s.variante);
      }
    }
    return acc;
  }, [filtradas]);

  const handleSalvar = async (novasLinhas: CaptacaoMetaRow[]) => {
    setSalvando(true);
    try {
      let persistencia: "banco" | "local" = "banco";
      for (const row of novasLinhas) {
        const res = await salvarMes(row, user?.email ?? null);
        if (res.persistido === "local") persistencia = "local";
      }
      const label = novasLinhas.map((r) => mesLabel(r.mes)).join(", ");
      void persistencia;
      toast.success(`Metas de ${label} atualizadas (dados de exemplo, não são salvos).`);
      setDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar metas.");
    } finally {
      setSalvando(false);
    }
  };

  const abrirEdicaoDoMes = (mes: string) => {
    const [ano, m] = mes.split("-");
    const primeiro = new Date(Number(ano), Number(m) - 1, 1);
    const ultimo = new Date(Number(ano), Number(m), 0);
    setPeriodoEdicao({ from: primeiro, to: ultimo });
    setDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Meta</h1>

      <div className="neu-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Filtros</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left text-xs font-normal neu-inset border-0 transition-all duration-200 hover:ring-1 hover:ring-primary/25 hover:bg-primary/[0.04]",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Data início"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 neu-dialog border-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  locale={ptBR}
                  autoFocus
                  classNames={CAL_CLASSNAMES}
                  className={cn("p-4 pointer-events-auto bg-transparent [--cell-size:2.25rem]")}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left text-xs font-normal neu-inset border-0 transition-all duration-200 hover:ring-1 hover:ring-primary/25 hover:bg-primary/[0.04]",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy") : "Data fim"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 neu-dialog border-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  locale={ptBR}
                  autoFocus
                  classNames={CAL_CLASSNAMES}
                  className={cn("p-4 pointer-events-auto bg-transparent [--cell-size:2.25rem]")}
                />
              </PopoverContent>
            </Popover>


            {(dateFrom || dateTo) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateFrom(undefined);
                  setDateTo(undefined);
                }}
                className="flex items-center gap-1.5 text-xs font-medium bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
                Limpar filtros
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button
                size="sm"
                onClick={() => setDialogOpen(true)}
                className="neu-button-primary border-0 h-9 px-4 text-xs font-semibold tracking-wide"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Editar metas
              </Button>
            )}
          </div>
        </div>
      </div>


      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-loading h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <MetaKPIGrid totais={totais} />
          <MetaEvolucaoChart rows={filtradas} />
          <MetaFunilConversao totais={totais} />
        </>
      )}

      {isAdmin && (
        <MetaEditDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          rows={rows}
          periodo={periodoEdicao}
          onPeriodoChange={setPeriodoEdicao}
          salvando={salvando}
          onSalvar={handleSalvar}
        />
      )}
    </div>
  );
}
