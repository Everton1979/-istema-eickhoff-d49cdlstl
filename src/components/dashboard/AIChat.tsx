import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react'
import { sendMessageToAI, Message } from '@/services/chat'
import { cn } from '@/lib/utils'

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Olá! Sou o Assistente IA. Como posso te ajudar com a análise dos indicadores da sua farmácia?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const reply = await sendMessageToAI([...messages, userMsg])
      setMessages((prev) => [...prev, reply])
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique sua conexão ou tente novamente mais tarde.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 text-white p-0 flex items-center justify-center print:hidden z-50 transition-transform hover:scale-105 group"
      >
        <Bot className="w-6 h-6 group-hover:animate-pulse" />
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        'fixed right-4 bottom-4 flex flex-col shadow-2xl border-slate-200 dark:border-slate-800 z-50 print:hidden transition-all duration-300 ease-in-out',
        isExpanded
          ? 'w-[calc(100vw-2rem)] sm:w-[600px] h-[calc(100vh-2rem)] sm:h-[800px]'
          : 'w-[350px] h-[500px]',
      )}
    >
      <CardHeader className="p-3 bg-blue-600 text-white rounded-t-xl flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-full">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-sm sm:text-base font-bold">Assistente IA</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-100 hover:bg-blue-700 hover:text-white rounded-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-100 hover:bg-blue-700 hover:text-white rounded-full"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 relative">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4 pb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'flex max-w-[85%] gap-2 p-3 rounded-2xl',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm',
                  )}
                >
                  {msg.role === 'assistant' && (
                    <Bot className="w-4 h-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                  )}
                  <div className="text-[13.5px] whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="flex max-w-[80%] gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm items-center">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-[13.5px] text-slate-500 dark:text-slate-400">
                    Analisando...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-xl">
        <div className="flex w-full gap-2 items-center">
          <Input
            placeholder="Pergunte sobre seus indicadores..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border-slate-300 dark:border-slate-700 focus-visible:ring-blue-500 rounded-full bg-slate-50 dark:bg-slate-800"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 shrink-0 rounded-full h-10 w-10"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
