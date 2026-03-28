import { useFinanceStore } from '@/stores/financeStore'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, HelpCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Transaction } from '@/types/finance'

export function PricingAssistant() {
  const { monthlyMetrics, transactions } = useFinanceStore()
  const [cost, setCost] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [tipoFormula, setTipoFormula] = useState<'capsulas' | 'dermato'>('capsulas')

  const stats = useMemo(() => {
    // 1. Calcula a janela de 3 meses fechados (ignorando o mês atual)
    const now = new Date()
    const last3Months = Array.from({ length: 3 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (i + 1), 1)
      return { month: d.getMonth() + 1, year: d.getFullYear() }
    })

    const isTxInTarget = (tx: Transaction, targets: { month: number; year: number }[]) => {
      const txDate = tx.date.includes('T') ? new Date(tx.date) : new Date(`${tx.date}T12:00:00Z`)
      const m = txDate.getMonth() + 1
      const y = txDate.getFullYear()
      return targets.some((t) => t.month === m && t.year === y)
    }

    // 2. Filtra os dados históricos consolidados
    let historyMetrics = monthlyMetrics.filter((m) =>
      last3Months.some((t) => t.month === m.month && t.year === m.year),
    )
    let historyTx = transactions.filter((t) => isTxInTarget(t, last3Months))

    let isUsingFallback = false
    // Fallback: Se não houver dados nos últimos 3 meses (ex: cliente novo), utiliza os dados atuais disponíveis
    if (historyMetrics.length === 0 && historyTx.length === 0) {
      historyMetrics = monthlyMetrics
      historyTx = transactions
      isUsingFallback = true
    }

    let cfaTotal = 0
    let varExpOperacional = 0

    historyTx.forEach((t) => {
      if (t.type === 'EXPENSE' && t.status === 'REALIZADO') {
        if (t.categoryId === 'FIXA') cfaTotal += t.amount
        if (t.categoryId === 'VARIAVEL') {
          if (
            t.subcategoryId !== 'materia_prima' &&
            t.subcategoryId !== 'embalagens' &&
            t.subcategoryId !== 'medicamentos_drogaria'
          ) {
            varExpOperacional += t.amount
          }
        }
      }
    })

    const vendas_caps = historyMetrics.reduce((sum, m) => sum + (m.vendas_capsulas || 0), 0)
    const vendas_derm = historyMetrics.reduce((sum, m) => sum + (m.vendas_dermato || 0), 0)
    const n_caps = historyMetrics.reduce((sum, m) => sum + (m.num_formulas_capsulas || 0), 0)
    const n_derm = historyMetrics.reduce((sum, m) => sum + (m.num_formulas_dermato || 0), 0)
    const mpemb_caps = historyMetrics.reduce((sum, m) => sum + (m.custo_mp_emb_capsulas || 0), 0)
    const mpemb_derm = historyMetrics.reduce((sum, m) => sum + (m.custo_mp_emb_dermato || 0), 0)

    const vendas_totais = vendas_caps + vendas_derm
    const formulasTotais = n_caps + n_derm
    const custoOperacionalTotal = cfaTotal + varExpOperacional

    const n_grupo = tipoFormula === 'capsulas' ? n_caps : n_derm
    const vendas_grupo = tipoFormula === 'capsulas' ? vendas_caps : vendas_derm
    const mpemb_grupo = tipoFormula === 'capsulas' ? mpemb_caps : mpemb_derm

    // 3. Rateio do Custo Fixo específico por Setor (Baseado na representatividade de receita)
    let peso_setor = 0.5 // Padrão equilibrado
    if (vendas_totais > 0) {
      peso_setor = vendas_grupo / vendas_totais
    } else if (formulasTotais > 0) {
      peso_setor = n_grupo / formulasTotais
    }

    const custoOperacionalSetor = custoOperacionalTotal * peso_setor
    const precoMinimoPorFormula =
      n_grupo > 0
        ? custoOperacionalSetor / n_grupo
        : formulasTotais > 0
          ? custoOperacionalTotal / formulasTotais
          : 0

    const precoMedioIdeal = n_grupo > 0 ? vendas_grupo / n_grupo : 0
    const mkpMultiplicador = mpemb_grupo > 0 ? vendas_grupo / mpemb_grupo : 0
    const custoMedioInsumo = n_grupo > 0 ? mpemb_grupo / n_grupo : 0

    return {
      precoMinimoPorFormula,
      precoMedioIdeal,
      mkpMultiplicador,
      custoMedioInsumo,
      isUsingFallback,
    }
  }, [monthlyMetrics, transactions, tipoFormula])

  const numericCost = parseFloat(cost) || 0
  const numericSell = parseFloat(sellPrice) || 0

  const isTestingPrice = numericSell > 0
  const hasCost = numericCost > 0

  const mkpAlvo = stats.mkpMultiplicador > 0 ? stats.mkpMultiplicador : 5.75
  let mkpDinamico = mkpAlvo
  if (numericCost > 0 && stats.custoMedioInsumo > 0) {
    // Curva elástica: (Custo Médio / Custo Atual) ^ 0.5
    // Garante que custo alto = menor markup, custo baixo = maior markup
    mkpDinamico = mkpAlvo * Math.pow(stats.custoMedioInsumo / numericCost, 0.5)
    // Limites de segurança razoáveis (piso de markup marginal)
    mkpDinamico = Math.max(2.5, Math.min(mkpDinamico, 15.0))
  }

  const pisoSeguranca = hasCost
    ? numericCost + stats.precoMinimoPorFormula
    : stats.precoMinimoPorFormula
  const precoSugeridoBase = hasCost ? numericCost * mkpDinamico : 0
  const precoSugerido = hasCost ? Math.max(precoSugeridoBase, pisoSeguranca) : 0

  const isHittingFloor = hasCost && pisoSeguranca > precoSugeridoBase
  const suggestedIsHealthy = !isHittingFloor

  const praticadoStatus = useMemo(() => {
    if (!isTestingPrice) return 'neutral'
    if (numericSell >= precoSugerido) return 'ideal'
    if (numericSell >= pisoSeguranca) return 'warning'
    return 'danger'
  }, [numericSell, precoSugerido, pisoSeguranca, isTestingPrice])

  return (
    <Card className="rounded-sm shadow-sm w-full flex flex-col justify-center border-t-4 border-t-blue-500 bg-gradient-to-br from-white to-blue-50/30 h-full min-h-[140px] relative">
      <CardContent className="p-3 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-blue-700">
            <Calculator className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1">
              Assistente de Precificação
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/glossario#assistente-precificacao">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400 hover:text-blue-600 cursor-pointer" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="max-w-[280px] text-center" side="bottom">
                  <p className="text-xs mb-1">
                    Sugere o preço usando <b>Markup Dinâmico</b> (inversamente proporcional ao custo
                    do insumo), sempre respeitando o Piso de Segurança.
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Baseado no histórico consolidado{' '}
                    {stats.isUsingFallback ? '(Dados Atuais)' : '(Últimos 3 meses fechados)'}.
                  </p>
                </TooltipContent>
              </Tooltip>
            </h3>
          </div>

          <Select value={tipoFormula} onValueChange={(val: any) => setTipoFormula(val)}>
            <SelectTrigger className="h-6 w-[100px] text-[10px] bg-white border-blue-200 text-blue-800 focus:ring-1 focus:ring-blue-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="capsulas" className="text-xs">
                Cápsulas
              </SelectItem>
              <SelectItem value="dermato" className="text-xs">
                Dermato
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">
                Custo (MP+Emb)
              </Label>
              <div className="relative">
                <span className="absolute left-2 top-1.5 text-xs text-slate-500 font-medium">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  className="h-7 text-xs pl-7 bg-white shadow-inner focus-visible:ring-blue-400"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex-1">
              <Label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">
                Preço Praticado
              </Label>
              <div className="relative">
                <span
                  className={cn(
                    'absolute left-2 top-1.5 text-xs font-medium',
                    isTestingPrice
                      ? praticadoStatus === 'ideal'
                        ? 'text-emerald-600'
                        : praticadoStatus === 'warning'
                          ? 'text-amber-600'
                          : 'text-red-600'
                      : 'text-slate-500',
                  )}
                >
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  className={cn(
                    'h-7 text-xs pl-7 shadow-inner transition-colors',
                    isTestingPrice
                      ? praticadoStatus === 'ideal'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 focus-visible:ring-emerald-400'
                        : praticadoStatus === 'warning'
                          ? 'bg-amber-50 border-amber-300 text-amber-700 focus-visible:ring-amber-400'
                          : 'bg-red-50 border-red-300 text-red-700 focus-visible:ring-red-400'
                      : 'bg-white focus-visible:ring-blue-400',
                  )}
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              className={cn(
                'flex flex-col p-2 rounded-sm border shadow-sm transition-colors',
                hasCost
                  ? suggestedIsHealthy
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                  : 'bg-white border-blue-100',
              )}
            >
              <Label
                className={cn(
                  'text-[9px] uppercase tracking-wider flex items-center gap-1',
                  hasCost
                    ? suggestedIsHealthy
                      ? 'text-emerald-700'
                      : 'text-red-700'
                    : 'text-blue-600/70',
                )}
              >
                Preço Sugerido
                {hasCost && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 opacity-60 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-center" side="top">
                      <p className="text-xs">
                        {suggestedIsHealthy
                          ? 'Precificação saudável com base na curva elástica de Markup.'
                          : 'Atenção: A curva de Markup geraria um valor abaixo do Piso de Segurança. Preço ajustado para cobrir custos operacionais.'}
                      </p>
                      <p className="text-[10px] mt-1 text-slate-400">
                        Markup elástico alvo: {mkpDinamico.toFixed(2)}x
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </Label>
              <div className="flex items-end justify-between mt-0.5">
                <div>
                  <p
                    className={cn(
                      'text-sm font-bold font-mono tracking-tight leading-none',
                      hasCost
                        ? suggestedIsHealthy
                          ? 'text-emerald-800'
                          : 'text-amber-700'
                        : 'text-blue-700',
                    )}
                  >
                    R$ {precoSugerido.toFixed(2)}
                  </p>
                  {hasCost && (
                    <p
                      className={cn(
                        'text-[8px] mt-1 font-medium',
                        suggestedIsHealthy ? 'text-emerald-600/80' : 'text-amber-600/80',
                      )}
                    >
                      MKP: {mkpDinamico.toFixed(2)}x
                    </p>
                  )}
                </div>
                {hasCost && suggestedIsHealthy && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-0.5" />
                )}
                {hasCost && !suggestedIsHealthy && (
                  <AlertTriangle className="w-4 h-4 text-amber-500 mb-0.5" />
                )}
              </div>
            </div>

            <div
              className={cn(
                'flex flex-col p-2 rounded-sm border shadow-sm transition-colors',
                isTestingPrice && praticadoStatus === 'danger'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white border-slate-200',
              )}
            >
              <Label
                className={cn(
                  'text-[9px] uppercase tracking-wider block',
                  isTestingPrice && praticadoStatus === 'danger'
                    ? 'text-red-700'
                    : 'text-slate-500',
                )}
              >
                Piso de Segurança
              </Label>
              <div className="flex items-center justify-between mt-0.5">
                <p
                  className={cn(
                    'text-sm font-bold font-mono tracking-tight',
                    isTestingPrice && praticadoStatus === 'danger'
                      ? 'text-red-800'
                      : 'text-slate-700',
                  )}
                >
                  R$ {pisoSeguranca.toFixed(2)}
                </p>
                {isTestingPrice && praticadoStatus === 'danger' && (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 relative">
          {stats.isUsingFallback && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200 whitespace-nowrap z-10 opacity-90">
              Usando dados do mês atual (Histórico em formação)
            </div>
          )}
          <div className="text-[9px] text-slate-500 text-center bg-white/50 py-1.5 px-1 rounded border border-blue-100/50 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help flex items-center gap-0.5">
                  MKP Médio: <span className="font-bold text-blue-600">{mkpAlvo.toFixed(2)}x</span>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-center" side="top">
                <p className="text-xs">
                  Markup médio histórico do setor. Usado como base para a curva elástica.
                </p>
              </TooltipContent>
            </Tooltip>
            <span className="text-blue-200 hidden sm:inline">|</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help flex items-center gap-0.5">
                  PM Ideal:{' '}
                  <span className="font-bold text-emerald-600">
                    R$ {stats.precoMedioIdeal.toFixed(2)}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-center" side="top">
                <p className="text-xs">
                  Preço Médio Ideal (Ticket Médio Histórico) do laboratório selecionado.
                </p>
              </TooltipContent>
            </Tooltip>
            <span className="text-blue-200 hidden sm:inline">|</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help flex items-center gap-0.5">
                  Custo Op./Fórm:{' '}
                  <span className="font-bold text-slate-600">
                    R$ {stats.precoMinimoPorFormula.toFixed(2)}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-center" side="top">
                <p className="text-xs">
                  Custo Fixo e Variável do <b>setor</b> rateado por fórmula.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
