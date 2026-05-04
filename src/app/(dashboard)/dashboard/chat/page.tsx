'use client'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

const PROMPTS = [
  'What should I prioritize this week?',
  'Which companies should I be most aggressive about?',
  'Move [company name] to interviewing',
  'Add a follow-up to call [name] on [date]',
]

function AssistantMessage({ content }: { content: string }) {
  if (!content.includes('[ACTION:')) {
    return <span className="whitespace-pre-wrap">{content}</span>
  }
  const parts = content.split(/(\[ACTION:[^\]]+\])/g)
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[ACTION:(.+)\]$/)
        if (match) {
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold px-2.5 py-1 rounded-full mx-0.5 align-middle"
            >
              <span className="text-amber-500">&#10003;</span>
              {match[1]}
            </span>
          )
        }
        return <span key={i} className="whitespace-pre-wrap">{part}</span>
      })}
    </>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch('/api/conversation')
      .then(r => r.json())
      .then(({ id, messages: saved }) => {
        if (saved?.length) setMessages(saved)
        if (id) setConversationId(id)
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const save = async (msgs: Message[], convId: string | null) => {
    try {
      const res = await fetch('/api/conversation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs, conversationId: convId }),
      })
      if (!res.ok) return
      const { id } = await res.json()
      if (id && id !== convId) setConversationId(id)
    } catch {
      // Non-fatal: conversation will reload from last successful save on next page open
    }
  }

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages: Message[] = [...messages, userMessage]
    setMessages([...newMessages, { role: 'assistant', content: '' }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok || !res.body) {
        const errText = res.status === 402
          ? 'Chat requires an Active plan. Go to Settings → Billing to subscribe.'
          : 'Something went wrong. Try again.'
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: errText }
          return updated
        })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantContent += decoder.decode(value, { stream: true })
        setMessages([...newMessages, { role: 'assistant', content: assistantContent }])
      }

      const finalMessages: Message[] = [...newMessages, { role: 'assistant', content: assistantContent }]
      setMessages(finalMessages)
      await save(finalMessages, conversationId)

    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  const clearConversation = async () => {
    if (conversationId) {
      await fetch('/api/conversation', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      })
    }
    setMessages([])
    setConversationId(null)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="h-screen flex flex-col font-sans bg-white">

      <header className="bg-slate-900 shrink-0">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
          <div className="flex items-center gap-6">
            {messages.length > 0 && !loading && !loadingHistory && (
              <button
                type="button"
                onClick={clearConversation}
                className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors bg-transparent border-0 cursor-pointer"
              >
                Clear
              </button>
            )}
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">
              Chat
            </span>
            <Link
              href="/dashboard"
              className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loadingHistory ? (
          <div className="max-w-3xl mx-auto px-6 py-20 flex items-center gap-2 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-pulse inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-pulse inline-block [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-pulse inline-block [animation-delay:300ms]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="max-w-3xl mx-auto px-6 py-20">
            <p className="text-[22px] font-bold text-slate-900 mb-2">
              What would you like to work on?
            </p>
            <p className="text-[14px] text-slate-400 leading-relaxed mb-8">
              Ask about your pipeline, or tell me to take action. I can move companies through stages, log follow-ups, and update notes directly.
            </p>
            <div className="flex flex-col gap-2">
              {PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => { setInput(prompt); textareaRef.current?.focus() }}
                  className="text-left text-[13px] text-slate-500 border border-slate-200 rounded-lg px-4 py-3 hover:border-slate-400 hover:text-slate-700 bg-transparent cursor-pointer transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'user' ? (
                  <div className="bg-slate-900 text-white text-[14px] px-4 py-3 rounded-2xl rounded-br-sm max-w-[95%] sm:max-w-[85%] sm:max-w-[70%] whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="text-[14px] text-slate-800 leading-relaxed max-w-[95%] sm:max-w-[85%]">
                    {msg.content ? (
                      <AssistantMessage content={msg.content} />
                    ) : (
                      <span className="inline-flex gap-1 items-center h-5">
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:300ms]" />
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything about your search…"
            rows={1}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none max-h-[140px]"
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-slate-900 text-white text-[13px] font-semibold px-5 py-3 rounded-xl cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            Send
          </button>
        </div>
        <p className="max-w-3xl mx-auto mt-2 text-[11px] text-slate-300">
          Enter to send · Shift+Enter for new line
        </p>
      </div>

    </div>
  )
}
