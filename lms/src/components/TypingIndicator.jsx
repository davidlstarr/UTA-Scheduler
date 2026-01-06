import { Bot } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="message-enter flex gap-4">
      <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-air-500 to-air-700">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="bg-slate-800 rounded-2xl rounded-tl-md px-5 py-4">
        <div className="flex gap-1.5">
          <span className="typing-dot w-2 h-2 rounded-full bg-air-400"></span>
          <span className="typing-dot w-2 h-2 rounded-full bg-air-400"></span>
          <span className="typing-dot w-2 h-2 rounded-full bg-air-400"></span>
        </div>
      </div>
    </div>
  )
}

