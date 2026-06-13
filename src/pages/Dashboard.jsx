import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Target, Dumbbell, TrendingUp, ChevronRight, Plus, Edit2, Check } from 'lucide-react'
import { useStore } from '../hooks/useStore.js'

const START_DATE = new Date('2026-04-24')
const TARGET_DATE = new Date('2026-06-20')
const START_WEIGHT = 45
const TARGET_WEIGHT = 50
const TARGET_PUSHUPS = 35
const TARGET_PULLUPS = 5

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000)
}

function formatDate(d) {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function today() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function EditableMetric({ label, value, unit, onSave, color = 'text-gray-900' }) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(value)

  const handleSave = () => {
    onSave(Number(input))
    setEditing(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-card p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-lg font-bold"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <button onClick={handleSave} className="text-[#1D9E75]"><Check size={18} /></button>
        </div>
      ) : (
        <div className="flex items-end gap-1 justify-between">
          <span className={`text-2xl font-bold ${color}`}>{value}<span className="text-sm font-normal text-gray-400 ml-1">{unit}</span></span>
          <button onClick={() => { setInput(value); setEditing(true) }} className="text-gray-400 pb-0.5">
            <Edit2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

function ProgressBar({ label, current, start, target, targetLabel, color = 'bg-[#1D9E75]' }) {
  const total = target - start
  const done = current - start
  const pct = Math.min(100, Math.max(0, Math.round((done / total) * 100)))
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500 text-xs">{pct}% · {targetLabel}</span>
      </div>
      <div className="bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{current} {label.toLowerCase().includes('poids') ? 'kg' : ''}</span>
        <span>Objectif : {target} {label.toLowerCase().includes('poids') ? 'kg' : ''}</span>
      </div>
    </div>
  )
}

function WeekCalendar({ sessions }) {
  const now = new Date()
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - now.getDay() + 1 + i)
    const iso = d.toISOString().slice(0, 10)
    const todayIso = now.toISOString().slice(0, 10)
    const hasSession = sessions.some(s => s.date === iso)
    return { label: days[i], iso, isToday: iso === todayIso, hasSession, isFuture: d > now }
  })
  return (
    <div className="flex gap-2 justify-between">
      {week.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xs text-gray-400">{d.label}</span>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border transition-colors ${
            d.hasSession
              ? 'bg-[#1D9E75] border-[#1D9E75] text-white'
              : d.isToday
              ? 'border-[#1D9E75] text-[#1D9E75] bg-[#E8F7F2]'
              : d.isFuture
              ? 'border-gray-200 text-gray-300'
              : 'border-gray-200 text-gray-400 bg-gray-50'
          }`}>
            {d.isToday && !d.hasSession ? '·' : ''}
          </div>
        </div>
      ))}
    </div>
  )
}

const NEXT_SESSION = { A: 'B', B: 'C', C: 'A' }

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, setProfile, sessions, getStreak, getWeekSessions } = useStore()

  const streak = getStreak()
  const weekSessions = getWeekSessions()
  const todayStr = today()
  const daysLeft = daysBetween(new Date(), TARGET_DATE)

  const lastSession = sessions[0]
  const nextType = lastSession ? NEXT_SESSION[lastSession.type] : 'A'

  return (
    <div className="flex flex-col gap-4 p-4 pb-28">
      {/* Header */}
      <div className="flex justify-between items-start pt-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FMTM</h1>
          <p className="text-sm text-gray-400">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5">
            <Flame size={16} className="text-[#BA7517]" />
            <span className="text-sm font-semibold text-[#BA7517]">{streak} j</span>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <EditableMetric
          label="Poids actuel"
          value={profile.weight}
          unit="kg"
          color="text-gray-900"
          onSave={v => setProfile({ weight: v })}
        />
        <div className="bg-[#E8F7F2] border border-[#1D9E75]/20 rounded-card p-4">
          <p className="text-xs text-[#1D9E75] mb-1">Objectif</p>
          <p className="text-2xl font-bold text-[#1D9E75]">+5 kg</p>
          <p className="text-xs text-[#1D9E75]/70 mt-0.5">{daysLeft} j restants</p>
        </div>
        <EditableMetric
          label="Max pompes"
          value={profile.maxPushups || 10}
          unit=""
          onSave={v => setProfile({ maxPushups: v })}
        />
        <EditableMetric
          label="Max tractions"
          value={profile.maxPullups || 1}
          unit=""
          onSave={v => setProfile({ maxPullups: v })}
        />
      </div>

      {/* Progress bars */}
      <div className="bg-white border border-gray-200 rounded-card p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-[#1D9E75]" />
          <span className="font-semibold text-gray-900 text-sm">Progression — 20 juin 2026</span>
        </div>
        <ProgressBar label="Poids" current={profile.weight} start={START_WEIGHT} target={TARGET_WEIGHT} targetLabel="50 kg" />
        <ProgressBar label="Pompes max" current={profile.maxPushups || 10} start={10} target={TARGET_PUSHUPS} targetLabel="35 reps" color="bg-blue-500" />
        <ProgressBar label="Tractions max" current={profile.maxPullups || 1} start={1} target={TARGET_PULLUPS} targetLabel="5 reps" color="bg-[#BA7517]" />
      </div>

      {/* Next workout */}
      <div className="bg-white border border-gray-200 rounded-card p-4">
        <p className="text-xs text-gray-400 mb-1">Prochain entraînement</p>
        <p className="font-semibold text-gray-900">
          Séance {nextType} — {nextType === 'A' ? 'Tirage' : nextType === 'B' ? 'Push' : 'Full body'}
        </p>
        <button
          onClick={() => navigate('/session')}
          className="mt-3 w-full bg-[#1D9E75] text-white py-3 rounded-card font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Dumbbell size={18} />
          Commencer la séance
        </button>
      </div>

      {/* Week calendar */}
      <div className="bg-white border border-gray-200 rounded-card p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">Cette semaine</p>
        <WeekCalendar sessions={weekSessions} />
        <p className="text-xs text-gray-400 mt-3 text-center">
          {weekSessions.length}/3 séances cette semaine
        </p>
      </div>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-card p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold text-gray-900">Dernières séances</p>
            <button onClick={() => navigate('/progress')} className="text-xs text-[#1D9E75] flex items-center gap-0.5">
              Tout voir <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {sessions.slice(0, 3).map(s => (
              <div key={s.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-800">Séance {s.type}</span>
                  <p className="text-xs text-gray-400">{new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                </div>
                <span className="text-xs text-gray-500">{s.duration} min</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
