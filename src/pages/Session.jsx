import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Timer, Check, X, Plus, Minus, SkipForward, AlertTriangle, Zap, Star } from 'lucide-react'
import { SESSIONS } from '../data/sessions.js'
import { useStore } from '../hooks/useStore.js'

// ─── Tempo visualizer ─────────────────────────────────────────────────────────
function TempoDisplay({ tempo }) {
  if (!tempo) return null
  const [down, hold, up] = tempo.split('-').map(Number)
  const labels = ['Descente', 'Pause', 'Montée']
  const values = [down, hold, up]
  const colors = ['bg-blue-500', 'bg-[#BA7517]', 'bg-[#1D9E75]']
  return (
    <div className="flex items-center gap-3 justify-center mt-2">
      {values.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className={`w-10 h-10 rounded-full ${colors[i]} text-white flex items-center justify-center font-semibold text-sm`}>{v}s</div>
          <span className="text-[10px] text-gray-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Circular timer ────────────────────────────────────────────────────────────
function CircularTimer({ seconds, total, onDone }) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (remaining <= 0) { onDone(); return }
    intervalRef.current = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(intervalRef.current)
  }, [remaining, onDone])

  const pct = remaining / total
  const r = 48
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={remaining <= 5 ? '#E24B4A' : '#1D9E75'}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1s linear' }}
        />
        <text x="60" y="65" textAnchor="middle" className="font-semibold" fontSize="22" fill={remaining <= 5 ? '#E24B4A' : '#111827'} fontFamily="Inter, sans-serif">
          {remaining}s
        </text>
      </svg>
      <p className="text-sm text-gray-500">Repos en cours…</p>
    </div>
  )
}

