import { useState } from 'react'
import { GraduationCap, MessageSquarePlus, Settings, Target, Brain, Calendar, ChevronRight, User, FileText, BookOpen, ClipboardList } from 'lucide-react'
import { useChat } from '../context/ChatContext'
import DynamicResources from './DynamicResources'
import StudyPlanGenerator from './StudyPlanGenerator'
import CFETPViewer from './CFETPViewer'
import TrainingPlanViewer from './TrainingPlanViewer'
import PracticeQuiz from './PracticeQuiz'

export default function Sidebar({ onSettingsClick }) {
  const { startNewSession, learnerProfile, apiKey, trainingData } = useChat()
  const [activePanel, setActivePanel] = useState(null)
  const [manualAfsc, setManualAfsc] = useState('')

  const currentAfsc = learnerProfile?.afsc || manualAfsc

  return (
    <aside className="w-96 bg-slate-900/50 border-r border-slate-800 flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-air-500 to-air-700 flex items-center justify-center glow">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-white">UGT Assistant</h1>
            <p className="text-xs text-slate-400">AI-Powered Training</p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={startNewSession}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-air-600 hover:bg-air-500 text-white font-medium transition-all hover:glow"
        >
          <MessageSquarePlus className="w-5 h-5" />
          New Training Session
        </button>
      </div>

      {/* Learner Profile */}
      <div className="px-4 mb-2">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-air-400" />
            <span className="text-sm font-medium text-white">Your Profile</span>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-slate-400">AFSC</label>
              <input
                type="text"
                value={currentAfsc}
                onChange={(e) => setManualAfsc(e.target.value.toUpperCase())}
                placeholder="e.g., 3D0X2"
                className="w-full mt-1 px-3 py-1.5 text-sm rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500"
              />
            </div>
            {learnerProfile?.learningStyle && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Learning Style</span>
                <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded-full capitalize">
                  {learnerProfile.learningStyle}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panels */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 px-2">
          Training Tools
        </p>

        {/* CFETP Viewer */}
        <div className="mb-3">
          <button
            onClick={() => setActivePanel(activePanel === 'cfetp' ? null : 'cfetp')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">CFETP Requirements</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${activePanel === 'cfetp' ? 'rotate-90' : ''}`} />
          </button>
          
          {activePanel === 'cfetp' && (
            <div className="mt-3">
              <CFETPViewer apiKey={apiKey} afsc={currentAfsc} />
            </div>
          )}
        </div>

        {/* Dynamic Resources */}
        <div className="mb-3">
          <button
            onClick={() => setActivePanel(activePanel === 'resources' ? null : 'resources')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-air-400" />
              <span className="text-sm font-medium">Find Resources</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${activePanel === 'resources' ? 'rotate-90' : ''}`} />
          </button>
          
          {activePanel === 'resources' && (
            <div className="mt-3">
              <DynamicResources 
                apiKey={apiKey} 
                afsc={currentAfsc} 
                learningStyle={learnerProfile?.learningStyle} 
              />
            </div>
          )}
        </div>

        {/* UGT Training Plan */}
        <div className="mb-3">
          <button
            onClick={() => setActivePanel(activePanel === 'ugt' ? null : 'ugt')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium">UGT Training Plan</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${activePanel === 'ugt' ? 'rotate-90' : ''}`} />
          </button>
          
          {activePanel === 'ugt' && (
            <div className="mt-3">
              <TrainingPlanViewer afsc={currentAfsc} />
            </div>
          )}
        </div>

        {/* AI Study Plan Generator */}
        <div className="mb-3">
          <button
            onClick={() => setActivePanel(activePanel === 'plan' ? null : 'plan')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">AI Study Plan</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${activePanel === 'plan' ? 'rotate-90' : ''}`} />
          </button>
          
          {activePanel === 'plan' && (
            <div className="mt-3">
              <StudyPlanGenerator 
                apiKey={apiKey} 
                afsc={currentAfsc} 
                learningStyle={learnerProfile?.learningStyle} 
              />
            </div>
          )}
        </div>

        {/* Learning Styles */}
        <div className="mb-3">
          <button
            onClick={() => setActivePanel(activePanel === 'styles' ? null : 'styles')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium">Learning Styles</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${activePanel === 'styles' ? 'rotate-90' : ''}`} />
          </button>
          
          {activePanel === 'styles' && (
            <div className="mt-3 space-y-2">
              {Object.entries(trainingData.learningStyleStrategies).map(([key, style]) => (
                <div 
                  key={key} 
                  className={`p-3 rounded-lg border transition-colors ${
                    learnerProfile?.learningStyle === key 
                      ? 'bg-purple-600/20 border-purple-500' 
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{style.icon}</span>
                    <span className="text-sm font-medium text-white">{style.name}</span>
                  </div>
                  <p className="text-xs text-slate-400">{style.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {style.resourceTypes.slice(0, 3).map((type, i) => (
                      <span key={i} className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Quiz */}
        <div className="mb-3">
          <button
            onClick={() => setActivePanel(activePanel === 'quiz' ? null : 'quiz')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">Practice Quiz</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${activePanel === 'quiz' ? 'rotate-90' : ''}`} />
          </button>
          
          {activePanel === 'quiz' && (
            <div className="mt-3">
              <PracticeQuiz questions={trainingData.practiceQuestions.general} />
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onSettingsClick}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-5 h-5" />
          API Settings
        </button>
      </div>
    </aside>
  )
}
