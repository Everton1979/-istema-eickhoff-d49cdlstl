import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, TrendingUp, TrendingDown, Target, Calculator } from 'lucide-react'

const GLOSSARY_TERMS = [
  // --- CAIXA E INDICADORES GERAIS ---
  {
    id: 'receitas-operacionais',
    title: 'Receitas Operacionais',
    category: 'Caixa e Geral',
    definition: 'Total de entradas financeiras registradas como "Receita" no período.',
    calculation:
      'Soma de todas as transações com tipo "Receita" e status "Realizado". Exemplo: Vendas na Conta Sicredi de R$ 10.000.',
    reference:
      'Quanto maior, melhor. Representa o faturamento bruto que efetivamente entrou no caixa da empresa.',
    trend: 'up',
  },
  {
    id: 'despesas-e-custos',
    title: 'Despesas e Custos',
    category: 'Caixa e Geral',
    definition: 'Soma de todas as saídas de caixa, incluindo custos fixos e variáveis.',
    calculation: 'Soma de todas as transações com tipo "Despesa" e status "Realizado".',
    reference:
      'Quanto menor, melhor (dentro da normalidade operacional). Deve-se acompanhar o crescimento em relação à receita.',
    trend: 'down',
  },
  {
    id: 'margem-de-contribuicao',
    title: 'Margem de Contribuição',
    category: 'Caixa e Geral',
    definition:
      'O valor que sobra da receita bruta após subtrair os custos variáveis operacionais e os insumos (matéria-prima + embalagens). É o que contribui para pagar as despesas fixas e gerar lucro.',
    calculation:
      'Receitas - (Custos Variáveis Operacionais + Custo de Insumos). Ex: Se receita = R$ 10.000 e Custos var/insumos = R$ 4.000, Margem = R$ 6.000. (Nota: No fechamento mensal, os custos de insumos já integram Matéria-Prima e Embalagens juntos).',
    reference:
      'Quanto maior, melhor. Margens positivas e robustas indicam que a operação consegue cobrir o custo fixo mais rapidamente.',
    trend: 'up',
  },
  {
    id: 'lucro-liquido',
    title: 'Lucro Líquido (Caixa)',
    category: 'Caixa e Geral',
    definition: 'Resultado final de caixa no período analisado.',
    calculation: 'Receitas Totais - Despesas Totais.',
    reference:
      'Quanto maior, melhor. Indica se a empresa gerou caixa excedente após pagar todas as obrigações no período.',
    trend: 'up',
  },
  {
    id: 'ponto-de-equilibrio',
    title: 'Ponto de Equilíbrio (YTD / Período)',
    category: 'Caixa e Geral',
    definition:
      'O faturamento necessário para cobrir exatamente todos os custos (fixos e variáveis). É o famoso "zero a zero".',
    calculation: 'Custos Fixos / Índice de Margem de Contribuição.',
    reference:
      'Quanto menor o faturamento necessário para atingir o ponto de equilíbrio, mais segura e menos dependente de grandes volumes é a operação.',
    trend: 'down',
  },

  // --- LABORATÓRIO E PERFORMANCE ---
  {
    id: 'ticket-medio',
    title: 'Ticket Médio',
    category: 'Métricas de Performance',
    definition: 'Valor médio de venda gerado por cada pedido no sistema.',
    calculation: 'Faturamento Total (Sistema) / Número de Pedidos.',
    reference:
      'Quanto maior, melhor. Um ticket médio alto significa que o cliente gasta mais em cada compra, otimizando o esforço de atendimento e vendas.',
    trend: 'up',
  },
  {
    id: 'fator-medio',
    title: 'Fator Médio',
    category: 'Métricas de Performance',
    definition:
      'Relação que indica quantas vezes o faturamento supera o custo direto de insumos (matéria-prima + embalagens).',
    calculation:
      'Faturamento Total (Sistema) / (Custo de Matéria-Prima + Custo de Embalagem). (Nota: No fechamento mensal, estes valores já são informados juntos).',
    reference:
      'Quanto maior, melhor. Um bom fator médio fica entre 5,0 e 6,5, dependendo do mix de produtos (cosméticos vs medicamentos).',
    trend: 'up',
  },
  {
    id: 'cfa-total',
    title: 'CFA Total (Custos Fixos Administrativos)',
    category: 'Métricas de Performance',
    definition:
      'Soma de todas as despesas que não variam diretamente com a quantidade produzida (ex: aluguel, salários, contador, energia básica).',
    calculation: 'Soma de todas as transações financeiras categorizadas como "Fixa".',
    reference:
      'Quanto menor, melhor. Manter o CFA controlado é o principal fator para reduzir o risco do seu Ponto de Equilíbrio. O ideal é que seja menor que 35%.',
    trend: 'down',
  },
  {
    id: 'custo-variavel',
    title: 'Custos Variáveis',
    category: 'Métricas de Performance',
    definition:
      'Soma de todas as despesas que variam diretamente de acordo com o volume de produção ou vendas (ex: impostos, taxas de cartão, comissões).',
    calculation: 'Soma de todas as transações financeiras categorizadas como "Variável".',
    reference:
      'Quanto menor, melhor. O ideal é que seja menor que 40% para garantir uma margem de contribuição saudável.',
    trend: 'down',
  },
  {
    id: 'custo-fixo-formula',
    title: 'Custo Fixo por Fórmula',
    category: 'Métricas de Performance',
    definition:
      'Indica qual é o "peso" do custo fixo que cada fórmula manipulada precisa pagar para manter a farmácia aberta.',
    calculation: 'CFA Total / Número de Pedidos.',
    reference:
      'Quanto menor, melhor. Produzir um volume maior de fórmulas ajuda a "diluir" o custo fixo, reduzindo este indicador.',
    trend: 'down',
  },
  {
    id: 'preco-min-formula',
    title: 'Preço Mínimo por Fórmula',
    category: 'Métricas de Performance',
    definition:
      'O ponto de equilíbrio unitário. É o valor mínimo médio pelo qual cada fórmula deve ser vendida para não gerar prejuízo à operação.',
    calculation:
      '(CFA Total + Despesas Variáveis Operacionais + [Custo Matéria Prima + Custo Embalagem]) / Número de Pedidos. (Nota: Os custos de MP e Embalagens já estão agrupados no fechamento).',
    reference:
      'Indicador de balizamento. Quanto menor, mais eficiente é o laboratório. Suas vendas devem sempre ter um ticket médio superior a este valor.',
    trend: 'neutral',
  },
  {
    id: 'markup-divisor',
    title: 'Mark-up Divisor',
    category: 'Métricas de Performance',
    definition:
      'Índice que representa a proporção do custo direto em relação ao custo total no ponto de equilíbrio.',
    calculation: 'Custo de Insumos (MP + EMB) / Custos Totais.',
    reference:
      'Quanto menor o divisor, maior o multiplicador necessário para cobrir todos os custos da operação.',
    trend: 'neutral',
  },
  {
    id: 'markup-mult',
    title: 'Mark-up Multiplicador',
    category: 'Métricas de Performance',
    definition:
      'Fator aplicado sobre o custo direto (MP + Embalagem) para encontrar o preço de venda de Ponto de Equilíbrio.',
    calculation: '1 / Mark-up Divisor (ou Custos Totais / Custo MP).',
    reference:
      'Valor ideal para balizar o preço mínimo. Vender abaixo deste fator significa operar em prejuízo.',
    trend: 'neutral',
  },
  {
    id: 'markup-realizado',
    title: 'Mark-up Praticado',
    category: 'Métricas de Performance',
    definition:
      'Multiplicador efetivamente realizado pela farmácia no período, considerando as vendas totais e os custos de insumos.',
    calculation: 'Faturamento Total / Custo de Insumos (MP + EMB).',
    reference:
      'Deve ser sempre superior ao Mark-up Alvo (P.E.). Quanto maior a diferença, maior o lucro da operação.',
    trend: 'up',
  },

  // --- FERRAMENTAS ---
  {
    id: 'monitor-ponto-equilibrio',
    title: 'Monitor Ponto de Equilíbrio',
    category: 'Ferramentas do Dashboard',
    definition:
      'Gráfico visual de acompanhamento da receita acumulada (realizada) em relação ao que é exigido para pagar todas as contas.',
    calculation: '(Receita Atual / Ponto de Equilíbrio) * 100.',
    reference:
      'A barra deve sempre ultrapassar os 100%. Valores abaixo de 100% significam que a operação rodou em prejuízo de caixa no período.',
    trend: 'neutral',
  },
  {
    id: 'assistente-precificacao',
    title: 'Assistente de Precificação',
    category: 'Ferramentas do Dashboard',
    definition:
      'Calculadora que utiliza o Mark-up Multiplicador real da sua operação para sugerir o preço de Ponto de Equilíbrio.',
    calculation: 'Custo Informado (MP + Embalagem) * Mark-up Multiplicador.',
    reference:
      'Ferramenta para garantir que orçamentos não sejam vendidos abaixo do custo operacional mínimo da farmácia.',
    trend: 'neutral',
  },
]

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

  const categories = Array.from(new Set(GLOSSARY_TERMS.map((t) => t.category)))

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-md shadow-md border overflow-hidden animate-fade-in print:hidden">
      <DashboardHeader />

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#f1f5f9]">
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
          <div className="flex flex-col items-center justify-center text-center space-y-2 mb-8 mt-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Glossário de Indicadores</h1>
            <p className="text-slate-500 max-w-2xl">
              Entenda exatamente o que cada métrica do seu sistema significa, como ela é calculada e
              qual a referência ideal para garantir a saúde financeira do seu laboratório.
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
                    className="scroll-mt-6 border-slate-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base text-blue-800 font-bold leading-tight">
                          {term.title}
                        </CardTitle>
                        {term.trend === 'up' && (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0"
                          >
                            <TrendingUp className="w-3 h-3 mr-1" /> Maior melhor
                          </Badge>
                        )}
                        {term.trend === 'down' && (
                          <Badge
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200 shrink-0"
                          >
                            <TrendingDown className="w-3 h-3 mr-1" /> Menor melhor
                          </Badge>
                        )}
                        {term.trend === 'neutral' && (
                          <Badge
                            variant="outline"
                            className="bg-slate-100 text-slate-600 border-slate-200 shrink-0"
                          >
                            <Target className="w-3 h-3 mr-1" /> Referência
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <strong className="text-slate-700 block text-xs uppercase mb-0.5">
                          O que é
                        </strong>
                        <p className="text-slate-600 leading-relaxed">{term.definition}</p>
                      </div>

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
                        <p className="text-slate-600 leading-relaxed italic text-[13px]">
                          {term.reference}
                        </p>
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
