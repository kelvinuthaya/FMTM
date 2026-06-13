import { useState, useEffect, useCallback } from 'react'

const KEYS = {
  profile: 'fmtm_profile',
  sessions: 'fmtm_sessions',
  measurements: 'fmtm_measurements',
}

const DEFAULTS = {
  profile: { weight: 45, startDate: '2026-04-24', targetDate: '2026-06-20', maxPushups: 10, maxPullups: 1 },
  sessions: [],
  measurements: [{ date: '2026-04-24', weight: 45, maxPushups: 10, maxPullups: 1 }],
}

function load(key) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : null
  } catch { return null }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function useStore() {
  const [profile, setProfileState] = useState(() => load(KEYS.profile) ?? DEFAULTS.profile)
  const [sessions, setSessionsState] = useState(() => load(KEYS.sessions) ?? DEFAULTS.sessions)
  const [measurements, setMeasurementsState] = useState(() => load(KEYS.measurements) ?? DEFAULTS.measurements)

  const setProfile = useCallback((updater) => {
    setProfileState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      save(KEYS.profile, next)
      return next
    })
  }, [])

  const addSession = useCallback((session) => {
    setSessionsState(prev => {
      const next = [{ ...session, id: crypto.randomUUID() }, ...prev]
      save(KEYS.sessions, next)
      return next
    })
  }, [])

  const addMeasurement = useCallback((m) => {
    setMeasurementsState(prev => {
      const next = [m, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date))
      save(KEYS.measurements, next)
      return next
    })
  }, [])

  const getStreak = useCallback(() => {
    if (!sessions.length) return 0
    const dates = [...new Set(sessions.map(s => s.date))].sort((a, b) => new Date(b) - new Date(a))
    let streak = 0
    let current = new Date()
    current.setHours(0, 0, 0, 0)
    for (const d of dates) {
      const sd = new Date(d)
      sd.setHours(0, 0, 0, 0)
      const diff = (current - sd) / 86400000
      if (diff <= 1) { streak++; current = sd } else break
    }
    return streak
  }, [sessions])

  const getWeekSessions = useCallback(() => {
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - now.getDay() + 1)
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    return sessions.filter(s => {
      const d = new Date(s.date)
      return d >= monday && d <= sunday
    })
  }, [sessions])

  return { profile, setProfile, sessions, addSession, measurements, addMeasurement, getStreak, getWeekSessions }
}
