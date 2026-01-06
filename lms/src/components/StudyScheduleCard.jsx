import { Calendar, Clock, Target } from 'lucide-react'

export default function StudyScheduleCard({ template, scheduleData }) {
  if (!template || !scheduleData) return null
  
  const schedule = scheduleData[template]
  if (!schedule) return null

  return (
    <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-700/50 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-emerald-700/30">
        <h3 className="font-semibold text-white">{schedule.name}</h3>
        <p className="text-sm text-emerald-200/70">{schedule.description}</p>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Clock className="w-4 h-4 text-emerald-400" />
            {schedule.hoursPerDay} hrs/day
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-400" />
            {schedule.daysPerWeek} days/week
          </div>
        </div>
        
        <div className="space-y-2">
          {schedule.schedule.map((week, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
              <div className="w-16 text-xs font-medium text-emerald-400">
                Week {week.week}
              </div>
              <div className="flex-1 text-sm text-slate-300">{week.focus}</div>
              <div className="text-xs text-slate-500">{week.hours}h</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

