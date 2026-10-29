import { createFileRoute } from "@tanstack/react-router";
import MetaPage from "@/components/meta/MetaPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meta — Real x Planejado da Captação" },
      {
        name: "description",
        content:
          "Acompanhe metas de captação mês a mês: investimento, leads, CPL, agendamentos, reuniões, vendas e nMRR com atingimento e funil de conversão.",
      },
      { property: "og:title", content: "Meta — Real x Planejado da Captação" },
      {
        property: "og:description",
        content:
          "KPIs de captação real x planejado, evolução mensal, funil de conversão e edição manual de metas por período.",
      },
    ],
  }),
  component: MetaPage,
});
