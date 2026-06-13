import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Plus, TrendingUp, Scale, Target } from 'lucide-react'
import { useStore } from '../hooks/useStore.js'

const TARGET_DATE = '2026-06-20'

function formatDateShort(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function AddMeasurement({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), weight: '', maxPushups: '', maxPullups: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({
      date: form.date,
      weight: Number(form.weight) || undefined,
      maxPushups: Number(form.maxPushups) || undefined,
      maxPullups: Number(form.maxPullups) || undefined,
    })
    setOpen(false)
    setForm({ date: new Date().toISOString().slice(0, 10), weight: '', maxPushups: '', maxPullups: '' })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center gap-2 text-[#1D9E75] font-medium text-sm"
      >
        <Plus size={18} /> Ajouter une mesure
      </button>
      {open && (
        <form onSubmit={handleSubmit} className="px-4 pb-4 border-t border-gray-100 pt-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Poids (kg)</label>
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                placeholder="45.5"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max pompes</label>
              <input
                type="number"
                value={form.maxPushups}
                onChange={e => setForm(f => ({ ...f, maxPushups: e.target.value }))}
                placeholder="12"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max tractions</label>
              <input
                type="number"
                value={form.maxPullups}
                onChange={e => setForm(f => ({ ...f, maxPullups: e.target.value }))}
                placeholder="1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#1D9E75] text-white py-2.5 rounded-card font-medium text-sm active:scale-95 transition-transform"
          >
            Enregistrer
          </button>
        </form>
      )}
    </div>
  )
}

function MiniChart({ data, dataKey, color, unit, label, targetValue }) {
  if (!data || data.length < 2) {
    return (
      <div className="h-24 flex items-center justify-center text-xs text-gray-400">
        Pas encore assez de données
      </div>
    )
  }
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -30 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={formatDateShort} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
          <Tooltip
            formatter={v => [`${v} ${unit}`, label]}
            labelFormatter={formatDateShort}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
          />
          {targetValue && <ReferenceLine y={targetValue} stroke="#E24B4A" strokeDasharray="4 2" />}
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Progress() {
  const { measurements, sessions, addMeasurement, profile } = useStore()

  const weightData = measurements.filter(m => m.weight).map(m => ({ date: m.date, weight: m.weight })).reverse()
  const pushupsData = measurements.filter(m => m.maxPushups).map(m => ({ date: m.date, maxPushups: m.maxPushups })).reverse()
  const pullupsData = measurements.filter(m => m.maxPullups).map(m => ({ date: m.date, maxPullups: m.maxPullups })).reverse()

  const daysLeft = Math.max(0, Math.round((new Date(TARGET_DATE) - new Date()) / 86400000))
  const latestWeight = measurements.find(m => m.weight)?.weight ?? 45
  const latestPushups = measurements.find(m => m.maxPushups)?.maxPushups ?? 10
  const latestPullups = measurements.find(m => m.maxPullups)?.maxPullups ?? 1

  return (
    <div className="flex flex-col gap-4 p-4 pb-28">
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-gray-900">Suivi</h1>
        <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
          <Target size={13} /> Objectifs au 20 juin · {daysLeft} jours
        </p>
      </div>

      {/* Add measurement */}
      <AddMeasurement onAdd={addMeasurement} />

      {/* Key metrics summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Poids', value: latestWeight, unit: 'kg', target: 50, color: 'text-[#1D9E75]' },
          { label: 'Pompes', value: latestPushups, unit: '', target: 35, color: 'text-blue-500' },
          { label: 'Tractions', value: latestPullups, unit: '', target: 5, color: 'text-[#BA7517]' },
        ].map((m, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-card p-3 text-center">
            <p className={`text-xl font-bold ${m.color}`}>{m.value}<span className="text-sm font-normal">{m.unit}</span></p>
            <p className="text-xs text-gray-400 mt-0.5">{m.label}</p>
            <p className="text-xs text-gray-300">/{m.target}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-white border border-gray-200 rounded-card p-4 flex flex-col gap-5">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-[#1D9E75]" />
          <span className="font-semibold text-gray-900 text-sm">Évolution</span>
        </div>
        <MiniChart data={weightData} dataKey="weight" color="#1D9E75" unit="kg" label="Poids (kg)" targetValue={50} />
        <div className="border-t border-gray-100 pt-4">
          <MiniChart data={pushupsData} dataKey="maxPushups" color="#378ADD" unit="" label="Max pompes" targetValue={35} />
        </div>
        <div className="border-t border-gray-100 pt-4">
          <MiniChart data={pullupsData} dataKey="maxPullups" color="#BA7517" unit="" label="Max tractions" targetValue={5} />
        </div>
      </div>

      {/* Sessions history */}
      <div className="bg-white border border-gray-200 rounded-card p-4">
        <p className="font-semibold text-gray-900 text-sm mb-3">Historique des séances</p>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Aucune séance enregistrée</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {sessions.map(s => (
              <div key={s.id} className="py-3 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      s.type === 'A' ? 'bg-[#E8F7F2] text-[#1D9E75]' :
                      s.type === 'B' ? 'bg-blue-50 text-blue-600' :
                      'bg-orange-50 text-[#BA7517]'
                    }`}>
                      Séance {s.type}
                    </span>
                    <span className="text-sm text-gray-600">{formatDateShort(s.date)}</span>
                  </div>
                  {s.note && <p className="text-xs text-gray-400 mt-1 italic">"{s.note}"</p>}
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>{s.duration} min</p>
                  {s.maxPushups > 0 && <p>{s.maxPushups} pompes</p>}
                  {s.maxPullups > 0 && <p>{s.maxPullups} tractions</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
