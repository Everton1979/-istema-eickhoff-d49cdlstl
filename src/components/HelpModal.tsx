import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'

export function HelpModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-primary/80"
          title="Ajuda"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            Central de Ajuda
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-2">
          <Accordion type="single" collapsible className="w-full pb-6">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-blue-600">
                Guia de Fechamento Mensal
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 leading-relaxed">
                Passo a passo sobre como inserir o número de fórmulas, vendas e custos para
                atualizar seus indicadores. Clique no botão de Fechamento Mensal no Dashboard,
                selecione o mês/ano e insira as informações operacionais da farmácia para habilitar
                o cálculo de KPIs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-blue-600">
                Dicionário de Indicadores (KPIs)
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  Definições simples para termos como Ticket Médio, Fator Médio, Markup e CFA Total,
                  garantindo que todos entendam os números:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>
                    <strong>Ticket Médio:</strong> Receita dividida pelo número de pedidos.
                  </li>
                  <li>
                    <strong>Fator Médio:</strong> Receita dividida pelo custo de matéria-prima.
                  </li>
                  <li>
                    <strong>Markup:</strong> Multiplicador para formar o preço de venda.
                  </li>
                  <li>
                    <strong>CFA Total:</strong> Custo Fixo Administrativo (despesas fixas).
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-blue-600">
                Gestão de Metas Diárias
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 leading-relaxed">
                Explicação de como o sistema calcula as metas automaticamente, considerando apenas
                os dias úteis (excluindo domingos e feriados nacionais brasileiros). A meta mensal
                inserida no fechamento é dividida proporcionalmente para ajudar no acompanhamento
                diário de vendas.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-blue-600">
                Assistente de Precificação
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 leading-relaxed">
                Instruções de como usar o Markup do seu último fechamento para definir o preço ideal
                das fórmulas. Basta inserir o custo estimado de matérias-primas e embalagem no
                assistente do Dashboard, e o sistema aplicará o multiplicador para sugerir o preço
                de prateleira adequado.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-blue-600">
                Filtros e Alertas
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 leading-relaxed">
                Como gerenciar transações previstas/vencidas e organizar despesas através de tags.
                Utilize a barra lateral para filtrar os resultados visuais do dashboard por mês e
                status. Fique atento ao ícone de sino (Alertas), que notificará instantaneamente
                sobre despesas atrasadas ou com vencimento no dia de hoje.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-blue-600">
                Relatórios
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 leading-relaxed">
                Como exportar seus dados em PDF para contabilidade ou arquivamento. Acesse o botão
                "Exportar PDF" no topo do Dashboard. O sistema gerará um relatório formatado e limpo
                com o resumo gerencial do mês selecionado, perfeito para impressão.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
