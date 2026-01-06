import { Calendar, BookOpen, Brain, Video, Target, FileText } from 'lucide-react'

export default function QuickActions({ afsc, learningStyle, hasExistingPlan, onAction, onShowPlan }) {
  const actions = [
    {
      icon: Calendar,
      label: 'Create Study Plan',
      onClick: onShowPlan,
      color: 'text-emerald-400',
      show: true
    },
    {
      icon: Video,
      label: 'Find Videos',
      onClick: () => onAction(`Find training videos for ${afsc} that work well for ${learningStyle || 'my'} learning style.`),
      color: 'text-red-400',
      show: true
    },
    {
      icon: BookOpen,
      label: 'CDC Study Tips',
      onClick: () => onAction(`Give me specific CDC study tips for ${afsc} optimized for a ${learningStyle || 'general'} learner.`),
      color: 'text-amber-400',
      show: true
    },
    {
      icon: Target,
      label: 'Core Tasks',
      onClick: () => onAction(`What are the core tasks I need to certify on for ${afsc} 5-level upgrade?`),
      color: 'text-blue-400',
      show: true
    },
    {
      icon: Brain,
      label: 'Practice Questions',
      onClick: () => onAction(`Give me some practice questions for ${afsc} CDC material.`),
      color: 'text-purple-400',
      show: true
    },
    {
      icon: FileText,
      label: 'CFETP Summary',
      onClick: () => onAction(`Summarize the key requirements from the ${afsc} CFETP for 5-level upgrade.`),
      color: 'text-air-400',
      show: hasExistingPlan
    }
  ]

  const visibleActions = actions.filter(a => a.show)

  return (
    <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-900/30">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="text-xs text-slate-500 whitespace-nowrap">Quick:</span>
          {visibleActions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs whitespace-nowrap transition-colors"
            >
              <action.icon className={`w-3.5 h-3.5 ${action.color}`} />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}




