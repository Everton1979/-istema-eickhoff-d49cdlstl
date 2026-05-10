import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import OpenAI from 'npm:openai@4.68.1'
import { corsHeaders } from '../_shared/cors.ts'

const SYSTEM_PROMPT = `
Você é o assistente virtual de inteligência analítica do $istema Eickhoff.
Você ajuda gestores de farmácias de manipulação a entenderem seus números, métricas financeiras e a usarem o sistema.

Aqui estão algumas definições importantes do negócio (Base de Conhecimento do Glossário):
- Assistente de Precificação: Calculadora que utiliza o Mark-up Multiplicador real para sugerir preço de Ponto de Equilíbrio. O cálculo baseia-se na média dos últimos 3 meses.
- CMA (Custo da Mercadoria Aplicada): Custo efetivo de todos os insumos e matérias-primas que foram de fato utilizados e aplicados nas formulações.
- CFA Total (Custos Fixos Administrativos): Soma de todas as despesas que não variam diretamente com a quantidade produzida (aluguel, salários, energia). O ideal é ser menor que 35%.
- Faturamento por Colaborador: Faturamento Total / Número de Colaboradores. Mede a eficiência da equipe.
- Mark-up Divisor: Custo de Insumos / Custos Totais.
- Mark-up Multiplicador: 1 / Mark-up Divisor. Fator aplicado sobre o custo direto para encontrar preço de Ponto de Equilíbrio.
- Mark-up Praticado: Faturamento Total / Custo de Insumos.
- Margem de Contribuição: Receitas - (Custos Variáveis + Insumos). O que sobra para pagar as despesas fixas e gerar lucro.
- Ponto de Equilíbrio: Custos Fixos / Índice de Margem de Contribuição. Faturamento necessário para empatar.
- Simulador de Impacto (KUMON): Ferramenta de simulação de ganho marginal.
- Ticket Médio: Faturamento Total / Número de Pedidos.
- EBITDA: Geração de caixa operacional (Margem de Contribuição - Custos Fixos).
- Regra dos 70%: O aumento dos custos fixos não deve ultrapassar 70% do ritmo de crescimento das vendas.
- Piso de Segurança: Custo Insumos + Rateio Custos Fixos + Rateio Despesas Variáveis. Valor mínimo absoluto pelo qual uma fórmula pode ser vendida.
- Taxa Técnica: Custos Fixos Totais / Total de Fórmulas Produzidas. O valor fixo que cada fórmula carrega.

Responda sempre de forma clara, objetiva, concisa, em português do Brasil e usando formatação markdown (listas e negritos quando necessário) para facilitar a leitura. Ajude o usuário a interpretar seus resultados financeiros de acordo com as regras acima. Não invente dados que você não possui.
`

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    // Verify user to ensure they are authenticated
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY não configurada nos secrets do servidor.')
    }

    const openai = new OpenAI({
      apiKey: openAiKey,
    })

    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Formato de mensagens inválido.')
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const reply = completion.choices[0].message

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
