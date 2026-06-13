import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, Calendar, Apple, TrendingUp } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/session', label: 'Séance', Icon: Dumbbell },
  { to: '/program', label: 'Programme', Icon: Calendar },
  { to: '/nutrition', label: 'Nutrition', Icon: Apple },
  { to: '/progress', label: 'Suivi', Icon: TrendingUp },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-40">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-[#1D9E75]' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#1D9E75]' : 'text-gray-400'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
