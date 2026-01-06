import { useState, useEffect } from 'react'
import { Video, BookOpen, Headphones, ExternalLink, Play, Loader2, RefreshCw, GraduationCap, FileText, Award } from 'lucide-react'
import { fetchTrainingResources } from '../services/resourceFetcher'

export default function DynamicResources({ apiKey, afsc, learningStyle }) {
  const [resources, setResources] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadResources = async () => {
    if (!apiKey || !afsc) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await fetchTrainingResources(apiKey, afsc, learningStyle)
      setResources(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (afsc && apiKey) {
      loadResources()
    }
  }, [afsc, learningStyle, apiKey])

  if (!afsc) {
    return (
      <div className="p-6 text-center text-slate-400">
        <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Enter your AFSC to load personalized resources</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-8 h-8 mx-auto mb-3 text-air-400 animate-spin" />
        <p className="text-slate-400">Finding resources for {afsc}...</p>
        <p className="text-xs text-slate-500 mt-1">Optimizing for {learningStyle || 'your'} learning style</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400 mb-3">{error}</p>
        <button
          onClick={loadResources}
          className="flex items-center gap-2 mx-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  if (!resources) return null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">{resources.title || afsc}</h3>
          <p className="text-sm text-slate-400">
            Resources for {learningStyle ? `${learningStyle} learners` : 'your training'}
          </p>
        </div>
        <button
          onClick={loadResources}
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Refresh resources"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Videos */}
      {resources.videos?.length > 0 && (
        <ResourceSection
          title="Training Videos"
          icon={Video}
          iconColor="text-red-400"
        >
          {resources.videos.map((video, i) => (
            <a
              key={i}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-air-300 truncate">
                  {video.title}
                </p>
                <p className="text-xs text-slate-400">
                  {video.source || video.channel} • {video.duration}
                </p>
                {video.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{video.description}</p>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-air-400 flex-shrink-0" />
            </a>
          ))}
        </ResourceSection>
      )}

      {/* Courses */}
      {resources.courses?.length > 0 && (
        <ResourceSection
          title="Online Courses"
          icon={GraduationCap}
          iconColor="text-blue-400"
        >
          {resources.courses.map((course, i) => (
            <a
              key={i}
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-white group-hover:text-air-300">
                  {course.title}
                </p>
                <p className="text-xs text-slate-400">
                  {course.provider} • {course.duration}
                  {course.free && <span className="ml-2 text-emerald-400">Free</span>}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-air-400" />
            </a>
          ))}
        </ResourceSection>
      )}

      {/* Articles */}
      {resources.articles?.length > 0 && (
        <ResourceSection
          title="Articles & Guides"
          icon={FileText}
          iconColor="text-amber-400"
        >
          {resources.articles.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-white group-hover:text-air-300">
                  {article.title}
                </p>
                <p className="text-xs text-slate-400">{article.source}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-air-400" />
            </a>
          ))}
        </ResourceSection>
      )}

      {/* Podcasts */}
      {resources.podcasts?.length > 0 && (
        <ResourceSection
          title="Podcasts"
          icon={Headphones}
          iconColor="text-purple-400"
        >
          {resources.podcasts.map((podcast, i) => (
            <a
              key={i}
              href={podcast.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-white group-hover:text-air-300">
                  {podcast.title}
                </p>
                {podcast.episode && (
                  <p className="text-xs text-slate-400">{podcast.episode}</p>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-air-400" />
            </a>
          ))}
        </ResourceSection>
      )}

      {/* Practice Resources */}
      {resources.practiceResources?.length > 0 && (
        <ResourceSection
          title="Practice & Assessment"
          icon={Award}
          iconColor="text-emerald-400"
        >
          {resources.practiceResources.map((resource, i) => (
            <a
              key={i}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-white group-hover:text-air-300">
                  {resource.title}
                </p>
                <p className="text-xs text-slate-400">{resource.type}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-air-400" />
            </a>
          ))}
        </ResourceSection>
      )}

      {/* Official Resources */}
      {resources.officialResources?.length > 0 && (
        <ResourceSection
          title="Official AF Resources"
          icon={BookOpen}
          iconColor="text-air-400"
        >
          {resources.officialResources.map((resource, i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-800">
              <p className="text-sm font-medium text-white">{resource.title}</p>
              <p className="text-xs text-slate-400 mt-1">{resource.description}</p>
              <p className="text-xs text-air-400 mt-1">{resource.accessInfo}</p>
            </div>
          ))}
        </ResourceSection>
      )}

      {/* Study Tips */}
      {resources.studyTips?.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-air-900/30 to-slate-900 border border-air-700/30">
          <h4 className="text-sm font-medium text-white mb-2">💡 Study Tips for {learningStyle} Learners</h4>
          <ul className="space-y-1">
            {resources.studyTips.map((tip, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-air-400">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ResourceSection({ title, icon: Icon, iconColor, children }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-700 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h4 className="text-sm font-medium text-white">{title}</h4>
      </div>
      <div className="p-3 space-y-2">
        {children}
      </div>
    </div>
  )
}

