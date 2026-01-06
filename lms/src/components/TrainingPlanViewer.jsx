import { useState } from 'react'
import { Calendar, Clock, Target, CheckCircle, ChevronDown, ChevronUp, ExternalLink, BookOpen, Award, FileText } from 'lucide-react'
import { useChat } from '../context/ChatContext'

export default function TrainingPlanViewer({ afsc }) {
  const { trainingPlans, learnerProfile, ugtRequirements } = useChat()
  const [expandedPhase, setExpandedPhase] = useState(0)
  const [showUgtInfo, setShowUgtInfo] = useState(false)

  const currentAfsc = afsc || learnerProfile?.afsc
  const plan = currentAfsc && trainingPlans[currentAfsc]?.["3-to-5"]

  if (!currentAfsc) {
    return (
      <div className="p-6 text-center text-slate-400">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Enter your AFSC to view training plan</p>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="p-4">
        <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-700">
          <p className="text-sm text-amber-300">
            No pre-built training plan for {currentAfsc}. The AI can generate a custom plan based on CFETP requirements.
          </p>
        </div>
        
        {/* Show UGT general requirements */}
        <div className="mt-4">
          <button
            onClick={() => setShowUgtInfo(!showUgtInfo)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            <span className="text-sm font-medium text-white">UGT General Requirements</span>
            {showUgtInfo ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          
          {showUgtInfo && ugtRequirements && (
            <div className="mt-2 p-4 rounded-lg bg-slate-900 border border-slate-700 space-y-3">
              <div>
                <h4 className="text-xs font-medium text-air-400 mb-1">Timeline</h4>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• CDC Enrollment: {ugtRequirements.timeline.cdcEnrollment}</li>
                  <li>• CDC Completion: {ugtRequirements.timeline.cdcCompletion}</li>
                  <li>• Minimum UGT Time: {ugtRequirements.timeline.minimumUgtTime}</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-medium text-air-400 mb-1">CDC Program</h4>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• Passing Score: {ugtRequirements.cdcProgram.passingScore}%</li>
                  <li>• Minimum UREs: {ugtRequirements.cdcProgram.ureMinimum}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-700/30">
        <h3 className="font-semibold text-white mb-1">{plan.title}</h3>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {plan.duration}
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {plan.phases.length} Phases
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-2">
        {plan.phases.map((phase, index) => (
          <div key={index} className="rounded-xl bg-slate-900/50 border border-slate-700 overflow-hidden">
            <button
              onClick={() => setExpandedPhase(expandedPhase === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-blue-600' :
                  index === 1 ? 'bg-purple-600' :
                  index === 2 ? 'bg-amber-600' :
                  'bg-emerald-600'
                }`}>
                  {phase.phase}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{phase.name}</p>
                  <p className="text-xs text-slate-400">Weeks {phase.weeks}</p>
                </div>
              </div>
              {expandedPhase === index ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {expandedPhase === index && (
              <div className="px-4 pb-4 space-y-4">
                {/* Objectives */}
                <div>
                  <h4 className="text-xs font-medium text-air-400 mb-2 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Objectives
                  </h4>
                  <ul className="space-y-1">
                    {phase.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tasks */}
                {phase.tasks && (
                  <div>
                    <h4 className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Weekly Tasks
                    </h4>
                    <div className="space-y-2">
                      {phase.tasks.map((task, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-800">
                          <span className="text-sm text-slate-300">{task.task}</span>
                          <span className="text-xs text-slate-500">Week {task.week}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weekly Schedule */}
                {phase.weeklySchedule && (
                  <div>
                    <h4 className="text-xs font-medium text-purple-400 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Study Schedule
                    </h4>
                    <div className="space-y-2">
                      {phase.weeklySchedule.map((week, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-800">
                          <div>
                            <span className="text-xs text-air-400 font-medium">Week {week.week}</span>
                            <p className="text-sm text-slate-300">{week.focus}</p>
                          </div>
                          <span className="text-xs text-slate-500">{week.hours} hrs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {phase.milestones && (
                  <div>
                    <h4 className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Milestones
                    </h4>
                    <div className="space-y-1">
                      {phase.milestones.map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-emerald-900/20 border border-emerald-800/50">
                          <span className="text-sm text-emerald-200">{m.milestone}</span>
                          <span className="text-xs text-emerald-400">Week {m.week}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {phase.resources && (
                  <div>
                    <h4 className="text-xs font-medium text-blue-400 mb-2 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Resources
                    </h4>
                    <div className="space-y-2">
                      {phase.resources.map((res, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">{res.title}</span>
                            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-400">{res.type}</span>
                          </div>
                          {res.url && (
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-air-400 hover:text-air-300 mt-1"
                            >
                              Open resource <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {res.source && !res.url && (
                            <span className="text-xs text-slate-500">{res.source}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final Requirements */}
                {phase.finalRequirements && (
                  <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-700/50">
                    <h4 className="text-xs font-medium text-emerald-400 mb-2">Final Requirements for 5-Level</h4>
                    <ul className="space-y-1">
                      {phase.finalRequirements.map((req, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-emerald-200">
                          <CheckCircle className="w-4 h-4" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Study Tips by Learning Style */}
      {plan.studyTips && learnerProfile?.learningStyle && (
        <div className="p-4 rounded-xl bg-purple-900/20 border border-purple-700/30">
          <h4 className="text-sm font-medium text-purple-300 mb-2">
            Study Tips for {learnerProfile.learningStyle.charAt(0).toUpperCase() + learnerProfile.learningStyle.slice(1)} Learners
          </h4>
          <ul className="space-y-1">
            {plan.studyTips[learnerProfile.learningStyle]?.map((tip, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-purple-400">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}




