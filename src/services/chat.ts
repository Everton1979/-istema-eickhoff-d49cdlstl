import { supabase } from '@/lib/supabase/client'

export type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const sendMessageToAI = async (messages: Message[]) => {
  const { data, error } = await supabase.functions.invoke('chat-assistant', {
    body: { messages },
  })

  if (error) {
    console.error('Edge Function Error:', error)
    throw new Error('Falha ao comunicar com o assistente.')
  }

  if (data.error) {
    throw new Error(data.error)
  }

  return data.reply as Message
}
