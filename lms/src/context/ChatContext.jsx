import { createContext, useContext, useState, useCallback } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { afscData, learningStyleStrategies, studyScheduleTemplates, practiceQuestions, interactiveExercises } from '../data/trainingResources'
import { cfetpDatabase, officialResources, trainingTerms, ugtRequirements, trainingPlans } from '../data/cfetpData'

const ChatContext = createContext(null)

const SYSTEM_PROMPT = `You are an expert Air Force Upgrade Training (UGT) Learning Assistant with access to official CFETP (Career Field Education and Training Plan) data. You help Airmen develop personalized training plans based on their career field (AFSC) and learning style.

## Your Knowledge Base:
You have access to CFETP requirements including:
- Skill level progression (3-level → 5-level → 7-level → 9-level)
- CDC (Career Development Course) volume requirements
- Core competencies and task lists
- Formal training courses
- Required certifications
- Official AF resources (e-Publishing, ADLS, myLearning)

## Official AF Training Terms:
${Object.entries(trainingTerms).map(([abbr, def]) => `- ${abbr}: ${def}`).join('\n')}

## Official Resources:
${Object.entries(officialResources).map(([key, res]) => `- ${res.name}: ${res.url}`).join('\n')}

## Your Capabilities:
1. **CFETP Guidance**: Explain skill level requirements, CDC volumes, and upgrade timelines
2. **Learning Style Assessment**: Identify visual, auditory, reading/writing, or kinesthetic learners
3. **Resource Curation**: Find REAL training resources tailored to learning style:
   - YouTube training videos with actual URLs
   - Online courses (Coursera, LinkedIn Learning, Udemy, ADLS)
   - Practice tests and CerTest preparation
   - Official AF publications and TOs
4. **Study Planning**: Create week-by-week CDC study schedules

## Learning Style Adaptations:
**VISUAL learners**: Videos, diagrams, flowcharts, color-coded notes, YouTube tutorials
**AUDITORY learners**: Podcasts, lectures, study groups, verbal explanations, recording notes
**READING/WRITING learners**: Written materials, note-taking, outlines, flashcards, CDC text
**KINESTHETIC learners**: Hands-on labs, OJT, simulations, practice equipment, movement breaks

## When Providing Resources:
- Include REAL, WORKING URLs to actual content
- Reference specific CDC volumes and CFETP sections
- Align recommendations with official training requirements
- Cite official AF resources (e-Publishing, AFIs, CFETPs)

## CFETP Data Available:
${Object.entries(cfetpDatabase).map(([afsc, data]) => `${afsc}: ${data.title} (${data.cfetpUrl})`).join('\n')}

## UGT Timeline Requirements (AFI 36-2670):
- CDC Enrollment: ${ugtRequirements.timeline.cdcEnrollment}
- CDC Completion: ${ugtRequirements.timeline.cdcCompletion}
- Minimum UGT Time: ${ugtRequirements.timeline.minimumUgtTime}
- Passing Score: ${ugtRequirements.cdcProgram.passingScore}%

## Pre-Built Training Plans Available:
${Object.keys(trainingPlans).join(', ')}

## Response Format:
- Use markdown for clear formatting
- Include clickable links to resources
- Reference CFETP requirements when applicable
- Be encouraging and supportive
- Provide specific videos, courses, and materials with URLs

Start by asking about their AFSC and upgrade training goals.`

