import { useState } from 'react'
import { AlertTriangle, Zap, Coffee, ShoppingBag } from 'lucide-react'
import { NUTRITION } from '../data/sessions.js'

function KcalBar({ current, target }) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-gray-900">{current} kcal</span>
        <span className="text-gray-400">/ {target} kcal</span>
      </div>
      <div className="bg-gray-100 rounded-full h-3">
        <div
          className="bg-[#1D9E75] h-3 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{pct}% de l'objectif journalier</p>
    </div>
  )
}

function MealCard({ meal }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      onClick={() => setOpen(o => !o)}
      className="w-full text-left bg-white border border-gray-200 rounded-card p-4 transition-all"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400">{meal.time}</p>
          <p className="font-medium text-gray-900">{meal.name}</p>
        </div>
        <span className="bg-[#E8F7F2] text-[#1D9E75] text-sm font-semibold px-2.5 py-1 rounded-full">{meal.kcal} kcal</span>
      </div>
      {open && (
        <ul className="mt-3 flex flex-col gap-1 border-t border-gray-100 pt-3">
          {meal.items.map((item, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-[#1D9E75] mt-0.5">·</span> {item}
            </li>
          ))}
        </ul>
      )}
    </button>
  )
}

function ShakerCard({ shaker }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      onClick={() => setOpen(o => !o)}
      className="w-full text-left bg-blue-50 border border-blue-100 rounded-card p-4"
    >
      <div className="flex justify-between items-center">
        <p className="font-medium text-blue-900">{shaker.name}</p>
        <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-2.5 py-1 rounded-full">{shaker.kcal} kcal</span>
      </div>
      {open && (
        <ul className="mt-3 flex flex-col gap-1 border-t border-blue-100 pt-3">
          {shaker.ingredients.map((ing, i) => (
            <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
              <span className="mt-0.5">·</span> {ing}
            </li>
          ))}
        </ul>
      )}
    </button>
  )
}

export default function Nutrition() {
  const [isTraining, setIsTraining] = useState(true)
  const target = isTraining ? NUTRITION.trainingDayKcal : NUTRITION.restDayKcal
  const totalMeals = NUTRITION.meals.reduce((acc, m) => acc + m.kcal, 0)

  return (
    <div className="flex flex-col gap-4 p-4 pb-28">
      <div className="flex justify-between items-center pt-1">
        <h1 className="text-2xl font-bold text-gray-900">Nutrition</h1>
        <div className="flex items-center gap-0 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setIsTraining(true)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${isTraining ? 'bg-[#1D9E75] text-white' : 'text-gray-500'}`}
          >
            Séance
          </button>
          <button
            onClick={() => setIsTraining(false)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${!isTraining ? 'bg-[#1D9E75] text-white' : 'text-gray-500'}`}
          >
            Repos
          </button>
        </div>
      </div>

      {/* Kcal total */}
      <div className="bg-white border border-gray-200 rounded-card p-4">
        <KcalBar current={totalMeals} target={target} />
      </div>

      {/* Meals */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Coffee size={15} className="text-[#BA7517]" /> Journée type
        </p>
        <div className="flex flex-col gap-2">
          {NUTRITION.meals.map((m, i) => <MealCard key={i} meal={m} />)}
        </div>
      </div>

      {/* Shakers */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Zap size={15} className="text-blue-500" /> Shakers hypercaloriques
        </p>
        <div className="flex flex-col gap-2">
          {NUTRITION.shakers.map((s, i) => <ShakerCard key={i} shaker={s} />)}
        </div>
      </div>

      {/* Invisible calories */}
      <div className="bg-[#FBF2E3] border border-orange-200 rounded-card p-4">
        <p className="text-sm font-semibold text-[#BA7517] mb-3 flex items-center gap-2">
          <ShoppingBag size={15} /> Calories invisibles — à ajouter partout
        </p>
        <ul className="flex flex-col gap-2">
          {NUTRITION.invisibleCalories.map((c, i) => (
            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-[#BA7517] mt-0.5">+</span> {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Quick snacks */}
      <div className="bg-white border border-gray-200 rounded-card p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">Snacks rapides et digestes</p>
        <ul className="flex flex-col gap-2">
          {NUTRITION.quickSnacks.map((s, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
              <span className="text-[#1D9E75] font-bold mt-0">{i + 1}.</span> {s}
            </li>
          ))}
        </ul>
      </div>

      {/* SII alert */}
      <div className="bg-[#FDE9E9] border border-red-200 rounded-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-[#E24B4A]" />
          <p className="text-sm font-semibold text-[#E24B4A]">Alerte SII — À éviter</p>
        </div>
        <ul className="flex flex-col gap-1.5">
          {NUTRITION.siiAvoid.map((a, i) => (
            <li key={i} className="text-sm text-red-700 flex items-start gap-2">
              <span className="mt-0.5">✕</span> {a}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
