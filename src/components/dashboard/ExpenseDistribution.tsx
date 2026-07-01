import { useFinanceStore } from '@/stores/financeStore'
import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useKpiMetrics } from '@/components/dashboard/KpiCards'

const FIXA_LABELS: Record<string, string> = {
  prolabore: 'Pró-labore',
  pessoal: 'Pessoal',
  infraestrutura: 'Infraestrutura',
  operacional_administrativo: 'Operacional/Admin',
  softwares_assinaturas: 'Softwares/Ass.',
  utilidades: 'Utilidades',
  servicos_profissionais: 'Serviços Prof.',
  seguros: 'Seguros',
  financeiro: 'Financeiro',
  marketing: 'Marketing',
  juros_multas: 'Juros/Multas',
  manutencao_equipamentos: 'Manutenção Equip.',
  educacao_treinamentos: 'Educação/Trein.',
  outros: 'Outros',
}

const VARIAVEL_LABELS: Record<string, string> = {
  materia_prima: 'Matéria-prima',
  embalagens: 'Embalagens',
  medicamentos_drogaria: 'Medicamentos',
  impostos: 'Impostos',
  taxas_cartao: 'Taxas Cartão',
  logistica: 'Logística',
  fidelidade_promocao: 'Fidelidade/Promo',
  outros: 'Outros',
}

const COLORS = [
  '#f97316',
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#f43f5e',
  '#eab308',
  '#06b6d4',
  '#14b8a6',
]

export function ExpenseDistribution() {
  const { filteredTransactions, filters } = useFinanceStore()
  const kpiMetrics = useKpiMetrics()

  const {
    pctFixa,
    pctVariavel,
    pctLucro,
    cfaTotal,
    varExpenses,
    lucroTotal,
    receitasTotal,
    fixasData,
    variaveisData,
  } = useMemo(() => {
    let cfaTotal = 0
    let varExpenses = 0
    const fixasMap: Record<string, number> = {}
    const variaveisMap: Record<string, number> = {}

    const targetStatuses = filters?.statuses?.length > 0 ? filters.statuses : ['REALIZADO']

    ;(filteredTransactions || []).forEach((t) => {
      if (t.type === 'EXPENSE' && targetStatuses.includes(t.status)) {
        if (
          t.categoryId === 'FIXA' ||
          String(t.category).toUpperCase() === 'FIXA' ||
          String(t.category).toUpperCase() === 'DESPESAS FIXAS' ||
          String(t.category).toUpperCase() === 'CUSTO FIXO'
        ) {
          cfaTotal += t.amount
          const sub = t.subcategoryId || 'outros'
          fixasMap[sub] = (fixasMap[sub] || 0) + t.amount
        }
        if (
          t.categoryId === 'VARIAVEL' ||
          String(t.category).toUpperCase() === 'VARIAVEL' ||
          String(t.category).toUpperCase() === 'DESPESAS VARIÁVEIS' ||
          String(t.category).toUpperCase() === 'CUSTO VARIÁVEL' ||
          String(t.category).toUpperCase() === 'VARIAVEIS'
        ) {
          varExpenses += t.amount
          const sub = t.subcategoryId || 'outros'
          variaveisMap[sub] = (variaveisMap[sub] || 0) + t.amount
        }
      }
    })

    const receitasTotal = kpiMetrics.receitas
    const lucroTotal = kpiMetrics.lucro

    const base = receitasTotal > 0 ? receitasTotal : 1

    const fixasData = Object.entries(fixasMap)
      .map(([key, value]) => ({
        name: FIXA_LABELS[key] || key,
        value,
      }))
      .sort((a, b) => b.value - a.value)

    const variaveisData = Object.entries(variaveisMap)
      .map(([key, value]) => ({
        name: VARIAVEL_LABELS[key] || key,
        value,
      }))
      .sort((a, b) => b.value - a.value)

    return {
      cfaTotal,
      varExpenses,
      lucroTotal,
      receitasTotal,
      pctFixa: receitasTotal > 0 ? (cfaTotal / base) * 100 : 0,
      pctVariavel: receitasTotal > 0 ? (varExpenses / base) * 100 : 0,
      pctLucro: receitasTotal > 0 && lucroTotal > 0 ? (lucroTotal / base) * 100 : 0,
      fixasData,
      variaveisData,
    }
  }, [filteredTransactions, filters, kpiMetrics])

  if (receitasTotal === 0 && cfaTotal === 0 && varExpenses === 0) return null

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="bg-white p-4 rounded-sm border shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
          Distribuição de Despesas e Lucro Líquido Real
        </h3>
      </div>

      <div>
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-100 mb-3 shadow-inner">
          <div
            style={{ width: `${pctFixa}%` }}
            className="bg-orange-400 transition-all duration-500"
            title={`Fixas: ${pctFixa.toFixed(1)}%`}
          />
          <div
            style={{ width: `${pctVariavel}%` }}
            className="bg-emerald-400 transition-all duration-500"
            title={`Variáveis: ${pctVariavel.toFixed(1)}%`}
          />
          <div
            style={{ width: `${pctLucro}%` }}
            className="bg-blue-500 transition-all duration-500"
            title={`Lucro Líquido: ${pctLucro.toFixed(1)}%`}
          />
        </div>
        <div className="flex justify-between items-center px-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium uppercase mb-0.5">
              <div className="w-2 h-2 rounded-sm bg-orange-400" />
              Fixas (≤ 40%)
            </div>
            <span className="font-bold text-orange-600 text-sm leading-none">
              {formatCurrency(cfaTotal)}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">{pctFixa.toFixed(1)}%</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium uppercase mb-0.5">
              <div className="w-2 h-2 rounded-sm bg-emerald-400" />
              Variáveis (≤ 45%)
            </div>
            <span className="font-bold text-emerald-600 text-sm leading-none">
              {formatCurrency(varExpenses)}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">{pctVariavel.toFixed(1)}%</span>
          </div>

          <div className="flex flex-col text-right items-end">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium uppercase mb-0.5">
              Lucro Líquido (≥ 15%)
              <div className="w-2 h-2 rounded-sm bg-blue-500" />
            </div>
            <span
              className={
                lucroTotal >= 0
                  ? 'font-bold text-blue-600 text-sm leading-none'
                  : 'font-bold text-red-600 text-sm leading-none'
              }
            >
              {formatCurrency(lucroTotal)}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">
              {receitasTotal > 0 ? ((lucroTotal / receitasTotal) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-4 pt-4 border-t border-slate-100 overflow-x-auto w-full">
        {fixasData.length > 0 && (
          <div className="flex-1 flex flex-col min-w-[250px]">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 text-center">
              Detalhamento Fixas
            </h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fixasData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat('pt-BR', {
                        notation: 'compact',
                        compactDisplay: 'short',
                      }).format(value)
                    }
                    tick={{ fontSize: 10 }}
                    width={45}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {fixasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {variaveisData.length > 0 && (
          <div className="flex-1 flex flex-col min-w-[250px]">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 text-center">
              Detalhamento Variáveis
            </h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={variaveisData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat('pt-BR', {
                        notation: 'compact',
                        compactDisplay: 'short',
                      }).format(value)
                    }
                    tick={{ fontSize: 10 }}
                    width={45}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {variaveisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
