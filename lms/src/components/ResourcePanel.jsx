import { useState } from 'react'
import { Video, BookOpen, FileText, Award, ChevronDown, ChevronUp, ExternalLink, Play, CheckCircle } from 'lucide-react'
import { useChat } from '../context/ChatContext'

export default function ResourcePanel({ afsc }) {
  const { trainingData } = useChat()
  const [expandedSection, setExpandedSection] = useState('videos')
  
  const afscInfo = trainingData?.afscData?.[afsc]
  
  if (!afscInfo) return null

  const sections = [
    { id: 'videos', label: 'Training Videos', icon: Video, data: afscInfo.videos },
    { id: 'modules', label: 'Training Modules', icon: BookOpen, data: afscInfo.trainingModules },
    { id: 'guides', label: 'Study Guides', icon: FileText, data: afscInfo.studyGuides },
    { id: 'tests', label: 'Practice Tests', icon: Award, data: afscInfo.practiceTests },
  ]

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-air-900/50 to-transparent">
        <h3 className="font-semibold text-white">{afsc} Resources</h3>
        <p className="text-sm text-slate-400">{afscInfo.title}</p>
      </div>
      
      <div className="divide-y divide-slate-800">
        {sections.map(section => (
          <div key={section.id}>
            <button
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <section.icon className="w-5 h-5 text-air-400" />
                <span className="font-medium text-white">{section.label}</span>
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
                  {section.data?.length || 0}
                </span>
              </div>
              {expandedSection === section.id ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
            
            {expandedSection === section.id && section.data && (
              <div className="px-4 pb-4 space-y-2">
                {section.id === 'videos' && section.data.map((video, i) => (
                  <a
                    key={i}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white group-hover:text-air-300">{video.title}</p>
                      <p className="text-xs text-slate-400">{video.duration}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-air-400" />
                  </a>
                ))}
                
                {section.id === 'modules' && section.data.map((module, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-800">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-white">{module.title}</p>
                      <span className="text-xs bg-air-600/20 text-air-300 px-2 py-0.5 rounded">{module.type}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">Duration: {module.duration}</p>
                    <ul className="space-y-1">
                      {module.objectives.map((obj, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                
                {section.id === 'guides' && section.data.map((guide, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{guide.title}</p>
                      <p className="text-xs text-slate-400">{guide.type}</p>
                    </div>
                  </div>
                ))}
                
                {section.id === 'tests' && section.data.map((test, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-purple-400" />
                      <p className="text-sm font-medium text-white">{test.title}</p>
                    </div>
                    <span className="text-xs text-slate-400">{test.questions} questions</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

