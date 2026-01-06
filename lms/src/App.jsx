import { useState } from 'react'
import { ChatProvider } from './context/ChatContext'
import ChatInterface from './components/ChatInterface'
import Sidebar from './components/Sidebar'
import ApiKeyModal from './components/ApiKeyModal'

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '')
  const [showApiModal, setShowApiModal] = useState(!apiKey)

  const handleSaveApiKey = (key) => {
    localStorage.setItem('gemini_api_key', key)
    setApiKey(key)
    setShowApiModal(false)
  }

  return (
    <ChatProvider apiKey={apiKey}>
      <div className="flex h-screen">
        <Sidebar onSettingsClick={() => setShowApiModal(true)} />
        <main className="flex-1 flex flex-col">
          <ChatInterface />
        </main>
      </div>
      {showApiModal && (
        <ApiKeyModal 
          onSave={handleSaveApiKey} 
          onClose={() => apiKey && setShowApiModal(false)}
          currentKey={apiKey}
        />
      )}
    </ChatProvider>
  )
}

export default App

