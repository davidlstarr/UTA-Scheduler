import { GraduationCap, BookOpen, Brain, Target, Zap, Video, Award, Calendar, ClipboardList, Sparkles } from 'lucide-react'

export default function WelcomeScreen({ onQuickAction }) {
  const quickActions = [
    {
      icon: ClipboardList,
      label: "Start UGT Training",
      prompt: "I want to start my Upgrade Training. First, let me tell you my AFSC so you can pull up my CFETP requirements and create a personalized study plan.",
      color: "from-emerald-500 to-teal-500",
      featured: true
    },
    {
      icon: Brain,
      label: "Find my learning style",
      prompt: "Help me discover my learning style through a series of questions. I want to know if I'm a visual, auditory, reading/writing, or kinesthetic learner so I can study CDCs more effectively.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Calendar,
      label: "Create study schedule",
      prompt: "I need a detailed week-by-week study schedule for my CDC completion. Please ask about my AFSC and available study time so you can create a personalized plan.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Video,
      label: "Training videos",
      prompt: "Find me real training videos on YouTube that will help with my career field CDCs. I need actual video links I can watch.",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: Target,
      label: "CFETP requirements",
      prompt: "Explain my CFETP requirements for 5-level upgrade. What CDCs do I need, what are the core tasks, and how long does upgrade training take?",
      color: "from-amber-500 to-yellow-500"
    },
    {
      icon: Award,
      label: "URE/EOC prep",
      prompt: "Help me prepare for my URE and EOC exams. Give me study strategies and practice questions with explanations.",
      color: "from-indigo-500 to-violet-500"
    }
  ]

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-air-500 to-air-700 flex items-center justify-center glow">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          UGT Learning Assistant
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto">
          Your AI-powered companion for Upgrade Training. Get personalized study plans, 
          video resources, practice tests, and learning strategies tailored to your AFSC.
        </p>
      </div>

      {/* Capabilities */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-2xl">
        {[
          { icon: Video, label: "Training Videos" },
          { icon: BookOpen, label: "Study Guides" },
          { icon: Award, label: "Practice Tests" },
          { icon: Brain, label: "Learning Assessment" },
          { icon: Calendar, label: "Custom Schedules" },
          { icon: Target, label: "AFSC Training" }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700">
            <item.icon className="w-4 h-4 text-air-400" />
            <span className="text-sm text-slate-300">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="w-full max-w-2xl">
        <p className="text-sm font-medium text-slate-500 text-center mb-4">
          <Zap className="w-4 h-4 inline mr-1" />
          Quick Start
        </p>
        
        {/* Featured Action */}
        <button
          onClick={() => onQuickAction(quickActions[0].prompt)}
          className="w-full mb-4 p-5 rounded-xl bg-gradient-to-r from-emerald-900/50 to-air-900/50 border border-emerald-600/30 hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-white text-lg">Start Your UGT Journey</p>
              <p className="text-sm text-slate-400">Get your CFETP requirements & personalized study plan</p>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
        </button>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.slice(1).map((action, index) => (
            <button
              key={index}
              onClick={() => onQuickAction(action.prompt)}
              className="group p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-air-500/50 hover:bg-slate-800 transition-all text-left"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-medium text-white text-sm">{action.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Supported AFSCs */}
      <div className="mt-10 text-center">
        <p className="text-xs text-slate-500 mb-2">Currently supporting</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['3D0X2', '1N0X1', '2A3X3', '1C3X1', '3E5X1'].map(afsc => (
            <span key={afsc} className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-400 font-mono">
              {afsc}
            </span>
          ))}
          <span className="px-2 py-1 text-xs rounded bg-air-600/20 text-air-300">
            + more coming
          </span>
        </div>
      </div>
    </div>
  )
}
