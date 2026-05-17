import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, TrendingUp, TrendingDown, Target, Calculator, Lightbulb } from 'lucide-react'

const GLOSSARY_TERMS = [
  {
    id: 'assistente-precificacao',
    title: 'Assistente de Precificação',
    definition:
      'Calculadora que utiliza o Mark-up Multiplicador real da sua operação para sugerir o preço de Ponto de Equilíbrio. Nota: O cálculo é baseado na média dos últimos 3 meses.',
    calculation: 'Custo Informado (MP + Embalagem) * Mark-up Multiplicador.',
    example:
      'Se o custo da matéria-prima e embalagem de um creme for R$ 15,00 e o multiplicador dinâmico/ideal da sua farmácia for de 6x, o assistente sugerirá o preço de venda de R$ 90,00.',
    reference:
      'Ferramenta para garantir que orçamentos não sejam vendidos abaixo do custo operacional mínimo da farmácia.',
    category: 'Ferramentas do Dashboard',
    trend: 'neutral',
  },
  {
    id: 'cma',
    title: 'CMA (Custo da Mercadoria Aplicada)',
    definition:
      'Custo efetivo de todos os insumos e matérias-primas que foram de fato utilizados e aplicados nas formulações manipuladas no período. Exclui desperdícios se bem apurado.',
    calculation: 'Valor total dos insumos utilizados na produção.',
    example:
      'Você comprou R$ 10.000 em matéria-prima no mês, mas apenas R$ 8.000 foram efetivamente pesados e consumidos (aplicados) nas fórmulas vendidas. O seu CMA é R$ 8.000.',
    reference:
      'Métrica mais precisa para farmácias de manipulação do que o CMV, pois foca na aplicação exata do insumo na fórmula vendida.',
    category: 'Métricas de Performance',
    trend: 'down',
  },
  {
    id: 'colaboradores-setor',
    title: 'Colaboradores por Setor (Cápsulas, Dermato, Vendas)',
    definition:
      'Número de funcionários alocados diretamente em cada área de produção ou atendimento da farmácia.',
    calculation: 'Entrada manual no fechamento do mês.',
    example:
      'Se a farmácia possui 3 atendentes no balcão e 2 farmacêuticos encapsulando, você lança 3 no setor "Vendas" e 2 na "Produção de Cápsulas". Isso dividirá o faturamento para achar a receita gerada por colaborador.',
    reference:
      'Essencial para medir o Faturamento por Colaborador em cada setor e avaliar a eficiência e necessidade de contratações.',
    category: 'Métricas de Performance',
    trend: 'neutral',
  },
  {
    id: 'cfa-total',
    title: 'CFA Total (Custos Fixos Administrativos)',
    definition:
      'Soma de todas as despesas que não variam diretamente com a quantidade produzida (ex: aluguel, salários, contador, energia básica).',
    calculation: 'Soma de todas as transações financeiras categorizadas como "Fixa".',
    example:
      'A farmácia pagou R$ 5.000 de aluguel, R$ 12.000 de folha de pagamento administrativa e R$ 1.500 de honorários contábeis. O CFA Total do mês fechou em R$ 18.500.',
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
    example:
      'Um prescritor parceiro recebeu 10 amostras grátis. O custo dessas amostras foi de R$ 200 em insumos. Você registra a cortesia de R$ 200 apenas para rastreabilidade, mas esse valor não abaterá o lucro mensal para não corromper a margem operacional.',
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
    calculation: 'CFA Total / Número de Pedidos (ou Fórmulas).',
    example:
      'Seu Custo Fixo Administrativo totalizou R$ 20.000 no mês. Foram produzidas 1.000 fórmulas. R$ 20.000 ÷ 1.000 = R$ 20,00. Ou seja, cada fórmula vendida precisa deixar pelo menos R$ 20 só para pagar a loja.',
    reference:
      'Quanto menor, melhor. Produzir um volume maior de fórmulas ajuda a "diluir" o custo fixo, reduzindo este indicador.',
    category: 'Métricas de Performance',
    trend: 'down',
  },
  {
    id: 'custos-variaveis',
    title: 'Custos Variáveis',
    definition:
      'Soma de todas as despesas que variam diretamente de acordo com o volume de produção ou vendas (ex: impostos, taxas de cartão, comissões, insumos). Agora são a base oficial para o cálculo da Margem de Contribuição.',
    calculation: 'Soma de todas as transações financeiras categorizadas como "VARIAVEL".',
    example:
      'Você faturou R$ 100.000. Deste valor, pagou R$ 5.000 de imposto Simples Nacional, R$ 2.000 de taxas de cartão e R$ 3.000 de comissões de vendedores. Seus Custos Variáveis totais somam R$ 10.000 (10% do faturamento).',
    reference:
      'Quanto menor, melhor. Fundamental categorizar corretamente suas despesas no financeiro para não distorcer a margem.',
    category: 'Métricas de Performance',
    trend: 'down',
  },
  {
    id: 'despesas-fixas',
    title: 'Despesas Fixas',
    definition:
      'São os gastos que a empresa possui independentemente de realizar vendas ou não. Eles se mantêm (ou variam muito pouco) todo mês. Exemplos: Aluguel, IPTU, salários da equipe administrativa, honorários contábeis, sistemas e softwares.',
    calculation:
      'Soma dos lançamentos categorizados como "Fixa". Percentual calculado sobre as Receitas Realizadas: (Despesas Fixas / Receitas Realizadas) * 100.',
    example:
      'No meio da pandemia a farmácia ficou fechada por 15 dias, mas o aluguel de R$ 4.000 teve que ser pago normalmente. O aluguel é uma despesa fixa clássica.',
    reference:
      'Meta: Menor ou igual a 35% (≤ 35%). Essenciais para o cálculo do Ponto de Equilíbrio. Devem ser monitoradas de perto, pois não dependem do faturamento. O cálculo percentual é realizado estritamente sobre as Receitas Realizadas.',
    category: 'Tipos e Classificações',
    trend: 'neutral',
  },
  {
    id: 'despesas-previstas',
    title: 'Despesas Previstas',
    definition:
      'Soma das despesas e custos (fixos e variáveis) que ainda não foram pagos (status "Previsto" ou "Vencido") para o período filtrado.',
    calculation: 'Soma das transações de tipo "Despesa" que não estão com status "Realizado".',
    example:
      'Você registrou a conta de energia no valor de R$ 800 que vence no dia 25 do mês atual, mas o pagamento ainda não foi efetuado no banco. Ela aparecerá no dashboard como Prevista de R$ 800.',
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
    example:
      'Ao longo de março, você deu "baixa/pago" no aluguel (R$ 5.000), fornecedores (R$ 15.000) e salários (R$ 10.000). O painel vai consolidar suas Despesas Realizadas no mês em R$ 30.000.',
    reference: 'Representa o total de dinheiro que efetivamente saiu do caixa da empresa.',
    category: 'Painel Geral (Cards)',
    trend: 'down',
  },
  {
    id: 'despesas-variaveis',
    title: 'Despesas Variáveis',
    definition:
      'São os gastos que ocorrem apenas quando há venda ou produção, crescendo proporcionalmente ao faturamento. Exemplos: Impostos sobre venda (Simples Nacional), taxas de cartão de crédito, comissões, fretes de entrega, embalagens e matérias-primas.',
    calculation:
      'Soma dos lançamentos categorizados como "Variável". Percentual calculado sobre as Receitas Realizadas: (Despesas Variáveis / Receitas Realizadas) * 100.',
    example:
      'Se você vende 1 pote, usa 1 embalagem. Se vender 1.000 potes, usará 1.000 embalagens. O gasto com embalagens oscila diretamente com as vendas, logo é uma despesa variável.',
    reference:
      'Meta: Menor ou igual a 40% (≤ 40%). Impactam diretamente a Margem de Contribuição. Precisam estar embutidas no preço de venda para não gerar prejuízo. O cálculo percentual é realizado estritamente sobre as Receitas Realizadas.',
    category: 'Tipos e Classificações',
    trend: 'neutral',
  },
  {
    id: 'dividendos-lucros',
    title: 'Dividendos e Lucros (Receita Não Operacional)',
    definition:
      'Entradas financeiras que não são provenientes da atividade principal da empresa. Exemplo: Rendimentos de aplicações financeiras, venda de um equipamento antigo.',
    calculation: 'Classificação de receita no DRE.',
    example:
      'O saldo em conta corrente gerou R$ 300,00 de rendimentos de CDI no mês. Você cadastra como "Dividendos e Lucros". Assim, esses R$ 300 não inflam artificialmente a receita das vendas de manipulação.',
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
    example:
      'A farmácia teve uma Margem de Contribuição de R$ 84.934,89 (calculada pelas transações). Subtraindo os Custos Fixos que somaram R$ 40.000 (aluguel, folha), o lucro gerado puramente pela operação (EBITDA) foi de R$ 44.934,89.',
    reference:
      'Um dos indicadores mais importantes. Agora totalmente baseado nos lançamentos financeiros reais (Receitas e Despesas) da sua conta.',
    category: 'Painel Geral (Cards)',
    trend: 'up',
  },
  {
    id: 'fat-colab',
    title: 'Faturamento por Colaborador',
    definition: 'Mede a eficiência e a produtividade da equipe em relação à receita gerada.',
    calculation: 'Faturamento Total / Número de Colaboradores.',
    example:
      'A farmácia faturou R$ 150.000 no mês e possui no total 10 colaboradores. O Faturamento por Colaborador (Geral) é de R$ 15.000 por colaborador. Permite avaliar se a folha está pesada.',
    reference:
      'Usado para avaliar se a equipe está dimensionada corretamente. Faturamentos maiores com menos equipe aumentam esse índice.',
    rangesTitle: 'Classificação (Geral)',
    ranges: [
      { label: 'Péssimo', condition: '< R$ 8k', color: 'text-red-700 bg-red-50 border-red-200' },
      {
        label: 'Ruim',
        condition: 'R$ 8k - 12k',
        color: 'text-orange-700 bg-orange-50 border-orange-200',
      },
      {
        label: 'Bom',
        condition: 'R$ 12k - 15k',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      },
      {
        label: 'Excelente',
        condition: 'R$ 15k - 18k',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
      },
      {
        label: 'Sensacional',
        condition: '> R$ 18k',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      },
    ],
    rangesTitleSecondary: 'Classificação (Vendas)',
    rangesSecondary: [
      { label: 'Péssimo', condition: '< R$ 40k', color: 'text-red-700 bg-red-50 border-red-200' },
      {
        label: 'Ruim',
        condition: 'R$ 40k - 50k',
        color: 'text-orange-700 bg-orange-50 border-orange-200',
      },
      {
        label: 'Bom',
        condition: 'R$ 50k - 60k',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      },
      {
        label: 'Excelente',
        condition: 'R$ 60k - 70k',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
      },
      {
        label: 'Sensacional',
        condition: '> R$ 70k',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      },
    ],
    category: 'Inteligência Analítica',
    trend: 'up',
  },
  {
    id: 'fator-medio',
    title: 'Fator Médio',
    definition:
      'Relação que indica quantas vezes o faturamento supera o custo direto de insumos (matéria-prima + embalagens).',
    calculation: 'Faturamento Total / Custo de Insumos.',
    example:
      'A farmácia faturou R$ 100.000. Todas as notas fiscais de matérias-primas e frascos usadas no mês custaram R$ 20.000. R$ 100.000 ÷ R$ 20.000 = Fator Médio de 5,0x.',
    reference: 'Um bom fator médio fica entre 5,0 e 6,5, dependendo do mix de produtos.',
    category: 'Métricas de Performance',
    trend: 'up',
  },
  {
    id: 'lo-colaborador',
    title: 'LO / Colaborador',
    definition: 'Lucro Operacional (EBITDA) gerado por cada pessoa da equipe.',
    calculation: 'Lucro Operacional (EBITDA) / Total de Colaboradores.',
    example:
      'Se a farmácia gerou R$ 30.000 de lucro operacional no mês e tem 10 funcionários no total, cada colaborador gerou R$ 3.000 de lucro.',
    reference:
      'Métrica superior ao Faturamento por Colaborador, pois mede a eficiência real da equipe baseada na sobra de caixa e não apenas na venda bruta.',
    rangesTitle: 'Classificação de Desempenho',
    ranges: [
      { label: 'Péssimo', condition: '< R$ 500', color: 'text-red-700 bg-red-50 border-red-200' },
      {
        label: 'Ruim',
        condition: 'R$ 500 a 1k',
        color: 'text-orange-700 bg-orange-50 border-orange-200',
      },
      {
        label: 'Bom',
        condition: 'R$ 1k a 2k',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      },
      {
        label: 'Excelente',
        condition: 'R$ 2k a 3k',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
      },
      {
        label: 'Sensacional',
        condition: '> R$ 3k',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      },
    ],
    category: 'Inteligência Analítica',
    trend: 'up',
  },
  {
    id: 'lucro-liquido-pct',
    title: 'Lucro Líquido Real (%)',
    definition:
      'Percentual que o lucro líquido final representa em relação às receitas realizadas.',
    calculation: '(Lucro Líquido / Receitas Realizadas) * 100.',
    example:
      'Entraram R$ 100.000 no caixa da farmácia (Receitas Realizadas). Após pagar fornecedores, impostos, salários e contas (despesas realizadas), sobraram livres na conta R$ 15.000. Seu Lucro Líquido Real foi de 15%.',
    reference:
      'Meta: Maior ou igual a 15% (≥ 15%). O cálculo é realizado estritamente sobre o valor total das Receitas Realizadas. Junto com Despesas Fixas (≤ 35%) e Variáveis (≤ 40%), forma o modelo de referência ideal.',
    rangesTitle: 'Classificação de Desempenho',
    ranges: [
      { label: 'Péssimo', condition: '< 5%', color: 'text-red-700 bg-red-50 border-red-200' },
      {
        label: 'Ruim',
        condition: '5% a 15%',
        color: 'text-orange-700 bg-orange-50 border-orange-200',
      },
      {
        label: 'Bom',
        condition: '15% a 20%',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      },
      {
        label: 'Excelente',
        condition: '20% a 25%',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
      },
      {
        label: 'Sensacional',
        condition: '> 25%',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      },
    ],
    category: 'Inteligência Analítica',
    trend: 'up',
  },
  {
    id: 'lucro-liquido',
    title: 'Lucro Líquido Realizado',
    definition: 'Resultado final de caixa no período analisado (em valores absolutos).',
    calculation: 'Receitas Realizadas - Despesas Realizadas.',
    example:
      'Você teve R$ 120.000 de entradas e R$ 90.000 de contas pagas no mês. O Lucro Líquido Realizado (o dinheiro que efetivamente sobrou livre para o dono ou para reinvestimento) é de R$ 30.000.',
    reference:
      'Indica se a empresa gerou caixa excedente após pagar todas as obrigações no período.',
    category: 'Painel Geral (Cards)',
    trend: 'up',
  },
  {
    id: 'meta-vendas-globais',
    title: 'Meta de Vendas Totais (manipulação + vendas extras)',
    definition:
      'Objetivo financeiro total da loja, englobando a manipulação e também todas as revendas, drogaria e serviços agregados.',
    calculation: 'Definido manualmente mês a mês na aba "Dados do Mês".',
    example:
      'A meta global desenhada para Novembro é R$ 200.000. Se as vendas de manipulados trouxeram R$ 150k e a perfumaria/drogaria trouxe R$ 30k, você está em R$ 180k (90% da meta global batida).',
    reference:
      'Métrica principal para acompanhar a força comercial completa do seu negócio frente ao mercado.',
    category: 'Métricas de Performance',
    trend: 'up',
  },
  {
    id: 'meta-vendas-manipulacao',
    title: 'Meta de Vendas Manipulação',
    definition:
      'Objetivo de faturamento exclusivo para a operação de manipulação (receitas operacionais principais), separando de revendas ou outras receitas.',
    calculation: 'Definido manualmente mês a mês.',
    example:
      'Sua meta de manipulação era R$ 100.000. A farmácia faturou R$ 110.000 ao todo, mas R$ 20.000 vieram da venda de perfumaria pronta. O realizado de manipulação foi R$ 90.000, ou seja, faltaram 10k para bater a meta exclusiva do laboratório.',
    reference:
      'Importante para avaliar a saúde da atividade-fim da farmácia, sem distorção de outras entradas de caixa.',
    category: 'Métricas de Performance',
    trend: 'up',
  },
  {
    id: 'margem-de-contribuicao',
    title: 'Margem de Contribuição',
    definition:
      'O valor que sobra das receitas realizadas após subtrair todos os custos variáveis lançados. É o que contribui para pagar as despesas fixas e gerar lucro.',
    calculation: 'Receitas Realizadas - Custo Variável Total (via Transações).',
    example:
      'Se suas receitas realizadas foram de R$ 139.991,00 e todas as despesas lançadas como VARIAVEL somaram R$ 55.056,11, a sua Margem de Contribuição é de R$ 84.934,89.',
    reference:
      'Margem agora baseada diretamente nos lançamentos financeiros reais. Exige disciplina na categorização das despesas para não corromper o cálculo.',
    category: 'Painel Geral (Cards)',
    trend: 'up',
  },
  {
    id: 'markup-divisor',
    title: 'Mark-up Divisor',
    definition:
      'Índice que representa a proporção do custo direto em relação ao custo total no ponto de equilíbrio.',
    calculation: 'Custo de Insumos / Custos Totais.',
    example:
      'Se, ao somar todas as suas despesas, os insumos representam exatamente 25% (0,25) do total gasto pela farmácia no mês, seu Divisor é 0,25.',
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
    example:
      'Se o seu Divisor é 0,25 (25%), o cálculo é 1 ÷ 0,25 = 4. Seu Mark-up Multiplicador de Ponto de Equilíbrio é 4x. Significa que, na média geral, se uma embalagem+ativo custa R$ 10, você precisa vender por pelo menos R$ 40 para não ter prejuízo.',
    reference:
      'Valor ideal para balizar o preço mínimo. Vender abaixo deste fator significa operar em prejuízo.',
    category: 'Métricas de Performance',
    trend: 'neutral',
  },
  {
    id: 'markup-realizado',
    title: 'Mark-up Praticado',
    definition: 'Multiplicador efetivamente realizado pela farmácia no período.',
    calculation: 'Vendas Totais Manipulação / (Custo de matérias primas + embalagens).',
    example:
      'No final do mês, você faturou R$ 120.000. Olhando as notas fiscais, o gasto com frascos e matéria-prima foi de R$ 20.000. R$ 120k ÷ R$ 20k = 6,0. Seu Mark-up Praticado real foi 6x o custo.',
    reference: 'Deve ser sempre superior ao Mark-up Alvo (P.E.).',
    rangesTitle: 'Classificação de Desempenho',
    ranges: [
      { label: 'Péssimo', condition: '< 4,4x', color: 'text-red-700 bg-red-50 border-red-200' },
      {
        label: 'Ruim',
        condition: '4,4 a 5,0x',
        color: 'text-orange-700 bg-orange-50 border-orange-200',
      },
      {
        label: 'Bom',
        condition: '5,0 a 5,7x',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      },
      {
        label: 'Excelente',
        condition: '5,7 a 6,7x',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
      },
      {
        label: 'Sensacional',
        condition: '> 6,7x',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      },
    ],
    category: 'Métricas de Performance',
    trend: 'up',
  },
  {
    id: 'monitor-ponto-equilibrio',
    title: 'Monitor Ponto de Equilíbrio',
    definition:
      'Gráfico visual de acompanhamento da receita acumulada em relação ao exigido para pagar todas as contas.',
    calculation: '(Receita Atual / Ponto de Equilíbrio) * 100.',
    example:
      'Os custos totais da farmácia dizem que você precisa faturar R$ 60.000 para empatar o mês (Ponto de Equilíbrio). Chegou dia 20 e as vendas atingiram R$ 60.000. O monitor vai marcar 100%. Tudo que faturar do dia 21 em diante gera lucro líquido puro.',
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
    example:
      'Para fazer uma cápsula específica, você gastou R$ 5 de pó e pote. O painel diz que seu custo fixo/var rateado é R$ 25 por fórmula. O Piso de Segurança é R$ 30,00. Vender esse orçamento por R$ 29 é tirar dinheiro do próprio bolso para pagar o cliente.',
    reference: 'Nenhum orçamento deve ser aprovado abaixo deste valor.',
    category: 'Ferramentas do Dashboard',
    trend: 'neutral',
  },
  {
    id: 'pm-ideal',
    title: 'Ticket-médio por Setor',
    definition:
      'O Preço Médio ou Ticket Médio exclusivo de um setor específico (ex: Cápsulas ou Dermato).',
    calculation: 'Faturamento do Setor / Número de Fórmulas do Setor.',
    example:
      'Se o setor de Dermatologia faturou R$ 40.000 num mês produzindo exatamente 200 potes de cremes/pomadas, o Ticket-médio Dermato é R$ 200,00 por unidade.',
    reference:
      'Ajuda a identificar qual linha de produção (Cápsulas vs. Dermato) consegue praticar valores mais altos e com maior rentabilidade agregada.',
    category: 'Inteligência Analítica',
    trend: 'up',
  },
  {
    id: 'ponto-de-equilibrio',
    title: 'Ponto de Equilíbrio',
    definition:
      'O faturamento necessário para cobrir exatamente todos os custos. É o "zero a zero". Atualizado com a nova Margem de Contribuição baseada no financeiro.',
    calculation: 'Custos Fixos / Índice de Margem de Contribuição.',
    example:
      'Seus custos fixos somam R$ 35.000. Sua margem de contribuição (agora baseada nas transações) é de 60% (0,6). Ponto de Equilíbrio: R$ 35.000 ÷ 0,6 = R$ 58.333. Vendendo esse valor, o lucro é zero.',
    reference:
      'Quanto menor, mais segura é a operação. Calculado com dados reais e automáticos do seu fluxo de caixa.',
    category: 'Painel Geral (Cards)',
    trend: 'down',
  },
  {
    id: 'preco-min-formula',
    title: 'Preço Mínimo por Fórmula',
    definition:
      'Ponto de equilíbrio unitário. O valor mínimo médio pelo qual cada fórmula deve ser vendida para não gerar prejuízo na globalidade.',
    calculation: 'Custos Totais Operacionais / Número de Fórmulas.',
    example:
      'Você teve R$ 60.000 de saídas totais de caixa no mês e sua equipe manipulou 1.000 receitas. Na média, seu Preço Mínimo por Fórmula é R$ 60,00. Ter um ticket médio (PM) das fórmulas muito abaixo de R$ 60 indica risco financeiro.',
    reference:
      'Indicador de balizamento. Suas vendas devem ter um ticket médio consideravelmente superior a este valor.',
    category: 'Métricas de Performance',
    trend: 'neutral',
  },
  {
    id: 'preco-sugerido',
    title: 'Preço Sugerido (Markup Dinâmico)',
    definition:
      'Preço de venda recomendado pelo algoritmo inteligente, ajustando a margem para baixo quando o insumo é muito caro, e para cima quando o insumo é barato.',
    calculation: 'Custo Informado * Curva de Markup Dinâmico.',
    example:
      'Na tela do assistente, você digitou R$ 10 de custo do ativo. Como o custo é muito barato, o sistema não aplicará o multiplicador normal de 5x (que daria R$ 50), mas sim uma curva maior, sugerindo R$ 65 para rentabilizar bem. Se custasse R$ 200, ele esmagaria o markup para o produto não ficar "impossível" de vender.',
    reference: 'Valor ideal para precificação ágil, maximizando a margem sem espantar o cliente.',
    category: 'Ferramentas do Dashboard',
    trend: 'neutral',
  },
  {
    id: 'receitas-operacionais',
    title: 'Receitas Realizadas',
    definition:
      'Total de entradas financeiras registradas efetivamente na conta bancária/caixa. Devem refletir apenas valores que entraram efetivamente no dia.',
    calculation: 'Soma de todas as transações com tipo "Receita" e status "Realizado".',
    example:
      'No final da sexta-feira, você conferiu o extrato: bateram R$ 2.000 em transferências PIX, a maquininha depositou R$ 1.500 das vendas de ontem, e no caixa de gaveta tem R$ 500 em espécie. Receita Realizada do dia: R$ 4.000.',
    reference:
      'Representa o faturamento bruto que virou dinheiro real disponível na mão, fundamental para os novos cálculos automáticos da Margem de Contribuição.',
    category: 'Painel Geral (Cards)',
    trend: 'up',
  },
  {
    id: 'regra-70',
    title: 'Regra dos 70%',
    definition:
      'Indicador de saúde do crescimento. O aumento dos custos fixos não deve ultrapassar 70% do ritmo de crescimento das vendas.',
    calculation: '(Crescimento Custos Fixos / Crescimento Vendas) * 100.',
    example:
      'Se suas vendas cresceram R$ 10.000 de um mês para outro, seus custos fixos não deveriam ter subido mais do que R$ 7.000 para manter a operação sustentável.',
    reference:
      'Serve como uma bússola de longevidade para evitar que a estrutura devore o crescimento comercial.',
    rangesTitle: 'Classificação de Desempenho',
    ranges: [
      { label: 'Péssimo', condition: '> 90%', color: 'text-red-700 bg-red-50 border-red-200' },
      {
        label: 'Ruim',
        condition: '70% a 90%',
        color: 'text-orange-700 bg-orange-50 border-orange-200',
      },
      {
        label: 'Bom',
        condition: '60% a 70%',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      },
      {
        label: 'Excelente',
        condition: '50% a 60%',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
      },
      {
        label: 'Sensacional',
        condition: '< 50%',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      },
    ],
    category: 'Inteligência Analítica',
    trend: 'down',
  },
  {
    id: 'retirada-socios',
    title: 'Retirada de Sócios (Tipo de Transação)',
    definition:
      'Registra a distribuição de lucros ou retiradas esporádicas realizadas pelos proprietários da empresa. Assim como as cortesias, não entram na DRE Operacional.',
    calculation: 'Não aplicável ao DRE/Lucro Operacional.',
    example:
      'Sobrou dinheiro na conta do CNPJ e os sócios decidiram transferir R$ 5.000 para as contas físicas (Pessoa Física). Esse registro abate do saldo do banco no painel, mas não mexe nos relatórios de performance (EBITDA/Lucro), pois o laboratório não foi pior ou melhor porque o dono retirou dinheiro.',
    reference: 'Usado exclusivamente para conciliação bancária e transparência de caixa.',
    category: 'Tipos e Classificações',
    trend: 'neutral',
  },
  {
    id: 'simulador-kumon',
    title: 'Simulador de Impacto (KUMON)',
    definition:
      'Ferramenta de simulação de ganho marginal. Ajuda a entender como pequenos ajustes (ex: R$ 1,00 a mais no preço ou a menos no custo) impactam o lucro mensal.',
    calculation: 'Volume Total de Fórmulas × Ajuste pretendido.',
    example:
      'Se você faz 3.000 fórmulas/mês e aumenta o preço médio em R$ 1,00, o lucro líquido sobe R$ 3.000,00 sem nenhum esforço adicional de vendas.',
    reference:
      'Ferramenta estratégica para ajuste fino da lucratividade e percepção de ganhos em escala.',
    category: 'Ferramentas do Dashboard',
    trend: 'up',
  },
  {
    id: 'taxa-tecnica',
    title: 'Taxa Técnica',
    definition:
      'O valor fixo que cada fórmula produzida precisa carregar para manter o seu laboratório aberto (salários, aluguel, energia, manutenção).',
    calculation: 'Custos Fixos Totais / Total de Fórmulas Produzidas.',
    example:
      'Se os custos fixos são R$ 10.000 e você produziu 1.000 fórmulas, a Taxa Técnica é R$ 10,00 por fórmula.',
    reference:
      'Ajuda a compor o Piso de Segurança junto com o custo da matéria-prima e custos variáveis.',
    category: 'Métricas de Performance',
    trend: 'down',
  },
  {
    id: 'ticket-medio',
    title: 'Ticket Médio Manipulação',
    definition: 'Valor médio de venda gerado por cada orçamento aprovado/pedido no sistema.',
    calculation: 'Faturamento Total / Número de Pedidos.',
    example:
      'O fechamento do mês apontou faturamento de R$ 100.000 derivado de 500 pedidos (receitas aviadas). R$ 100.000 ÷ 500 = Ticket Médio Manipulação de R$ 200,00 por atendimento.',
    reference:
      'Quanto maior, melhor. Indica eficácia do esforço do balconista em agregar vendas ou cross-selling.',
    category: 'Métricas de Performance',
    trend: 'up',
  },
  {
    id: 'valuation',
    title: 'Valuation (Estimativa)',
    definition:
      'Estimativa simplificada do valor de mercado da sua farmácia baseada na geração de caixa.',
    calculation: 'EBITDA Anualizado × Múltiplo de Mercado (Ex: 4x).',
    example:
      'Se a farmácia gera R$ 200.000 de EBITDA no ano, a um múltiplo de 4x, o valuation estimado é de R$ 800.000.',
    reference: 'Fornece uma visão clara sobre a construção de patrimônio ao longo do tempo.',
    category: 'Inteligência Analítica',
    trend: 'up',
  },
  {
    id: 'vendas-servicos',
    title: 'Vendas/Serviços (Receita Operacional)',
    definition:
      'São as receitas oriundas exclusivamente da atividade principal do seu negócio: manipulação de fórmulas, venda de cosméticos ou serviços prestados aos clientes.',
    calculation: 'Soma das receitas classificadas como "Operacional".',
    example:
      'Um cliente pagou R$ 150 por 2 frascos manipulados e R$ 20 por uma bala na recepção. Você pode dividir esse laçamento em R$ 150 para Vendas Manipulação (Operacional) e R$ 20 para Revenda/Conveniência, permitindo medir exatamente o que a farmácia produz.',
    reference:
      'Este é o valor que deve ser analisado para medir a saúde comercial e a aceitação dos seus manipulados.',
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
              como é calculado e confira <strong>exemplos práticos</strong> para garantir o domínio
              da saúde financeira do seu laboratório.
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
                      <div className="flex-1 flex flex-col">
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
                      </div>

                      {/* Metricas de Referência */}
                      {(term as any).ranges && (
                        <div className="mt-3">
                          <strong className="text-slate-700 block text-xs uppercase mb-2">
                            {(term as any).rangesTitle || 'Classificação de Desempenho'}
                          </strong>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {(term as any).ranges.map((r: any, i: number) => (
                              <div
                                key={i}
                                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-md border text-center shadow-sm bg-white ${r.color}`}
                              >
                                <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5">
                                  {r.label}
                                </span>
                                <span className="text-[11px] font-semibold tracking-tight">
                                  {r.condition}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(term as any).rangesSecondary && (
                        <div className="mt-2">
                          <strong className="text-slate-700 block text-xs uppercase mb-2">
                            {(term as any).rangesTitleSecondary}
                          </strong>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {(term as any).rangesSecondary.map((r: any, i: number) => (
                              <div
                                key={i}
                                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-md border text-center shadow-sm bg-white ${r.color}`}
                              >
                                <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5">
                                  {r.label}
                                </span>
                                <span className="text-[11px] font-semibold tracking-tight">
                                  {r.condition}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exemplo Prático Box */}
                      {term.example && (
                        <div className="bg-blue-50/60 p-3 rounded-md border border-blue-100/80 mt-3 shadow-sm">
                          <strong className="text-blue-800 flex items-center gap-1.5 text-xs uppercase mb-1.5 font-bold">
                            <Lightbulb className="w-4 h-4 text-amber-500" /> Exemplo Prático
                          </strong>
                          <p className="text-slate-700 leading-relaxed text-[12.5px]">
                            {term.example}
                          </p>
                        </div>
                      )}
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
