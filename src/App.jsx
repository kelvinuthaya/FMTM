import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Session from './pages/Session.jsx'
import Program from './pages/Program.jsx'
import Nutrition from './pages/Nutrition.jsx'
import Prevention from './pages/Prevention.jsx'
import Progress from './pages/Progress.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-lg mx-auto min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/session" element={<Session />} />
          <Route path="/program" element={<Program />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/prevention" element={<Prevention />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
