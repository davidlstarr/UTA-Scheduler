import { useState } from 'react'
import { Calendar, Clock, Target, Loader2, CheckCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { generateStudyPlan } from '../services/resourceFetcher'

export default function StudyPlanGenerator({ apiKey, afsc, learningStyle }) {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedWeek, setExpandedWeek] = useState(null)
  const [formData, setFormData] = useState({
    availableHours: 10,
    timeline: '8 weeks',
    weakAreas: []
  })
  const [showForm, setShowForm] = useState(true)

  const handleGenerate = async () => {
    if (!apiKey || !afsc) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await generateStudyPlan(apiKey, {
        afsc,
        learningStyle,
        ...formData
      })
      setPlan(data)
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (showForm) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
        <h3 className="font-semibold text-white mb-4">Generate Your Study Plan</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Hours per week available</label>
            <input
              type="range"
              min="5"
              max="30"
              value={formData.availableHours}
              onChange={(e) => setFormData(f => ({ ...f, availableHours: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>5 hrs</span>
              <span className="text-air-400 font-medium">{formData.availableHours} hours/week</span>
              <span>30 hrs</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Target timeline</label>
            <select
              value={formData.timeline}
              onChange={(e) => setFormData(f => ({ ...f, timeline: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
            >
              <option value="4 weeks">4 weeks (Accelerated)</option>
              <option value="6 weeks">6 weeks</option>
              <option value="8 weeks">8 weeks (Standard)</option>
              <option value="12 weeks">12 weeks</option>
              <option value="16 weeks">16 weeks (Extended)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Areas needing focus (optional)</label>
            <input
              type="text"
              placeholder="e.g., networking, security, troubleshooting"
              value={formData.weakAreas.join(', ')}
              onChange={(e) => setFormData(f => ({ 
                ...f, 
                weakAreas: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading || !afsc}
            className="w-full py-3 rounded-lg bg-air-600 hover:bg-air-500 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                Generate Study Plan
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  if (!plan) return null

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-air-900/30 to-slate-900 border border-air-700/30">
        <h3 className="font-semibold text-white mb-3">Your Personalized Study Plan</h3>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Calendar className="w-4 h-4 text-air-400" />
            {plan.overview?.totalWeeks} weeks
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Clock className="w-4 h-4 text-air-400" />
            {plan.overview?.hoursPerWeek} hrs/week
          </div>
        </div>
        {plan.overview?.mainGoals && (
          <div className="space-y-1">
            {plan.overview.mainGoals.map((goal, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                <Target className="w-3 h-3 text-emerald-400" />
                {goal}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 text-sm text-air-400 hover:text-air-300"
        >
          Regenerate plan
        </button>
      </div>

      {/* Daily Routine */}
      {plan.dailyRoutine && (
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
          <h4 className="text-sm font-medium text-white mb-3">Daily Study Routine</h4>
          <div className="space-y-2">
            {Object.entries(plan.dailyRoutine).map(([phase, activity]) => (
              <div key={phase} className="flex items-start gap-3">
                <span className="text-xs font-medium text-air-400 uppercase w-20">{phase}</span>
                <span className="text-sm text-slate-300">{activity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Plan */}
      {plan.weeklyPlan && (
        <div className="rounded-xl bg-slate-900/50 border border-slate-700 overflow-hidden">
          <h4 className="text-sm font-medium text-white px-4 py-3 border-b border-slate-700">
            Weekly Breakdown
          </h4>
          <div className="divide-y divide-slate-800">
            {plan.weeklyPlan.map((week, i) => (
              <div key={i}>
                <button
                  onClick={() => setExpandedWeek(expandedWeek === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">Week {week.week}: {week.theme}</p>
                    <p className="text-xs text-slate-400">{week.milestone}</p>
                  </div>
                  {expandedWeek === i ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                
                {expandedWeek === i && (
                  <div className="px-4 pb-4 space-y-3">
                    {week.goals && (
                      <div className="space-y-1">
                        {week.goals.map((goal, j) => (
                          <div key={j} className="flex items-center gap-2 text-sm text-slate-300">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            {goal}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {week.activities && (
                      <div className="space-y-2">
                        {week.activities.map((activity, j) => (
                          <div key={j} className="p-3 rounded-lg bg-slate-800">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-air-400">{activity.day}</span>
                              <span className="text-xs text-slate-500">{activity.duration}</span>
                            </div>
                            <p className="text-sm text-slate-300">{activity.activity}</p>
                            {activity.resources?.map((res, k) => (
                              <a
                                key={k}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-air-400 hover:text-air-300 mt-1"
                              >
                                {res.title}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources */}
      {plan.resources?.primary && (
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
          <h4 className="text-sm font-medium text-white mb-3">Recommended Resources</h4>
          <div className="space-y-2">
            {plan.resources.primary.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-air-300">{res.title}</p>
                  {res.why && <p className="text-xs text-slate-400">{res.why}</p>}
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-air-400" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

