import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle, Calendar } from 'lucide-react'
import { PROGRAM } from '../data/sessions.js'
import { useStore } from '../hooks/useStore.js'

const START_DATE = new Date('2026-04-24')

function getCurrentWeek() {
  const now = new Date()
  const diff = Math.floor((now - START_DATE) / (7 * 86400000))
  return Math.min(8, Math.max(1, diff + 1))
}

function WeekCard({ week, isCurrentWeek, completedSessions }) {
  const [open, setOpen] = useState(isCurrentWeek)
  const allDone = completedSessions >= 3

  return (
    <div className={`bg-white border rounded-card overflow-hidden transition-all ${
      isCurrentWeek ? 'border-[#1D9E75] shadow-sm' : 'border-gray-200'
    }`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full p-4 flex justify-between items-start"
      >
        <div className="flex items-start gap-3">
          {allDone ? (
            <CheckCircle size={20} className="text-[#1D9E75] flex-shrink-0 mt-0.5" />
          ) : (
            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${
              isCurrentWeek ? 'border-[#1D9E75]' : 'border-gray-300'
            }`} />
          )}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className={`font-semibold ${isCurrentWeek ? 'text-[#1D9E75]' : 'text-gray-900'}`}>
                {week.label}
              </p>
              {isCurrentWeek && (
                <span className="bg-[#E8F7F2] text-[#1D9E75] text-xs px-2 py-0.5 rounded-full font-medium">
                  En cours
                </span>
              )}
              {allDone && !isCurrentWeek && (
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                  Complétée
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{week.goal}</p>
          </div>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          {/* Sessions indicator */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              {week.sessions.map((s, i) => (
                <div key={i} className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center ${
                  i < completedSessions
                    ? 'bg-[#1D9E75] text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {s}
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-400">{completedSessions}/3 séances</span>
          </div>

          {/* Key exercises */}
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Exercices clés</p>
            <ul className="flex flex-col gap-1">
              {week.keyExercises.map((ex, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] flex-shrink-0" />
                  {ex}
                </li>
              ))}
            </ul>
          </div>

          {/* Expected progress */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-700 mb-1">Progression attendue</p>
            <p className="text-sm text-blue-800">{week.expectedProgress}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Program() {
  const { sessions } = useStore()
  const currentWeek = getCurrentWeek()

  function getCompletedSessionsForWeek(weekNum) {
    const weekStart = new Date(START_DATE)
    weekStart.setDate(START_DATE.getDate() + (weekNum - 1) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    return sessions.filter(s => {
      const d = new Date(s.date)
      return d >= weekStart && d <= weekEnd
    }).length
  }

  const totalWeeks = 8
  const daysLeft = Math.max(0, Math.round((new Date('2026-06-20') - new Date()) / 86400000))

  return (
    <div className="flex flex-col gap-4 p-4 pb-28">
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-gray-900">Programme 8 semaines</h1>
        <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
          <Calendar size={13} /> 24 avril → 20 juin 2026 · {daysLeft} jours restants
        </p>
      </div>

      {/* Overall progress */}
      <div className="bg-white border border-gray-200 rounded-card p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-900">Avancement global</span>
          <span className="text-gray-500">Sem. {currentWeek}/{totalWeeks}</span>
        </div>
        <div className="bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-[#1D9E75] h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${((currentWeek - 1) / totalWeeks) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">{Math.round(((currentWeek - 1) / totalWeeks) * 100)}% du programme</p>
      </div>

      {/* Week cards */}
      <div className="flex flex-col gap-3">
        {PROGRAM.map(week => (
          <WeekCard
            key={week.week}
            week={week}
            isCurrentWeek={week.week === currentWeek}
            completedSessions={Math.min(3, getCompletedSessionsForWeek(week.week))}
          />
        ))}
      </div>
    </div>
  )
}
