import { useState, useEffect } from 'react'
import { FileText, ExternalLink, ChevronDown, ChevronUp, Loader2, BookOpen, Award, GraduationCap, Target, AlertCircle } from 'lucide-react'
import { fetchCFETPInfo } from '../services/resourceFetcher'
import { cfetpDatabase, officialResources, trainingTerms } from '../data/cfetpData'

export default function CFETPViewer({ apiKey, afsc }) {
  const [cfetpData, setCfetpData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedSection, setExpandedSection] = useState('skillLevels')

  useEffect(() => {
    if (afsc) {
      loadCFETP()
    }
  }, [afsc])

  const loadCFETP = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Check local database first
      if (cfetpDatabase[afsc]) {
        setCfetpData({ ...cfetpDatabase[afsc], source: 'local' })
      } else if (apiKey) {
        const data = await fetchCFETPInfo(apiKey, afsc)
        setCfetpData(data)
      } else {
        setError('AFSC not in database. Add API key to fetch details.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!afsc) {
    return (
      <div className="p-6 text-center text-slate-400">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Enter your AFSC to view CFETP requirements</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-8 h-8 mx-auto mb-3 text-air-400 animate-spin" />
        <p className="text-slate-400">Loading CFETP for {afsc}...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-900/20 border border-red-700">
        <div className="flex items-center gap-2 text-red-400 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-sm text-red-300">{error}</p>
      </div>
    )
  }

  if (!cfetpData) return null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-air-900/50 to-slate-900 border border-air-700/30">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-white">{afsc}</span>
              {cfetpData.source === 'local' && (
                <span className="text-xs bg-emerald-600/20 text-emerald-300 px-2 py-0.5 rounded">Verified</span>
              )}
            </div>
            <h3 className="text-white font-medium">{cfetpData.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{cfetpData.description}</p>
          </div>
          {cfetpData.cfetpUrl && (
            <a
              href={cfetpData.cfetpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-air-400 hover:text-air-300"
            >
              View CFETP <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Skill Levels */}
      <CollapsibleSection
        title="Skill Level Progression"
        icon={GraduationCap}
        iconColor="text-blue-400"
        expanded={expandedSection === 'skillLevels'}
        onToggle={() => setExpandedSection(expandedSection === 'skillLevels' ? null : 'skillLevels')}
      >
        <div className="space-y-3">
          {cfetpData.skillLevels && Object.entries(cfetpData.skillLevels).map(([key, level]) => (
            <div key={key} className="p-3 rounded-lg bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold bg-air-600 text-white px-2 py-0.5 rounded">
                  {level.level}
                </span>
                <span className="text-sm font-medium text-white capitalize">{key}</span>
              </div>
              {level.description && (
                <p className="text-xs text-slate-400 mb-2">{level.description}</p>
              )}
              <ul className="space-y-1">
                {level.requirements?.map((req, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-air-400 mt-0.5">•</span>
                    {req}
                  </li>
                ))}
              </ul>
              {level.cdcVolumes && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {level.cdcVolumes.map((vol, i) => (
                    <span key={i} className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                      {vol}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Core Competencies */}
      {cfetpData.coreCompetencies && (
        <CollapsibleSection
          title="Core Competencies"
          icon={Target}
          iconColor="text-emerald-400"
          expanded={expandedSection === 'competencies'}
          onToggle={() => setExpandedSection(expandedSection === 'competencies' ? null : 'competencies')}
        >
          <div className="flex flex-wrap gap-2">
            {cfetpData.coreCompetencies.map((comp, i) => (
              <span key={i} className="text-xs bg-emerald-600/20 text-emerald-300 px-2 py-1 rounded-lg">
                {comp}
              </span>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Formal Courses */}
      {cfetpData.formalCourses && (
        <CollapsibleSection
          title="Formal Training Courses"
          icon={BookOpen}
          iconColor="text-amber-400"
          expanded={expandedSection === 'courses'}
          onToggle={() => setExpandedSection(expandedSection === 'courses' ? null : 'courses')}
        >
          <div className="space-y-2">
            {cfetpData.formalCourses.map((course, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-800 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{course.title}</p>
                  {course.number && (
                    <p className="text-xs text-slate-500 font-mono">{course.number}</p>
                  )}
                  <p className="text-xs text-slate-400">{course.location}</p>
                </div>
                {course.mandatory && (
                  <span className="text-xs bg-red-600/20 text-red-300 px-2 py-0.5 rounded">Required</span>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Certifications */}
      {cfetpData.certifications && (
        <CollapsibleSection
          title="Certifications"
          icon={Award}
          iconColor="text-purple-400"
          expanded={expandedSection === 'certs'}
          onToggle={() => setExpandedSection(expandedSection === 'certs' ? null : 'certs')}
        >
          <div className="space-y-2">
            {cfetpData.certifications.map((cert, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{cert.name}</p>
                  {cert.timeline && (
                    <p className="text-xs text-slate-400">{cert.timeline}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  cert.required 
                    ? 'bg-red-600/20 text-red-300' 
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {cert.required ? 'Required' : 'Recommended'}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Official Resources */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-air-400" />
          Official AF Resources
        </h4>
        <div className="space-y-2">
          {Object.entries(officialResources).map(([key, resource]) => (
            <a
              key={key}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-white group-hover:text-air-300">{resource.name}</p>
                <p className="text-xs text-slate-400">{resource.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-air-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function CollapsibleSection({ title, icon: Icon, iconColor, expanded, onToggle, children }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <span className="text-sm font-medium text-white">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}

