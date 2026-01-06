import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Calendar, Target, BookOpen } from 'lucide-react'
import { useChat } from '../context/ChatContext'
import Message from './Message'
import TypingIndicator from './TypingIndicator'
import WelcomeScreen from './WelcomeScreen'
import InlinePlanGenerator from './InlinePlanGenerator'
import QuickActions from './QuickActions'

export default function ChatInterface() {
  const { messages, isLoading, sendMessage, learnerProfile, trainingPlans } = useChat()
  const [input, setInput] = useState('')
  const [showPlanGenerator, setShowPlanGenerator] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Check if we should show plan generator based on conversation
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        const content = lastMessage.content.toLowerCase()
        if (content.includes('study plan') || content.includes('training plan') || content.includes('schedule')) {
          // Show plan generator after AI mentions it
          if (learnerProfile?.afsc && learnerProfile?.learningStyle) {
            setShowPlanGenerator(true)
          }
        }
      }
    }
  }, [messages, learnerProfile])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(input.trim())
    setInput('')
    setShowPlanGenerator(false)
  }

  const handleQuickAction = (prompt) => {
    sendMessage(prompt)
    setShowPlanGenerator(false)
  }

  const hasExistingPlan = learnerProfile?.afsc && trainingPlans[learnerProfile.afsc]

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-air-400" />
            <h2 className="font-medium text-white">Training Session</h2>
            <span className="text-xs text-slate-500 ml-2">Powered by Gemini 2.0 Flash</span>
          </div>
          
          {/* Profile Pills */}
          <div className="flex items-center gap-2">
            {learnerProfile?.afsc && (
              <span className="text-xs bg-air-600/20 text-air-300 px-2 py-1 rounded-full">
                {learnerProfile.afsc}
              </span>
            )}
            {learnerProfile?.learningStyle && (
              <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full capitalize">
                {learnerProfile.learningStyle}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <WelcomeScreen onQuickAction={handleQuickAction} />
          ) : (
            <>
              {messages.map((message, index) => (
                <Message key={index} message={message} />
              ))}
              
              {/* Inline Plan Generator */}
              {showPlanGenerator && !isLoading && (
                <InlinePlanGenerator 
                  onClose={() => setShowPlanGenerator(false)}
                  onGenerate={(plan) => {
                    sendMessage(`I've generated my study plan. Here are my settings: ${plan.availableHours} hours/week for ${plan.timeline}. Can you help me optimize this plan for my ${learnerProfile?.learningStyle} learning style?`)
                    setShowPlanGenerator(false)
                  }}
                />
              )}
              
              {isLoading && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions Bar (when profile is set) */}
      {learnerProfile?.afsc && messages.length > 0 && !isLoading && (
        <QuickActions 
          afsc={learnerProfile.afsc}
          learningStyle={learnerProfile.learningStyle}
          hasExistingPlan={hasExistingPlan}
          onAction={handleQuickAction}
          onShowPlan={() => setShowPlanGenerator(true)}
        />
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your training, AFSC, or learning style..."
              className="w-full px-5 py-4 pr-14 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-air-500 focus:ring-2 focus:ring-air-500/20 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 rounded-xl bg-air-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-air-500 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-xs text-slate-500 mt-3">
            UGT Assistant provides guidance based on official USAF CFETPs. Always verify with your supervisor.
          </p>
        </form>
      </div>
    </div>
  )
}
