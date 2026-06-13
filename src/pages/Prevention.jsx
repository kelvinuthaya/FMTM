import { useState, useEffect, useRef, useCallback } from 'react'
import { AlertTriangle, CheckCircle, Timer, Play, Pause, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'

const WRIST_STRETCHES = [
  { name: 'Étirement fléchisseurs', duration: 30, tip: 'Paume vers le haut, tirez les doigts vers vous. Poignet neutre.' },
  { name: 'Étirement extenseurs', duration: 30, tip: 'Paume vers le bas, fléchissez doucement. Tenez 30s.' },
  { name: 'Rotation poignet', duration: 20, tip: 'Cercles lents dans les deux sens. 10 rotations chaque côté.' },
  { name: 'Shake out', duration: 15, tip: 'Secouez les mains délicatement pour relâcher la tension.' },
]

const SHOULDER_EXERCISES = [
  { name: 'Face pull', sets: '2×15', tip: 'Tirez vers le visage, coudes hauts. Renforce rotateurs externes.' },
  { name: 'Rotation externe couché', sets: '2×12', tip: 'Allongé côté, haltère léger. Rotation lente vers le haut.' },
  { name: 'Étirement croix', sets: '2×30s', tip: 'Bras croisé devant la poitrine, tirez doucement avec l\'autre bras.' },
  { name: 'Pendule Codman', sets: '1×60s', tip: 'Incliné en avant, bras pendant librement. Cercles passifs très petits.' },
]

const BANNED = [
  'Élévation scapulaire (shrug) — INTERDIT',
  'Élévation frontale dumbbell au-dessus de 80°',
  'Press militaire derrière la nuque',
  'Upright row (tirage menton)',
]

const REPLACEMENTS = [
  { banned: 'Élévation scapulaire', replace: 'Suspension passive barre (décompression)' },
  { banned: 'Presse militaire lourde', replace: 'Élévation latérale légère < 80°' },
  { banned: 'Upright row', replace: 'Face pull bande/haltère léger' },
]

function StretchTimer({ stretches }) {
  const [idx, setIdx] = useState(0)
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(stretches[0].duration)
  const intervalRef = useRef(null)

  const current = stretches[idx]

  useEffect(() => {
    setRemaining(current.duration)
    setRunning(false)
  }, [idx, current.duration])

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          if (idx < stretches.length - 1) setTimeout(() => setIdx(i => i + 1), 500)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, idx, stretches.length])

  const reset = () => { setIdx(0); setRemaining(stretches[0].duration); setRunning(false) }

  const r = 48
  const circ = 2 * Math.PI * r
  const pct = remaining / current.duration
  const offset = circ * (1 - pct)

  return (
    <div className="bg-white border border-gray-200 rounded-card p-5">
      <p className="text-sm font-semibold text-gray-900 mb-1 text-center">{current.name}</p>
      <p className="text-xs text-gray-500 text-center mb-4">{current.tip}</p>

      <div className="flex justify-center mb-4">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke="#1D9E75"
            strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1s linear' }}
          />
          <text x="60" y="65" textAnchor="middle" fontSize="22" fill="#111827" fontFamily="Inter, sans-serif">{remaining}s</text>
        </svg>
      </div>

      <div className="flex justify-center items-center gap-3 mb-3">
        <button onClick={reset} className="p-2 rounded-full bg-gray-100 text-gray-500"><RotateCcw size={18} /></button>
        <button
          onClick={() => setRunning(r => !r)}
          className="px-6 py-2.5 bg-[#1D9E75] text-white rounded-full font-medium flex items-center gap-2"
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? 'Pause' : 'Démarrer'}
        </button>
      </div>

      <div className="flex gap-1 justify-center">
        {stretches.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-[#1D9E75]' : i < idx ? 'bg-gray-400' : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center mt-2">{idx + 1}/{stretches.length}</p>
    </div>
  )
}

