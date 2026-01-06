import { User, Bot, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function Message({ message }) {
  const isUser = message.role === 'user'
  const isError = message.isError

  return (
    <div className={`message-enter flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
        isUser 
          ? 'bg-slate-700' 
          : isError 
            ? 'bg-red-900/50' 
            : 'bg-gradient-to-br from-air-500 to-air-700'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-slate-300" />
        ) : isError ? (
          <AlertCircle className="w-5 h-5 text-red-400" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block rounded-2xl px-5 py-3 ${
          isUser 
            ? 'bg-air-600 text-white rounded-tr-md' 
            : isError
              ? 'bg-red-900/20 border border-red-800 text-red-200 rounded-tl-md'
              : 'bg-slate-800 text-slate-200 rounded-tl-md'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <p className={`text-xs text-slate-500 mt-1.5 ${isUser ? 'pr-1' : 'pl-1'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  )
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