// ─── Screen 1 — Selection ─────────────────────────────────────────────────────
function SessionSelect({ onSelect }) {
  const stars = [1, 2, 3]
  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Choisir une séance</h1>
        <p className="text-sm text-gray-500 mt-1">3 séances / semaine — Lun / Mer / Ven</p>
      </div>
      {Object.values(SESSIONS).map(s => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className="w-full text-left bg-white border border-gray-200 rounded-card p-5 active:scale-95 transition-transform"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="font-semibold text-gray-900 text-lg">{s.name}</span>
              <p className="text-xs text-gray-400 mt-0.5">{s.day}</p>
            </div>
            <span className="bg-[#E8F7F2] text-[#1D9E75] text-xs font-medium px-2.5 py-1 rounded-full">{s.duration} min</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {s.muscles.map(m => (
              <span key={m} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{m}</span>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {stars.map(i => (
              <Star key={i} size={14} className={i <= s.difficulty ? 'text-[#BA7517] fill-[#BA7517]' : 'text-gray-200 fill-gray-200'} />
            ))}
            <span className="text-xs text-gray-400 ml-1">Difficulté</span>
          </div>
          <div className="flex justify-end mt-3">
            <span className="text-[#1D9E75] text-sm font-medium flex items-center gap-1">
              Démarrer <ChevronRight size={16} />
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── Screen 2 — Workout ───────────────────────────────────────────────────────
function SessionWorkout({ sessionId, onFinish }) {
  const session = SESSIONS[sessionId]
  const exercises = session.exercises
  const totalSets = exercises.reduce((acc, e) => acc + e.sets, 0)

  const [exIdx, setExIdx] = useState(0)
  const [setNum, setSetNum] = useState(1)
  const [completedSets, setCompletedSets] = useState(0)
  const [resting, setResting] = useState(false)
  const [restDone, setRestDone] = useState(false)
  const [extraTime, setExtraTime] = useState(0)
  const [restTotal, setRestTotal] = useState(0)
  const [startTime] = useState(Date.now())

  const ex = exercises[exIdx]

  const handleSetDone = () => {
    const done = completedSets + 1
    setCompletedSets(done)
    if (ex.rest > 0) {
      const total = ex.rest + extraTime
      setRestTotal(total)
      setResting(true)
      setRestDone(false)
      setExtraTime(0)
    } else {
      setRestDone(true)
      advanceSet(done)
    }
  }

  const advanceSet = useCallback((done) => {
    const doneCount = done ?? completedSets
    if (setNum < ex.sets) {
      setSetNum(s => s + 1)
      setResting(false)
      setRestDone(false)
    } else {
      if (exIdx + 1 < exercises.length) {
        setExIdx(i => i + 1)
        setSetNum(1)
        setResting(false)
        setRestDone(false)
      } else {
        const duration = Math.round((Date.now() - startTime) / 60000)
        onFinish({ duration, completedSets: doneCount ?? completedSets })
      }
    }
  }, [exIdx, setNum, ex, exercises, startTime, onFinish, completedSets])

  const handleRestDone = useCallback(() => {
    setResting(false)
    setRestDone(true)
  }, [])

  const handleNext = () => advanceSet()

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Progress bar */}
      <div className="bg-gray-100 h-1.5">
        <div
          className="bg-[#1D9E75] h-1.5 transition-all duration-500"
          style={{ width: `${(completedSets / totalSets) * 100}%` }}
        />
      </div>
      <div className="px-4 pt-3 pb-2 flex justify-between items-center text-xs text-gray-400">
        <span>{completedSets}/{totalSets} séries</span>
        <span>Exercice {exIdx + 1}/{exercises.length}</span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* Exercise name */}
        <div>
          <p className="text-xs font-medium text-[#1D9E75] uppercase tracking-wide mb-1">
            {ex.isWarmup ? 'Échauffement / Récup' : `Série ${setNum}/${ex.sets}`}
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 leading-tight">{ex.name}</h2>
          <p className="text-3xl font-bold text-[#1D9E75] mt-1">{ex.reps} reps</p>
        </div>

        {/* Tempo */}
        {ex.tempo && <TempoDisplay tempo={ex.tempo} />}

        {/* Tip */}
        <div className="bg-blue-50 rounded-card p-3">
          <p className="text-sm text-blue-700">{ex.tip}</p>
        </div>

        {/* Alert */}
        {ex.alert && (
          <div className="bg-[#FDE9E9] rounded-card p-3 flex items-start gap-2">
            <AlertTriangle size={16} className="text-[#E24B4A] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#E24B4A] font-medium">{ex.alert}</p>
          </div>
        )}

        {/* Rest timer */}
        {resting && !restDone && (
          <div className="bg-white border border-gray-200 rounded-card p-5 flex flex-col items-center gap-4">
            <CircularTimer
              key={`${exIdx}-${setNum}-${extraTime}`}
              seconds={restTotal}
              total={restTotal}
              onDone={handleRestDone}
            />
            <div className="flex gap-3">
              <button
                onClick={handleRestDone}
                className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium"
              >
                <SkipForward size={14} /> Skip
              </button>
              <button
                onClick={() => { setExtraTime(e => e + 15); setRestTotal(t => t + 15) }}
                className="flex items-center gap-1.5 bg-[#E8F7F2] text-[#1D9E75] px-4 py-2 rounded-full text-sm font-medium"
              >
                <Plus size={14} /> +15s
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!resting && (
          <div className="mt-auto flex flex-col gap-3">
            {!restDone && (
              <button
                onClick={handleSetDone}
                className="w-full bg-[#1D9E75] text-white py-4 rounded-card font-semibold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Check size={22} />
                {ex.isWarmup ? 'Terminé' : `Série ${setNum} terminée`}
              </button>
            )}
            {(restDone || ex.rest === 0) && setNum >= ex.sets && (
              <button
                onClick={handleNext}
                className="w-full bg-gray-900 text-white py-4 rounded-card font-semibold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                Exercice suivant <ChevronRight size={22} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Screen 3 — Finish ────────────────────────────────────────────────────────
function Confetti() {
  const colors = ['#1D9E75', '#378ADD', '#BA7517', '#E24B4A', '#F59E0B']
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    size: 6 + Math.random() * 6,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute top-0 rounded-sm animate-bounce"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${0.8 + Math.random() * 0.4}s`,
            transform: `translateY(${Math.random() * 80}vh)`,
          }}
        />
      ))}
    </div>
  )
}

function SessionFinish({ sessionId, duration, completedSets, onSave }) {
  const session = SESSIONS[sessionId]
  const [note, setNote] = useState('')
  const [pushups, setPushups] = useState('')
  const [pullups, setPullups] = useState('')
  const [hardest, setHardest] = useState('')
  const { addSession, setProfile } = useStore()
  const navigate = useNavigate()
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(t)
  }, [])

  const handleSave = () => {
    addSession({
      date: new Date().toISOString().slice(0, 10),
      type: sessionId,
      duration,
      completedSets,
      maxPushups: Number(pushups) || 0,
      maxPullups: Number(pullups) || 0,
      note,
      hardest,
    })
    if (Number(pushups) > 0 || Number(pullups) > 0) {
      setProfile(p => ({
        ...p,
        maxPushups: Math.max(p.maxPushups || 0, Number(pushups) || 0),
        maxPullups: Math.max(p.maxPullups || 0, Number(pullups) || 0),
      }))
    }
    navigate('/')
  }

  return (
    <div className="flex flex-col gap-5 p-4 pb-24">
      {showConfetti && <Confetti />}

      <div className="text-center py-4">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-semibold text-gray-900">Séance terminée !</h2>
        <p className="text-gray-500 text-sm mt-1">{session.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#E8F7F2] rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-[#1D9E75]">{duration} min</p>
          <p className="text-xs text-[#1D9E75] mt-1">Durée</p>
        </div>
        <div className="bg-blue-50 rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{completedSets}</p>
          <p className="text-xs text-blue-600 mt-1">Séries</p>
        </div>
      </div>

      {/* Hardest exercise */}
      <div className="bg-white border border-gray-200 rounded-card p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Exercice le plus difficile ?</label>
        <div className="flex flex-wrap gap-2">
          {SESSIONS[sessionId].exercises.filter(e => !e.isWarmup).map(e => (
            <button
              key={e.id}
              onClick={() => setHardest(e.name)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                hardest === e.name
                  ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {e.name}
            </button>
          ))}
        </div>
      </div>

      {/* Max values */}
      <div className="bg-white border border-gray-200 rounded-card p-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Max pompes</label>
          <input
            type="number"
            value={pushups}
            onChange={e => setPushups(e.target.value)}
            placeholder="ex: 12"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Max tractions</label>
          <input
            type="number"
            value={pullups}
            onChange={e => setPullups(e.target.value)}
            placeholder="ex: 3"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Note */}
      <div className="bg-white border border-gray-200 rounded-card p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Note rapide</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Humeur, douleurs éventuelles, sensation générale…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
          rows={3}
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-[#1D9E75] text-white py-4 rounded-card font-semibold text-lg active:scale-95 transition-transform"
      >
        Enregistrer et terminer
      </button>
    </div>
  )
}

// ─── Main Session page ─────────────────────────────────────────────────────────
export default function Session() {
  const [step, setStep] = useState('select') // select | workout | finish
  const [sessionId, setSessionId] = useState(null)
  const [workoutResult, setWorkoutResult] = useState(null)
  const navigate = useNavigate()

  const handleSelect = (id) => {
    setSessionId(id)
    setStep('workout')
  }

  const handleFinish = ({ duration, completedSets }) => {
    setWorkoutResult({ duration, completedSets })
    setStep('finish')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => step === 'select' ? navigate('/') : setStep(step === 'workout' ? 'select' : 'workout')}>
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="font-semibold text-gray-900">
          {step === 'select' && 'Choisir une séance'}
          {step === 'workout' && (SESSIONS[sessionId]?.name ?? 'Séance')}
          {step === 'finish' && 'Résumé'}
        </h1>
      </div>

      {step === 'select' && <SessionSelect onSelect={handleSelect} />}
      {step === 'workout' && sessionId && (
        <SessionWorkout sessionId={sessionId} onFinish={handleFinish} />
      )}
      {step === 'finish' && workoutResult && (
        <SessionFinish
          sessionId={sessionId}
          duration={workoutResult.duration}
          completedSets={workoutResult.completedSets}
          onSave={() => navigate('/')}
        />
      )}
    </div>
  )
}