function Section({ title, icon, iconColor, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white border border-gray-200 rounded-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center p-4"
      >
        <div className="flex items-center gap-2">
          <span className={iconColor}>{icon}</span>
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

export default function Prevention() {
  return (
    <div className="flex flex-col gap-4 p-4 pb-28">
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-gray-900">Prévention</h1>
        <p className="text-sm text-gray-400 mt-0.5">Routines anti-blessures adaptées à ton profil</p>
      </div>

      {/* Global alert banner */}
      <div className="bg-[#FDE9E9] border border-red-200 rounded-card p-3 flex items-start gap-2">
        <AlertTriangle size={16} className="text-[#E24B4A] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">
          <strong>Poignets neutres</strong> sur tous les exercices — <strong>Amplitude max 80°</strong> épaules —
          <strong> Stop immédiat</strong> si douleur aiguë
        </p>
      </div>

      {/* Wrist tendinitis */}
      <Section
        title="Tendinite avant-bras gauche"
        icon={<Timer size={16} />}
        iconColor="text-[#BA7517]"
        defaultOpen={true}
      >
        <div className="flex flex-col gap-3">
          <div className="bg-[#FBF2E3] rounded-lg p-3 text-sm text-gray-700">
            <p className="font-medium text-[#BA7517] mb-2">Règles poignets</p>
            <ul className="flex flex-col gap-1">
              <li>· Toujours garder les poignets <strong>neutres</strong> (ni fléchis, ni étendus)</li>
              <li>· Préférer le <strong>curl marteau</strong> au curl supination</li>
              <li>· Stop si douleur côté paume pendant l'effort</li>
              <li>· Échauffement poignets OBLIGATOIRE avant chaque séance</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Routine étirements poignets</p>
            <StretchTimer stretches={WRIST_STRETCHES} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-900">Exercices recommandés</p>
            {[
              { ex: 'Curl marteau haltères', why: 'Poignet neutre — protège le tendon fléchisseur' },
              { ex: 'Traction australienne', why: 'Prise neutre possible, charge progressive' },
              { ex: 'Rotation externe couché', why: 'Renforce sans contraindre les poignets' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 bg-[#E8F7F2] rounded-lg p-3">
                <CheckCircle size={16} className="text-[#1D9E75] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.ex}</p>
                  <p className="text-xs text-gray-500">{item.why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Shoulder */}
      <Section
        title="Épaule — Élévation scapulaire"
        icon={<AlertTriangle size={16} />}
        iconColor="text-[#E24B4A]"
        defaultOpen={false}
      >
        <div className="flex flex-col gap-3">
          <div className="bg-[#FDE9E9] rounded-lg p-3">
            <p className="text-sm font-medium text-[#E24B4A] mb-2">Exercices bannis</p>
            {BANNED.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-red-700 py-1">
                <X size={14} className="flex-shrink-0" />
                {b}
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Remplacements recommandés</p>
            {REPLACEMENTS.map((r, i) => (
              <div key={i} className="flex gap-3 items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1 text-sm text-red-500 line-through">{r.banned}</div>
                <span className="text-gray-400">→</span>
                <div className="flex-1 text-sm text-[#1D9E75] font-medium">{r.replace}</div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Exercices protecteurs épaule</p>
            {SHOULDER_EXERCISES.map((e, i) => (
              <div key={i} className="flex items-start gap-2 bg-[#E8F7F2] rounded-lg p-3 mb-2">
                <CheckCircle size={16} className="text-[#1D9E75] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex gap-2 items-baseline">
                    <p className="text-sm font-medium text-gray-900">{e.name}</p>
                    <span className="text-xs text-gray-400">{e.sets}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{e.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* General rules */}
      <Section
        title="Règles générales de progression"
        icon={<TrendingIcon />}
        iconColor="text-blue-500"
        defaultOpen={false}
      >
        <div className="flex flex-col gap-2 text-sm text-gray-700">
          {[
            { rule: 'Règle des +10%/semaine', detail: 'N\'augmente jamais la charge ou le volume de plus de 10% par semaine.' },
            { rule: 'Douleur = stop', detail: 'Une douleur aiguë ou anormale = arrêt immédiat. La gêne passagère est ok, la douleur non.' },
            { rule: '3 jours OFF minimum/semaine', detail: 'Lun/Mer/Ven laissent 2 jours de récupération entre chaque séance.' },
            { rule: 'Sommeil prioritaire', detail: 'La prise de masse se fait pendant le sommeil (GH). Vise 8h minimum.' },
            { rule: 'Hydratation', detail: 'Bois 2.5–3L/jour. Crucial pour les tendons et la récupération musculaire.' },
          ].map((item, i) => (
            <div key={i} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <p className="font-medium text-gray-900">{item.rule}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 5-min post-workout routine */}
      <div className="bg-white border border-gray-200 rounded-card p-4">
        <p className="text-sm font-semibold text-gray-900 mb-1">Routine 5 min post-séance</p>
        <p className="text-xs text-gray-400 mb-3">À faire APRÈS chaque entraînement</p>
        <StretchTimer stretches={[
          { name: 'Face pull léger', duration: 45, tip: 'Bande légère, coudes hauts. 15 reps lentes.' },
          { name: 'Étirement poignets', duration: 30, tip: 'Fléchisseurs et extenseurs — 30s chaque.' },
          { name: 'Rotation externe', duration: 45, tip: 'Allongé, 12 reps lentes chaque côté.' },
          { name: 'Suspension passive', duration: 30, tip: 'Bras tendus, décompression épaules.' },
          { name: 'Shake out + respiration', duration: 30, tip: 'Secouez les mains, 5 grandes respirations.' },
        ]} />
      </div>
    </div>
  )
}

function TrendingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

function X({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
