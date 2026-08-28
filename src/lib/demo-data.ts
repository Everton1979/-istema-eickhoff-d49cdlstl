import { Transaction, MonthlyMetric, Account } from '@/types/finance'

export interface DemoPharmacyData {
  companyName: string
  transactions: Transaction[]
  monthlyMetrics: MonthlyMetric[]
  accounts: Account[]
}

export function generateDemoData(): DemoPharmacyData {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12

  // Generate 6 months of metrics and transactions leading up to currentMonth of currentYear
  const monthlyMetrics: MonthlyMetric[] = []
  const transactions: Transaction[] = []

  // Realistic baseline parameters for a successful compounding pharmacy (Farmácia Magistral)
  // ~140.000 to 180.000 revenue per month
  // Capsulas: ~1.100 - 1.350 formulas, R$ 85.000 - 105.000 (avg ticket ~R$ 75-78, MP cost ~R$ 15.000 - 18.000)
  // Dermato: ~900 - 1.100 formulas, R$ 60.000 - 75.000 (avg ticket ~R$ 65-70, MP cost ~R$ 11.000 - 14.000)
  // Revenda: R$ 15.000 - 22.000 (cost ~R$ 7.500 - 11.000)
  // Total sales: ~R$ 160.000 - 200.000
  // Staff: 4 capsulas, 3 dermato, 4 vendas (total 11)

  const monthConfigs = [
    {
      offset: 5, // 5 months ago
      factor: 0.9,
      targetManip: 150000,
      targetRevenda: 18000,
    },
    {
      offset: 4, // 4 months ago
      factor: 0.93,
      targetManip: 155000,
      targetRevenda: 18000,
    },
    {
      offset: 3, // 3 months ago
      factor: 0.96,
      targetManip: 160000,
      targetRevenda: 20000,
    },
    {
      offset: 2, // 2 months ago
      factor: 1.0,
      targetManip: 165000,
      targetRevenda: 20000,
    },
    {
      offset: 1, // 1 month ago
      factor: 1.04,
      targetManip: 170000,
      targetRevenda: 22000,
    },
    {
      offset: 0, // current month
      factor: 1.08,
      targetManip: 175000,
      targetRevenda: 22000,
    },
  ]

  let txIdCounter = 1

  monthConfigs.forEach(({ offset, factor, targetManip, targetRevenda }) => {
    const d = new Date(currentYear, currentMonth - 1 - offset, 1)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const daysInMonth = new Date(y, m, 0).getDate()

    // Monthly metric calculation
    const numCaps = Math.round(1220 * factor)
    const vendasCaps = Math.round(96500 * factor)
    const custoMpCaps = Math.round(17200 * factor)

    const numDerm = Math.round(980 * factor)
    const vendasDerm = Math.round(68500 * factor)
    const custoMpDerm = Math.round(12400 * factor)

    const vendasRev = Math.round(19500 * factor)
    const custoRev = Math.round(9750 * factor)

    const totalSystemSales = vendasCaps + vendasDerm + vendasRev
    const rawMaterialCosts = custoMpCaps + custoMpDerm

    const metric: MonthlyMetric = {
      id: `demo_m_${y}_${m}`,
      month: m,
      year: y,
      orders_count: numCaps + numDerm,
      total_system_sales: totalSystemSales,
      raw_material_costs: rawMaterialCosts,
      sales_target: targetManip + targetRevenda,
      global_sales_target: targetManip + targetRevenda,
      meta_vendas_manipulacao: targetManip,
      meta_vendas_extra: targetRevenda,
      meta_vendas_sistema_manipulacao: targetManip,
      meta_vendas_sistema_revenda: targetRevenda,
      num_formulas_capsulas: numCaps,
      vendas_capsulas: vendasCaps,
      custo_mp_emb_capsulas: custoMpCaps,
      num_formulas_dermato: numDerm,
      vendas_dermato: vendasDerm,
      custo_mp_emb_dermato: custoMpDerm,
      vendas_revenda: vendasRev,
      custo_revenda: custoRev,
      colaboradores_capsulas: 4,
      colaboradores_dermato: 3,
      colaboradores_vendas: 4,
    }
    monthlyMetrics.push(metric)

    // Helper to format ISO date string
    const makeDate = (day: number, hour: number = 12) => {
      const clampedDay = Math.min(day, daysInMonth)
      return new Date(Date.UTC(y, m - 1, clampedDay, hour, 0, 0)).toISOString()
    }

    // Generate balanced financial transactions for this month
    // Incomes across payment methods (Stone, PIX, Dinheiro, PagBank, Banricompras, Banco/Corretora)
    const totalRevenueTarget = totalSystemSales
    const incomes = [
      {
        desc: 'Recebimento Cartões Stone (Crédito/Débito)',
        amount: Math.round(totalRevenueTarget * 0.44),
        pm: 'stone',
        day: 10,
      },
      {
        desc: 'Recebimentos PIX Vendas Balcão e WhatsApp',
        amount: Math.round(totalRevenueTarget * 0.28),
        pm: 'pix',
        day: 15,
      },
      {
        desc: 'Recebimentos Vendas Dinheiro (Balcão)',
        amount: Math.round(totalRevenueTarget * 0.1),
        pm: 'dinheiro',
        day: 20,
      },
      {
        desc: 'Recebimento Cartões PagBank / Link de Pagamento',
        amount: Math.round(totalRevenueTarget * 0.08),
        pm: 'pagbank',
        day: 22,
      },
      {
        desc: 'Recebimentos Banricompras',
        amount: Math.round(totalRevenueTarget * 0.06),
        pm: 'banricompras',
        day: 25,
      },
      {
        desc: 'Transferências / Boletos Bancários e Convênios',
        amount: Math.round(totalRevenueTarget * 0.04),
        pm: 'banco_corretora',
        day: 28,
      },
    ]

    incomes.forEach((inc) => {
      transactions.push({
        id: `demo_tx_${txIdCounter++}`,
        date: makeDate(inc.day),
        description: inc.desc,
        amount: inc.amount,
        type: 'INCOME',
        categoryId: 'RECEITA_OPERACIONAL',
        accountId: 'conta_principal',
        paymentMethodId: inc.pm,
        status: 'REALIZADO',
        tags: 'Receita Operacional',
      })
    })

    // Fixed Expenses (Despesas Fixas) ~32-35% of revenue
    // Pessoal, Pró-labore, Infraestrutura/Aluguel, Utilidades, Softwares, etc.
    const fixedExpenses = [
      {
        desc: 'Folha de Pagamento - Equipe Farmácia e Laboratório',
        sub: 'pessoal',
        amount: Math.round(28500 * factor),
        day: 5,
      },
      {
        desc: 'Encargos Trabalhistas (FGTS / INSS / GPS)',
        sub: 'pessoal',
        amount: Math.round(8200 * factor),
        day: 7,
      },
      {
        desc: 'Pró-labore Sócios e Responsável Técnico',
        sub: 'prolabore',
        amount: Math.round(12000 * factor),
        day: 5,
      },
      {
        desc: 'Aluguel do Imóvel Sede & Laboratórios',
        sub: 'infraestrutura',
        amount: 6800,
        day: 10,
      },
      {
        desc: 'Energia Elétrica (Laboratórios com Climatização e Filtros)',
        sub: 'utilidades',
        amount: Math.round(3450 * factor),
        day: 12,
      },
      {
        desc: 'Licença Software ERP Magistral (Fórmula Certa / Fagron)',
        sub: 'softwares_assinaturas',
        amount: 2150,
        day: 15,
      },
      {
        desc: 'Honorários Contabilidade e Assessoria Farmacêutica',
        sub: 'servicos_profissionais',
        amount: 2400,
        day: 18,
      },
      {
        desc: 'Manutenção Preventiva de Balanças e Calibração Anual',
        sub: 'manutencao_equipamentos',
        amount: 850,
        day: 14,
      },
      {
        desc: 'Marketing Digital, Redes Sociais e Parcerias Médicas',
        sub: 'marketing',
        amount: 2500,
        day: 8,
      },
      {
        desc: 'Telefonia, Internet Fibra e WhatsApp Business API',
        sub: 'utilidades',
        amount: 680,
        day: 11,
      },
      {
        desc: 'Serviços de Limpeza, Controle de Pragas e Descarte de Resíduos',
        sub: 'limpeza_conservacao',
        amount: 920,
        day: 16,
      },
      {
        desc: 'Tarifas Bancárias e Manutenção de Contas',
        sub: 'financeiro',
        amount: 320,
        day: 28,
      },
    ]

    fixedExpenses.forEach((fe) => {
      transactions.push({
        id: `demo_tx_${txIdCounter++}`,
        date: makeDate(fe.day),
        description: fe.desc,
        amount: fe.amount,
        type: 'EXPENSE',
        categoryId: 'FIXA',
        subcategoryId: fe.sub,
        accountId: 'conta_principal',
        status: 'REALIZADO',
        tags: 'Despesa Fixa',
      })
    })

    // Variable Expenses (Despesas Variáveis) ~36-39% of revenue
    // Matéria-prima (Insumos/Ativos), Embalagens, Impostos (Simples Nacional), Taxas Cartão, Logística
    const variableExpenses = [
      {
        desc: 'Fornecedor Galena Química - Ativos Farmacêuticos e Fitoterápicos',
        sub: 'materia_prima',
        amount: Math.round(14800 * factor),
        day: 9,
      },
      {
        desc: 'Fornecedor Fagron - Matérias-Primas e Cápsulas Vazias',
        sub: 'materia_prima',
        amount: Math.round(11200 * factor),
        day: 16,
      },
      {
        desc: 'Fornecedor Embalagens Farmacêuticas e Potes Cosméticos',
        sub: 'embalagens',
        amount: Math.round(3600 * factor),
        day: 13,
      },
      {
        desc: 'Distribuidora Produtos Prontos e Suplementos para Revenda',
        sub: 'medicamentos_drogaria',
        amount: Math.round(9750 * factor),
        day: 17,
      },
      {
        desc: 'DAS - Simples Nacional (Imposto sobre Faturamento)',
        sub: 'impostos',
        amount: Math.round(14200 * factor),
        day: 20,
      },
      {
        desc: 'Taxas Administrativas de Cartões e Adquirentes',
        sub: 'taxas_cartao',
        amount: Math.round(4100 * factor),
        day: 22,
      },
      {
        desc: 'Fretes e Entregas Motoboy / Logística Clientes',
        sub: 'logistica',
        amount: Math.round(2900 * factor),
        day: 24,
      },
      {
        desc: 'Materiais de Consumo Laboratorial (Luvas, Máscaras, Álcool 70)',
        sub: 'materiais_consumo',
        amount: Math.round(1150 * factor),
        day: 19,
      },
    ]

    variableExpenses.forEach((ve) => {
      transactions.push({
        id: `demo_tx_${txIdCounter++}`,
        date: makeDate(ve.day),
        description: ve.desc,
        amount: ve.amount,
        type: 'EXPENSE',
        categoryId: 'VARIAVEL',
        subcategoryId: ve.sub,
        accountId: 'conta_principal',
        status: 'REALIZADO',
        tags: 'Despesa Variável',
      })
    })

    // If current month (offset === 0), add upcoming/pending commitments for today and near future
    if (offset === 0) {
      const todayDate = new Date()
      const todayDay = todayDate.getDate()

      // Overdue commitment (yesterday or few days ago)
      transactions.push({
        id: `demo_tx_overdue_1`,
        date: makeDate(Math.max(1, todayDay - 1)),
        description: 'Fornecedor Florien - Fitoterápicos Padronizados (Boleto)',
        amount: 3450,
        type: 'EXPENSE',
        categoryId: 'VARIAVEL',
        subcategoryId: 'materia_prima',
        accountId: 'conta_principal',
        status: 'VENCIDO',
        tags: 'Atrasado',
      })

      // Due today commitment
      transactions.push({
        id: `demo_tx_today_1`,
        date: makeDate(todayDay),
        description: 'Boleto Embalagens Nobres - Frascos Âmbar e Conta-gotas',
        amount: 1820,
        type: 'EXPENSE',
        categoryId: 'VARIAVEL',
        subcategoryId: 'embalagens',
        accountId: 'conta_principal',
        status: 'PREVISTO',
        tags: 'Vence Hoje',
      })

      // Due today commitment 2
      transactions.push({
        id: `demo_tx_today_2`,
        date: makeDate(todayDay),
        description: 'Manutenção Sistema de Climatização Laboratorial',
        amount: 650,
        type: 'EXPENSE',
        categoryId: 'FIXA',
        subcategoryId: 'manutencao_equipamentos',
        accountId: 'conta_principal',
        status: 'PREVISTO',
        tags: 'Vence Hoje',
      })

      // Upcoming in 5 days
      transactions.push({
        id: `demo_tx_future_1`,
        date: makeDate(Math.min(daysInMonth, todayDay + 5)),
        description: 'DAS - Simples Nacional Período Corrente',
        amount: 15400,
        type: 'EXPENSE',
        categoryId: 'VARIAVEL',
        subcategoryId: 'impostos',
        accountId: 'conta_principal',
        status: 'PREVISTO',
        tags: 'Previsto',
      })
    }
  })

  // Sort transactions in descending date order
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    companyName: 'Farmácia Magistral Modelo (Demo)',
    transactions,
    monthlyMetrics,
    accounts: [
      {
        id: 'conta_principal',
        name: 'Conta Principal (Sicredi / Stone)',
        initialBalance: 45000,
      },
    ],
  }
}
