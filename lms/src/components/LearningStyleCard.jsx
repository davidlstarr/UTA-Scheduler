import { Brain, Lightbulb, BookOpen } from 'lucide-react'

export default function LearningStyleCard({ style, strategies }) {
  if (!style || !strategies) return null
  
  const styleData = strategies[style]
  if (!styleData) return null

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-slate-900 border border-purple-700/50 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-purple-700/30">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{styleData.icon}</span>
          <div>
            <h3 className="font-semibold text-white">{styleData.name}</h3>
            <p className="text-sm text-purple-200/70">{styleData.description}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-medium text-white">Study Strategies</h4>
          </div>
          <ul className="space-y-1">
            {styleData.strategies.slice(0, 4).map((strategy, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                {strategy}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-medium text-white">CDC Approach</h4>
          </div>
          <ul className="space-y-1">
            {styleData.cdcApproach.slice(0, 3).map((tip, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-medium text-white">Best Resource Types</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {styleData.resourceTypes.map((type, i) => (
              <span key={i} className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full">
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

