import { useState } from 'react'
import { Key, X, ExternalLink } from 'lucide-react'

export default function ApiKeyModal({ onSave, onClose, currentKey }) {
  const [key, setKey] = useState(currentKey || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (key.trim()) {
      onSave(key.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-air-600 flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white">API Configuration</h2>
          </div>
          {currentKey && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5">
          <p className="text-slate-400 text-sm mb-4">
            Enter your Google Gemini API key to enable the AI assistant. Your key is stored locally in your browser.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-air-500 focus:ring-2 focus:ring-air-500/20"
              autoFocus
            />
          </div>

          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-air-400 hover:text-air-300 mb-6"
          >
            Get your API key from Google AI Studio
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="submit"
            disabled={!key.trim()}
            className="w-full py-3 rounded-xl bg-air-600 text-white font-medium hover:bg-air-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save API Key
          </button>
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-800/30 rounded-b-2xl">
          <p className="text-xs text-slate-500 text-center">
            🔒 Your API key never leaves your browser and is only used to communicate directly with Google's API.
          </p>
        </div>
      </div>
    </div>
  )
}

