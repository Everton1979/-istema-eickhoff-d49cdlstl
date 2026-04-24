import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, TrendingUp, TrendingDown, Target, Calculator } from 'lucide-react'

const GLOSSARY_TERMS = [
  {
    id: 'assistente-precificacao',
    title: 'Assistente de Precificação',
    definition:
      'Calculadora que utiliza o Mark-up Multiplicador real da sua operação para sugerir o preço de Ponto de Equilíbrio. Nota: O cálculo é baseado na média dos últimos 3 meses.',
    calculation: 'Custo Informado (MP + Embalagem) * Mark-up Multiplicador.',
    reference:
      'Ferramenta para garantir que orçamentos não sejam vendidos abaixo do custo operacional mínimo da farmácia.',
    category: 'Ferramentas do Dashboard',
    trend: 'neutral',
  },
  {
    id: 'cfa-total',
    title: 'CFA Total (Custos Fixos Administrativos)',
    definition:
      'Soma de todas as despesas que não variam diretamente com a quantidade produzida (ex: aluguel, salários, contador, energia básica).',
    calculation: 'Soma de todas as transações financeiras categorizadas como "Fixa".',
    reference:
      'Quanto menor, melhor. Manter o CFA controlado é o principal fator para reduzir o risco do seu Ponto de Equilíbrio. O ideal é que seja menor que 35%.',
    category: 'Métricas de Performance',
    trend: 'down',
  },
  {
    id: 'cortesias',
    title: 'Cortesias (Tipo de Transação)',
    definition:
      'Saídas de produtos ou serviços concedidas sem cobrança (ex: amostras para médicos, brindes). Por se tratar de uma ação de marketing/relacionamento que não gera entrada de caixa e cujo custo de insumo já foi contabilizado na compra da matéria-prima, as cortesias não entram na contabilidade operacional (DRE) para não distorcer a margem de lucro.',
    calculation: 'Não aplicável ao DRE.',
    reference:
      'Lançamentos de cortesia servem apenas para histórico e rastreabilidade de para quem os produtos foram destinados.',
    category: 'Tipos e Classificações',
    trend: 'neutral',
  },
  {
    id: 'custo-fixo-formula',
    title: 'Custo Fixo por Fórmula',
    definition:
      'Indica qual é o "peso" do custo fixo que cada fórmula manipulada precisa pagar para manter a farmácia aberta.',
    calculation: 'CFA Total / Número de Pedidos.',
    reference:
      'Quanto menor, melhor. Produzir um volume maior de fórmulas ajuda a "diluir" o custo fixo, reduzindo este indicador.',
    category: 'Métricas de Performance',
    trend: 'down',
  },
  {
    id: 'custos-variaveis',
    title: 'Custos Variáveis',
    definition:
      'Soma de todas as despesas que variam diretamente de acordo com o volume de produção ou vendas (ex: impostos, taxas de cartão, comissões).',
    calculation: 'Soma de todas as transações financeiras categorizadas como "Variável".',
    reference:
      'Quanto menor, melhor. O ideal é que seja menor que 40% para garantir uma margem de contribuição saudável.',
    category: 'Métricas de Performance',
    trend: 'down',
  },
  {
    id: 'despesas-fixas',
    title: 'Despesas Fixas',
    definition:
      'São os gastos que a empresa possui independentemente de realizar vendas ou não. Eles se mantêm (ou variam muito pouco) todo mês. Exemplos: Aluguel, IPTU, salários da equipe administrativa, honorários contábeis, sistemas e softwares.',
    calculation: 'Soma dos lançamentos categorizados como "Fixa".',
    reference:
      'Essenciais para o cálculo do Ponto de Equilíbrio. Devem ser monitoradas de perto, pois não dependem do faturamento.',
    category: 'Tipos e Classificações',
    trend: 'neutral',
  },
  {
    id: 'despesas-previstas',
    title: 'Despesas Previstas',
    definition:
      'Soma das despesas e custos (fixos e variáveis) que ainda não foram pagos (status "Previsto" ou "Vencido") para o período filtrado.',
    calculation: 'Soma das transações de tipo "Despesa" que não estão com status "Realizado".',
    reference:
      'Fundamental para previsibilidade de caixa. Mostra o quanto a empresa ainda tem de compromissos a quitar no mês.',
    category: 'Painel Geral (Cards)',
    trend: 'down',
  },
  {
    id: 'despesas-e-custos',
    title: 'Despesas Realizadas',
    definition:
      'Soma de todas as saídas de caixa efetivamente pagas no período, incluindo custos fixos e variáveis.',
    calculation: 'Soma das transações de tipo "Despesa" com status "Realizado".',
    reference: 'Representa o total de dinheiro que efetivamente saiu do caixa da empresa.',
    category: 'Painel Geral (Cards)',
    trend: 'down',
  },
  {
    id: 'despesas-variaveis',
    title: 'Despesas Variáveis',
    definition:
      'São os gastos que ocorrem apenas quando há venda ou produção, crescendo proporcionalmente ao faturamento. Exemplos: Impostos sobre venda (Simples Nacional), taxas de cartão de crédito, comissões, fretes de entrega, embalagens e matérias-primas.',
    calculation: 'Soma dos lançamentos categorizados como "Variável".',
    reference:
      'Impactam diretamente a Margem de Contribuição. Precisam estar embutidas no preço de venda para não gerar prejuízo.',
    category: 'Tipos e Classificações',
    trend: 'neutral',
  },
  {
    id: 'dividendos-lucros',
    title: 'Dividendos e Lucros (Receita Não Operacional)',
    definition:
      'Entradas financeiras que não são provenientes da atividade principal da empresa. Exemplo: Rendimentos de aplicações financeiras, venda de um equipamento antigo.',
    calculation: 'Classificação de receita no DRE.',
    reference:
      'Separadas das receitas operacionais para não inflar a performance real de vendas da farmácia.',
    category: 'Tipos e Classificações',
    trend: 'neutral',
  },
  {
    id: 'ebitda',
    title: 'EBITDA',
    definition:
      'Geração de caixa operacional (Margem de Contribuição - Custos Fixos). Representa o lucro gerado exclusivamente pela operação, antes de juros, impostos sobre lucro, depreciação e amortização.',
    calculation: 'Margem de Contribuição - Custos Fixos.',
    reference: 'Um dos indicadores mais importantes. Mostra se o negócio principal é lucrativo.',
    category: 'Painel Geral (Cards)',
    trend: 'up',
  },
  {
    id: 'fator-medio',
    title: 'Fator Médio',
    definition:
      'Relação que indica quantas vezes o faturamento supera o custo direto de insumos (matéria-prima + embalagens).',
    calculation: 'Faturamento Total / Custo de Insumos.',
    reference: 'Um bom fator médio fica entre 5,0 e 6,5, dependendo do mix de produtos.',
    category: 'Métricas de Performance',
    trend: 'up',
  },
  {
    id: 'lucro-liquido',
    title: 'Lucro Líquido Realizado',
    definition: 'Resultado final de caixa no período analisado.',
    calculation: 'Receitas Realizadas - Despesas Realizadas.',
    reference:
      'Indica se a empresa gerou caixa excedente após pagar todas as obrigações no período.',
    category: 'Painel Geral (Cards)',
    trend: 'up',
  },
  {
    id: 'margem-de-contribuicao',
    title: 'Margem de Contribuição',
    definition:
      'O valor que sobra da receita bruta após subtrair os custos variáveis operacionais e os insumos (matéria-prima + embalagens). É o que contribui para pagar as despesas fixas e gerar lucro.',
    calculation: 'Receitas - (Custos Variáveis + Insumos).',
    reference:
      'Margens positivas e robustas indicam que a operação consegue cobrir o custo fixo mais rapidamente.',
    category: 'Painel Geral (Cards)',
    trend: 'up',
  },
  {
    id: 'markup-divisor',
    title: 'Mark-up Divisor',
    definition:
      'Índice que representa a proporção do custo direto em relação ao custo total no ponto de equilíbrio.',
    calculation: 'Custo de Insumos / Custos Totais.',
    reference: 'Quanto menor o divisor, maior o multiplicador necessário para cobrir os custos.',
    category: 'Métricas de Performance',
    trend: 'neutral',
  },
  {
    id: 'markup-mult',
    title: 'Mark-up Multiplicador',
    definition:
      'Fator aplicado sobre o custo direto (MP + Embalagem) para encontrar o preço de venda de Ponto de Equilíbrio.',
    calculation: '1 / Mark-up Divisor.',
    reference:
      'Valor ideal para balizar o preço mínimo. Vender abaixo deste fator significa operar em prejuízo.',
    category: 'Métricas de Performance',
    trend: 'neutral',
  },
  {
    id: 'markup-realizado',
    title: 'Mark-up Praticado',
    definition: 'Multiplicador efetivamente realizado pela farmácia no período.',
    calculation: 'Faturamento Total / Custo de Insumos.',
    reference: 'Deve ser sempre superior ao Mark-up Alvo (P.E.).',
    category: 'Métricas de Performance',
    trend: 'up',
  },
  {
    id: 'monitor-ponto-equilibrio',
    title: 'Monitor Ponto de Equilíbrio',
    definition:
      'Gráfico visual de acompanhamento da receita acumulada em relação ao exigido para pagar todas as contas.',
    calculation: '(Receita Atual / Ponto de Equilíbrio) * 100.',
    reference: 'A barra deve sempre ultrapassar os 100%.',
    category: 'Ferramentas do Dashboard',
    trend: 'neutral',
  },
  {
    id: 'piso-seguranca',
    title: 'Piso de Segurança',
    definition:
      'Valor mínimo absoluto pelo qual uma fórmula pode ser vendida para não gerar prejuízo de caixa imediato.',
    calculation: 'Custo Insumos + Rateio Custos Fixos + Rateio Despesas Variáveis.',
    reference: 'Nenhum orçamento deve ser aprovado abaixo deste valor.',
    category: 'Ferramentas do Dashboard',
    trend: 'neutral',
  },
  {
    id: 'ponto-de-equilibrio',
    title: 'Ponto de Equilíbrio',
    definition:
      'O faturamento necessário para cobrir exatamente todos os custos (fixos e variáveis). É o "zero a zero".',
    calculation: 'Custos Fixos / Índice de Margem de Contribuição.',
    reference: 'Quanto menor, mais segura é a operação.',
    category: 'Painel Geral (Cards)',
    trend: 'down',
  },
  {
    id: 'preco-min-formula',
    title: 'Preço Mínimo por Fórmula',
    definition:
      'Ponto de equilíbrio unitário. O valor mínimo médio pelo qual cada fórmula deve ser vendida para não gerar prejuízo.',
    calculation: 'Custos Totais / Número de Pedidos.',
    reference:
      'Indicador de balizamento. Suas vendas devem ter um ticket médio superior a este valor.',
    category: 'Métricas de Performance',
    trend: 'neutral',
  },
  {
    id: 'preco-sugerido',
    title: 'Preço Sugerido (Markup Dinâmico)',
    definition:
      'Preço de venda recomendado pelo algoritmo inteligente, ajustando a margem conforme o custo do insumo.',
    calculation: 'Custo Informado * Curva de Markup Dinâmico.',
    reference: 'Valor ideal para precificação ágil.',
    category: 'Ferramentas do Dashboard',
    trend: 'neutral',
  },
  {
    id: 'receitas-operacionais',
    title: 'Receitas Realizadas',
    definition: 'Total de entradas financeiras registradas efetivamente na conta bancária/caixa.',
    calculation: 'Soma de todas as transações com tipo "Receita" e status "Realizado".',
    reference: 'Representa o faturamento bruto que virou dinheiro em caixa.',
    category: 'Painel Geral (Cards)',
    trend: 'up',
  },
  {
    id: 'retirada-socios',
    title: 'Retirada de Sócios (Tipo de Transação)',
    definition:
      'Registra a distribuição de lucros ou retiradas esporádicas realizadas pelos proprietários da empresa. Assim como as cortesias, as Retiradas de Sócios são movimentos extra-operacionais. Elas afetam o saldo da conta bancária, mas não entram na DRE (Demonstração do Resultado do Exercício) e não impactam o Lucro Operacional do laboratório.',
    calculation: 'Não aplicável ao DRE/Lucro Operacional.',
    reference:
      'Usado exclusivamente para conciliação bancária e transparência de caixa, sem prejudicar os indicadores de performance da farmácia.',
    category: 'Tipos e Classificações',
    trend: 'neutral',
  },
  {
    id: 'ticket-medio',
    title: 'Ticket Médio',
    definition: 'Valor médio de venda gerado por cada pedido no sistema.',
    calculation: 'Faturamento Total / Número de Pedidos.',
    reference: 'Quanto maior, melhor. Indica otimização do esforço de vendas.',
    category: 'Métricas de Performance',
    trend: 'up',
  },
  {
    id: 'vendas-servicos',
    title: 'Vendas/Serviços (Receita Operacional)',
    definition:
      'São as receitas oriundas exclusivamente da atividade principal do seu negócio: manipulação de fórmulas, venda de cosméticos ou serviços prestados aos clientes.',
    calculation: 'Soma das receitas classificadas como "Operacional".',
    reference:
      'Este é o valor que deve ser analisado para medir a saúde comercial e a aceitação do mercado aos seus produtos.',
    category: 'Tipos e Classificações',
    trend: 'neutral',
  },
]

