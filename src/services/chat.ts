import { supabase } from '@/lib/supabase/client'
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from '@supabase/supabase-js'

export type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const sendMessageToAI = async (messages: Message[]) => {
  try {
    const { data, error } = await supabase.functions.invoke('chat-assistant', {
      body: { messages },
    })

    if (error) {
      console.error('Edge Function Error:', error)

      let errorMessage = 'Falha ao comunicar com o assistente.'

      if (error instanceof FunctionsHttpError) {
        try {
          // O erro FunctionsHttpError carrega a resposta HTTP no objeto context
          if (error.context && typeof error.context.clone === 'function') {
            // Clonamos a resposta para ler sem esgotar o body original
            const clone = error.context.clone()
            try {
              const errData = await clone.json()
              if (errData && errData.error) {
                errorMessage = errData.error
              }
            } catch (jsonError) {
              const textData = await clone.text()
              if (textData) {
                errorMessage = textData
              }
            }
          }
        } catch (e) {
          console.error('Falha ao extrair detalhes do erro HTTP:', e)
        }
      } else if (error instanceof FunctionsRelayError) {
        errorMessage = 'Serviço do assistente temporariamente indisponível (Relay Error).'
      } else if (error instanceof FunctionsFetchError) {
        errorMessage = 'Falha de conexão. Por favor, verifique sua internet.'
      } else if (
        error.message &&
        error.message !== 'Edge Function returned a non-2xx status code'
      ) {
        errorMessage = error.message
      }

      throw new Error(errorMessage)
    }

    if (data && data.error) {
      throw new Error(data.error)
    }

    if (!data || !data.reply) {
      throw new Error('Formato de resposta não reconhecido pelo assistente.')
    }

    return data.reply as Message
  } catch (error: any) {
    console.error('Exception no envio de chat:', error)
    throw new Error(error.message || 'Falha ao comunicar com o assistente.')
  }
}