export function ChatProvider({ children, apiKey }) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [learnerProfile, setLearnerProfile] = useState({
    afsc: null,
    learningStyle: null,
    level: null
  })
  const [chatHistory, setChatHistory] = useState([])

  const updateProfile = useCallback((updates) => {
    setLearnerProfile(prev => ({ ...prev, ...updates }))
  }, [])

  const sendMessage = useCallback(async (content) => {
    if (!apiKey) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Please set your Gemini API key in settings to continue.',
        timestamp: new Date()
      }])
      return
    }

    const userMessage = { role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-lite',
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 4096,
        }
      })

      // Build context from learner profile and CFETP data
      let cfetpContext = ''
      if (learnerProfile.afsc && cfetpDatabase[learnerProfile.afsc]) {
        const cfetp = cfetpDatabase[learnerProfile.afsc]
        cfetpContext = `\n\nCurrent AFSC CFETP Data:
- Title: ${cfetp.title}
- Core Competencies: ${cfetp.coreCompetencies?.join(', ')}
- 5-Level CDCs: ${cfetp.skillLevels?.journeyman?.cdcVolumes?.join(', ') || 'See CFETP'}
- Required Certs: ${cfetp.certifications?.filter(c => c.required).map(c => c.name).join(', ') || 'None'}`
      }

      const profileContext = `\n\nLearner Profile: AFSC: ${learnerProfile.afsc || 'not specified'}, Learning Style: ${learnerProfile.learningStyle || 'not determined'}, Level: ${learnerProfile.level || 'not specified'}${cfetpContext}`

      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT + profileContext }] },
          { role: 'model', parts: [{ text: 'I\'m ready to help with Upgrade Training. I have access to CFETP requirements and can find real training resources tailored to your AFSC and learning style. What\'s your AFSC?' }] },
          ...chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          }))
        ],
      })

      const result = await chat.sendMessage(content)
      const response = await result.response
      const text = response.text()

      // Extract AFSC from conversation
      const afscMatch = content.match(/\b([0-9][A-Z][0-9X][0-9X][0-9A-Z]?)\b/i)
      if (afscMatch) {
        updateProfile({ afsc: afscMatch[1].toUpperCase() })
      }
      
      // Detect learning style preferences
      const styleKeywords = {
        visual: /\b(visual|see|watch|diagram|picture|video|image|chart)\b/i,
        auditory: /\b(auditory|hear|listen|audio|podcast|discuss|talk)\b/i,
        reading: /\b(read|write|notes|text|article|book|manual)\b/i,
        kinesthetic: /\b(kinesthetic|hands.?on|practice|do|touch|physical|try)\b/i
      }
      
      for (const [style, regex] of Object.entries(styleKeywords)) {
        if (regex.test(content) && (content.toLowerCase().includes('prefer') || content.toLowerCase().includes('learn') || content.toLowerCase().includes('best'))) {
          updateProfile({ learningStyle: style })
          break
        }
      }

      const assistantMessage = { role: 'assistant', content: text, timestamp: new Date() }
      setMessages(prev => [...prev, assistantMessage])
      setChatHistory(prev => [...prev, userMessage, assistantMessage])

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}. Please check your API key and try again.`,
        timestamp: new Date(),
        isError: true
      }])
    } finally {
      setIsLoading(false)
    }
  }, [apiKey, chatHistory, learnerProfile, updateProfile])

  const clearChat = useCallback(() => {
    setMessages([])
    setChatHistory([])
    setLearnerProfile({ afsc: null, learningStyle: null, level: null })
  }, [])

  const startNewSession = useCallback(() => {
    clearChat()
    setTimeout(() => {
      setMessages([{
        role: 'assistant',
        content: `# Welcome to the UGT Learning Assistant! 🎖️

I'm your AI training companion with access to **official CFETP requirements** and curated training resources from across the internet.

## What I Can Help With:
- 📋 **CFETP Requirements** - Skill level progression, CDC volumes, core tasks
- 🎬 **Training Videos** - YouTube tutorials matched to your learning style
- 📚 **Study Resources** - Courses, guides, and practice materials
- 📅 **Study Plans** - Personalized schedules based on your timeline
- 🎧 **Learning Style** - Find out if you're visual, auditory, reading, or kinesthetic

## Official Resources I Can Reference:
- [AF e-Publishing](https://www.e-publishing.af.mil/) - CFETPs, AFIs, AFMANs
- [ADLS](https://www.airuniversity.af.edu/Barnes/ADLS/) - Online courses
- [myLearning](https://lms-jets.cce.af.mil/moodle/) - Required training

---

**What is your AFSC?** I'll pull up your CFETP requirements and find resources tailored to you.`,
        timestamp: new Date()
      }])
    }, 300)
  }, [clearChat])

  return (
    <ChatContext.Provider value={{
      messages,
      isLoading,
      sendMessage,
      clearChat,
      startNewSession,
      learnerProfile,
      updateProfile,
      apiKey,
      trainingData: { afscData, learningStyleStrategies, studyScheduleTemplates, practiceQuestions, interactiveExercises },
      cfetpData: cfetpDatabase,
      ugtRequirements,
      trainingPlans
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