// Sort terms alphabetically
GLOSSARY_TERMS.sort((a, b) => a.title.localeCompare(b.title))

export default function Glossary() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '')
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add(
            'bg-blue-50/50',
            'border-blue-300',
            'transition-colors',
            'duration-1000',
          )
          setTimeout(() => {
            element.classList.remove('bg-blue-50/50', 'border-blue-300')
          }, 3000)
        }
      }, 100)
    }
  }, [hash])

  // Extract categories and sort them alphabetically
  const categories = Array.from(new Set(GLOSSARY_TERMS.map((t) => t.category))).sort((a, b) =>
    a.localeCompare(b),
  )

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-md shadow-md border overflow-hidden animate-fade-in print:hidden">
      <DashboardHeader />

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#f1f5f9] custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
          <div className="flex flex-col items-center justify-center text-center space-y-2 mb-8 mt-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Glossário de Indicadores</h1>
            <p className="text-slate-500 max-w-2xl">
              Entenda exatamente o que cada métrica, classificação e botão do seu sistema significa,
              como é calculado e qual a referência ideal para garantir a saúde financeira do seu
              laboratório. (Organizado em ordem alfabética).
            </p>
          </div>

          {categories.map((category) => (
            <div key={category} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
                {category === 'Ferramentas do Dashboard' ? (
                  <Calculator className="w-5 h-5 text-slate-400" />
                ) : (
                  <Target className="w-5 h-5 text-slate-400" />
                )}
                {category}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GLOSSARY_TERMS.filter((t) => t.category === category).map((term) => (
                  <Card
                    key={term.id}
                    id={term.id}
                    className="scroll-mt-6 border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-base text-blue-800 font-bold leading-tight">
                          {term.title}
                        </CardTitle>
                        {term.trend === 'up' && (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0 text-[10px]"
                          >
                            <TrendingUp className="w-3 h-3 mr-1" /> Maior melhor
                          </Badge>
                        )}
                        {term.trend === 'down' && (
                          <Badge
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200 shrink-0 text-[10px]"
                          >
                            <TrendingDown className="w-3 h-3 mr-1" /> Menor melhor
                          </Badge>
                        )}
                        {term.trend === 'neutral' && (
                          <Badge
                            variant="outline"
                            className="bg-slate-100 text-slate-600 border-slate-200 shrink-0 text-[10px]"
                          >
                            <Target className="w-3 h-3 mr-1" /> Referência
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm flex-1 flex flex-col justify-between">
                      <div>
                        <strong className="text-slate-700 block text-xs uppercase mb-0.5">
                          O que é
                        </strong>
                        <p className="text-slate-600 leading-relaxed text-[13px]">
                          {term.definition}
                        </p>
                      </div>

                      <div className="space-y-3 mt-3">
                        <div className="bg-slate-50 p-2.5 rounded-sm border border-slate-100">
                          <strong className="text-slate-700 flex items-center gap-1.5 text-xs uppercase mb-1">
                            <Calculator className="w-3.5 h-3.5 text-slate-400" /> Como calcular
                          </strong>
                          <p className="text-slate-600 font-mono text-[11px] break-words">
                            {term.calculation}
                          </p>
                        </div>

                        <div>
                          <strong className="text-slate-700 block text-xs uppercase mb-0.5">
                            Visão Estratégica
                          </strong>
                          <p className="text-slate-600 leading-relaxed italic text-[12px]">
                            {term.reference}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
