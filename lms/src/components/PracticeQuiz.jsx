import { useState } from 'react'
import { CheckCircle, XCircle, HelpCircle, RotateCcw } from 'lucide-react'

export default function PracticeQuiz({ questions }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)

  if (!questions || questions.length === 0) return null

  const currentQuestion = questions[currentIndex]

  const handleAnswer = (option) => {
    if (showResult) return
    setSelectedAnswer(option)
    setShowResult(true)
    if (option.startsWith(currentQuestion.correct)) {
      setScore(s => s + 1)
    }
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setCompleted(true)
    }
  }

  const restart = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setCompleted(false)
  }

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div className="bg-slate-800 rounded-xl p-6 text-center">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
          percentage >= 70 ? 'bg-emerald-600' : 'bg-amber-600'
        }`}>
          <span className="text-2xl font-bold text-white">{percentage}%</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Quiz Complete!</h3>
        <p className="text-slate-300 mb-4">
          You scored {score} out of {questions.length}
        </p>
        <button
          onClick={restart}
          className="flex items-center gap-2 mx-auto px-4 py-2 bg-air-600 hover:bg-air-500 text-white rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-air-400" />
          <span className="font-medium text-white">Practice Question</span>
        </div>
        <span className="text-sm text-slate-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>
      
      <div className="p-4">
        <p className="text-white mb-4">{currentQuestion.question}</p>
        
        <div className="space-y-2">
          {currentQuestion.options.map((option, i) => {
            const isSelected = selectedAnswer === option
            const isCorrect = option.startsWith(currentQuestion.correct)
            
            let className = "w-full p-3 rounded-lg text-left transition-all "
            if (showResult) {
              if (isCorrect) {
                className += "bg-emerald-600/20 border border-emerald-500 text-emerald-200"
              } else if (isSelected) {
                className += "bg-red-600/20 border border-red-500 text-red-200"
              } else {
                className += "bg-slate-700/50 border border-slate-600 text-slate-400"
              }
            } else {
              className += "bg-slate-700 border border-slate-600 text-slate-200 hover:border-air-500 hover:bg-slate-600"
            }
            
            return (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
                className={className}
              >
                <div className="flex items-center gap-3">
                  {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400" />}
                  <span>{option}</span>
                </div>
              </button>
            )
          })}
        </div>
        
        {showResult && (
          <div className="mt-4 p-3 rounded-lg bg-slate-700/50">
            <p className="text-sm text-slate-300">
              <strong className="text-white">Explanation:</strong> {currentQuestion.explanation}
            </p>
          </div>
        )}
        
        {showResult && (
          <button
            onClick={nextQuestion}
            className="w-full mt-4 py-2 bg-air-600 hover:bg-air-500 text-white rounded-lg transition-colors"
          >
            {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  )
}

