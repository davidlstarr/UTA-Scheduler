import { useState } from 'react'
import { Calendar, Clock, Target, X, Sparkles, ChevronDown, CheckCircle, ExternalLink } from 'lucide-react'
import { useChat } from '../context/ChatContext'

export default function InlinePlanGenerator({ onClose, onGenerate }) {
  const { learnerProfile, trainingPlans, apiKey } = useChat()
  const [step, setStep] = useState(1)
  const [planConfig, setPlanConfig] = useState({
    availableHours: 10,
    timeline: '12 weeks',
    weakAreas: [],
    studyPreference: 'balanced'
  })
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Check for existing plan
  const existingPlan = learnerProfile?.afsc && trainingPlans[learnerProfile.afsc]?.["3-to-5"]

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    // If we have a pre-built plan, customize it
    if (existingPlan) {
      const customPlan = {
        ...existingPlan,
        customized: true,
        config: planConfig,
        learningStyle: learnerProfile?.learningStyle
      }
      setGeneratedPlan(customPlan)
      setStep(3)
    } else {
      // Would call AI to generate
      setTimeout(() => {
        setGeneratedPlan({
          title: `Custom Training Plan for ${learnerProfile?.afsc}`,
          duration: planConfig.timeline,
          hoursPerWeek: planConfig.availableHours,
          phases: [
            { phase: 1, name: "Foundation", weeks: "1-4", focus: "CDC enrollment and initial study" },
            { phase: 2, name: "Knowledge Building", weeks: "5-12", focus: "Core CDC material" },
            { phase: 3, name: "Mastery", weeks: "13-20", focus: "URE prep and advanced topics" },
            { phase: 4, name: "Certification", weeks: "21-24", focus: "EOC preparation" }
          ]
        })
        setStep(3)
      }, 1000)
    }
    setIsGenerating(false)
  }

  return (
    <div className="message-enter bg-gradient-to-br from-air-900/30 to-slate-900 border border-air-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-air-700/30">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-air-400" />
          <h3 className="font-medium text-white">Create Your Study Plan</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-700 text-slate-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        {/* Step 1: Configuration */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Let's create a personalized study plan for your {learnerProfile?.afsc} upgrade training.
            </p>

            {/* Hours per week */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Hours available per week
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={planConfig.availableHours}
                  onChange={(e) => setPlanConfig(p => ({ ...p, availableHours: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-lg font-bold text-air-400 w-16 text-right">
                  {planConfig.availableHours} hrs
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                Target completion timeline
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['8 weeks', '12 weeks', '16 weeks'].map(timeline => (
                  <button
                    key={timeline}
                    onClick={() => setPlanConfig(p => ({ ...p, timeline }))}
                    className={`p-2 rounded-lg text-sm transition-colors ${
                      planConfig.timeline === timeline
                        ? 'bg-air-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {timeline}
                  </button>
                ))}
              </div>
            </div>

            {/* Study preference */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">Study preference</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'intensive', label: 'Intensive', desc: 'Longer sessions' },
                  { value: 'balanced', label: 'Balanced', desc: 'Mix of both' },
                  { value: 'frequent', label: 'Frequent', desc: 'Short sessions' }
                ].map(pref => (
                  <button
                    key={pref.value}
                    onClick={() => setPlanConfig(p => ({ ...p, studyPreference: pref.value }))}
                    className={`p-2 rounded-lg text-left transition-colors ${
                      planConfig.studyPreference === pref.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <div className="text-sm font-medium">{pref.label}</div>
                    <div className="text-xs opacity-70">{pref.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-air-600 hover:bg-air-500 text-white font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Confirm and Generate */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/50">
              <h4 className="text-sm font-medium text-white mb-3">Your Plan Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">AFSC</span>
                  <span className="text-white font-medium">{learnerProfile?.afsc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Learning Style</span>
                  <span className="text-purple-300 capitalize">{learnerProfile?.learningStyle || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Study Hours</span>
                  <span className="text-white">{planConfig.availableHours} hrs/week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timeline</span>
                  <span className="text-white">{planConfig.timeline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Style</span>
                  <span className="text-white capitalize">{planConfig.studyPreference}</span>
                </div>
              </div>
            </div>

            {existingPlan && (
              <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-700/50">
                <div className="flex items-center gap-2 text-emerald-300 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Pre-built CFETP training plan available for {learnerProfile?.afsc}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 py-3 rounded-xl bg-air-600 hover:bg-air-500 text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Plan
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Show Generated Plan */}
        {step === 3 && generatedPlan && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Plan Generated!</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50">
              <h4 className="font-medium text-white mb-2">{generatedPlan.title}</h4>
              <p className="text-sm text-slate-400 mb-3">
                {generatedPlan.duration || planConfig.timeline} • {planConfig.availableHours} hrs/week
              </p>

              <div className="space-y-2">
                {generatedPlan.phases?.slice(0, 4).map((phase, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/50">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-blue-600' :
                      i === 1 ? 'bg-purple-600' :
                      i === 2 ? 'bg-amber-600' :
                      'bg-emerald-600'
                    }`}>
                      {phase.phase || i + 1}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-white">{phase.name}</span>
                      <span className="text-xs text-slate-400 ml-2">Week {phase.weeks}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {generatedPlan.studyTips && learnerProfile?.learningStyle && (
              <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-700/50">
                <p className="text-xs text-purple-300 mb-1">Optimized for {learnerProfile.learningStyle} learners</p>
                <p className="text-sm text-slate-300">
                  {generatedPlan.studyTips[learnerProfile.learningStyle]?.[0]}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onGenerate(planConfig)}
                className="flex-1 py-3 rounded-xl bg-air-600 hover:bg-air-500 text-white font-medium transition-colors"
              >
                Get AI Tips
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}




