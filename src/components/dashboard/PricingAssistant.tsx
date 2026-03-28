import { useFinanceStore } from '@/stores/financeStore'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
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

export function PricingAssistant() {
  const { filteredMonthlyMetrics, filteredTransactions, filters } = useFinanceStore()
  const [cost, setCost] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [tipoFormula, setTipoFormula] = useState<'capsulas' | 'dermato'>('capsulas')

  const { mkpAlvo, custoFixoPorFormula } = useMemo(() => {
    let cfaTotal = 0
    let varExpOperacional = 0

    const targetStatuses = filters.statuses.length > 0 ? filters.statuses : ['REALIZADO']

    filteredTransactions.forEach((t) => {
      if (t.type === 'EXPENSE' && targetStatuses.includes(t.status)) {
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

    const vendas_caps = filteredMonthlyMetrics.reduce((sum, m) => sum + (m.vendas_capsulas || 0), 0)
    const vendas_derm = filteredMonthlyMetrics.reduce((sum, m) => sum + (m.vendas_dermato || 0), 0)
    const n_caps = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m.num_formulas_capsulas || 0),
      0,
    )
    const n_derm = filteredMonthlyMetrics.reduce((sum, m) => sum + (m.num_formulas_dermato || 0), 0)
    const mpemb_caps = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m.custo_mp_emb_capsulas || 0),
      0,
    )
    const mpemb_derm = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m.custo_mp_emb_dermato || 0),
      0,
    )

    const vendasTotais = vendas_caps + vendas_derm
    const pesoGrupo =
      vendasTotais > 0 ? (tipoFormula === 'capsulas' ? vendas_caps : vendas_derm) / vendasTotais : 0

    const cf_rateado = cfaTotal * pesoGrupo
    const var_rateado = varExpOperacional * pesoGrupo

    const n_grupo = tipoFormula === 'capsulas' ? n_caps : n_derm
    const mpemb_grupo = tipoFormula === 'capsulas' ? mpemb_caps : mpemb_derm

    const custoFixoTotalGrupo = cf_rateado + var_rateado
    const custoTotalGrupo = custoFixoTotalGrupo + mpemb_grupo

    const markUpAlvo = mpemb_grupo > 0 ? custoTotalGrupo / mpemb_grupo : 0
    const custoFixoForm = n_grupo > 0 ? custoFixoTotalGrupo / n_grupo : 0

    return {
      mkpAlvo: markUpAlvo,
      custoFixoPorFormula: custoFixoForm,
    }
  }, [filteredMonthlyMetrics, filteredTransactions, filters, tipoFormula])

  useEffect(() => {
    const numericCost = parseFloat(cost)
    if (!isNaN(numericCost) && numericCost > 0) {
      const suggested = Math.max(numericCost * mkpAlvo, numericCost + custoFixoPorFormula)
      setSellPrice(suggested.toFixed(2))
    }
  }, [mkpAlvo, custoFixoPorFormula])

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCost(val)
    const numericCost = parseFloat(val)
    if (!isNaN(numericCost) && numericCost > 0) {
      const suggested = Math.max(numericCost * mkpAlvo, numericCost + custoFixoPorFormula)
      setSellPrice(suggested.toFixed(2))
    } else {
      setSellPrice('')
    }
  }

  const numericSell = parseFloat(sellPrice)
  const numericCost = parseFloat(cost)
  const isTestingPrice = !isNaN(numericSell) && numericSell > 0
  const hasCost = !isNaN(numericCost) && numericCost > 0

  const pisoSeguranca = hasCost ? numericCost + custoFixoPorFormula : custoFixoPorFormula
  const precoSugeridoBase = hasCost ? numericCost * mkpAlvo : 0
  const precoSugerido = hasCost ? Math.max(precoSugeridoBase, pisoSeguranca) : 0

  const status = useMemo(() => {
    if (!isTestingPrice) return 'neutral'
    if (numericSell >= precoSugerido) return 'ideal'
    if (numericSell >= pisoSeguranca) return 'warning'
    return 'danger'
  }, [numericSell, precoSugerido, pisoSeguranca, isTestingPrice])

  return (
    <Card className="rounded-sm shadow-sm w-full flex flex-col justify-center border-t-4 border-t-blue-500 bg-gradient-to-br from-white to-blue-50/30 h-full min-h-[140px]">
      <CardContent className="p-3 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-blue-700">
            <Calculator className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1">
              Assistente de Precificação (Mark-up Alvo)
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/glossario#assistente-precificacao">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400 hover:text-blue-600 cursor-pointer" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px] text-center" side="bottom">
                  <p className="text-xs">
                    Calcula o preço sugerido pelo Mark-up Alvo, garantindo que nunca seja menor que
                    o Piso de Segurança (Custo MP/Emb + Custo Fixo).
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
                  onChange={handleCostChange}
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
                      ? status === 'ideal'
                        ? 'text-emerald-600'
                        : status === 'warning'
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
                      ? status === 'ideal'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 focus-visible:ring-emerald-400'
                        : status === 'warning'
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
                isTestingPrice
                  ? status === 'ideal'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-white border-blue-100'
                  : 'bg-white border-blue-100',
              )}
            >
              <Label
                className={cn(
                  'text-[9px] uppercase tracking-wider block',
                  isTestingPrice && status === 'ideal' ? 'text-emerald-700' : 'text-blue-600/70',
                )}
              >
                Preço Sugerido (Alvo)
              </Label>
              <div className="flex items-center justify-between mt-0.5">
                <p
                  className={cn(
                    'text-sm font-bold font-mono tracking-tight',
                    isTestingPrice && status === 'ideal' ? 'text-emerald-800' : 'text-blue-700',
                  )}
                >
                  R$ {precoSugerido.toFixed(2)}
                </p>
                {isTestingPrice && status === 'ideal' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </div>
            </div>

            <div
              className={cn(
                'flex flex-col p-2 rounded-sm border shadow-sm transition-colors',
                isTestingPrice
                  ? status === 'danger'
                    ? 'bg-red-50 border-red-200'
                    : status === 'warning'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-white border-slate-200'
                  : 'bg-white border-slate-200',
              )}
            >
              <Label
                className={cn(
                  'text-[9px] uppercase tracking-wider block',
                  isTestingPrice
                    ? status === 'danger'
                      ? 'text-red-700'
                      : status === 'warning'
                        ? 'text-amber-700'
                        : 'text-slate-500'
                    : 'text-slate-500',
                )}
              >
                Piso de Segurança
              </Label>
              <div className="flex items-center justify-between mt-0.5">
                <p
                  className={cn(
                    'text-sm font-bold font-mono tracking-tight',
                    isTestingPrice
                      ? status === 'danger'
                        ? 'text-red-800'
                        : status === 'warning'
                          ? 'text-amber-800'
                          : 'text-slate-700'
                      : 'text-slate-700',
                  )}
                >
                  R$ {pisoSeguranca.toFixed(2)}
                </p>
                {isTestingPrice && status === 'danger' && (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-[9px] text-slate-500 text-center bg-white/50 py-1 rounded border border-blue-100/50 flex justify-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">
                Mark-up Alvo Setor:{' '}
                <span className="font-bold text-blue-600">{mkpAlvo.toFixed(2)}x</span>
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px] text-center" side="top">
              <p className="text-xs">
                Multiplicador histórico necessário para cobrir todos os custos neste setor.
              </p>
            </TooltipContent>
          </Tooltip>
          <span className="text-blue-200">|</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">
                Custo Fixo/Fórmula:{' '}
                <span className="font-bold text-slate-600">
                  R$ {custoFixoPorFormula.toFixed(2)}
                </span>
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px] text-center" side="top">
              <p className="text-xs">
                Custos operacionais rateados pelo número de fórmulas. Compõe o Piso de Segurança.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  )
}
