import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Import Components
import GameSetup from './components/GameSetup'
import PitcherSelect from './components/PitcherSelect'
import PitchTracker from './components/PitchTracker'
import PitchInsights from './components/PitchInsights'
import EnhancedPitchInsights from './components/EnhancedPitchInsights'
import Settings from './components/Settings'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Navigate to="/game" replace />} />
          <Route path="/game" element={<GameSetup />} />
          <Route path="/pitcher-select/:gameId" element={<PitcherSelect />} />
          <Route path="/track/:pitcherId" element={<PitchTracker />} />
          <Route path="/insights/:pitcherId" element={<PitchInsights />} />
          <Route path="/enhanced-insights/:pitcherId" element={<EnhancedPitchInsights />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App