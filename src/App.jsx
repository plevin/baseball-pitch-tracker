import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Import Components
import Navigation from './components/Navigation'
import WelcomeScreen from './components/WelcomeScreen'
import GameSetup from './components/GameSetup'
import PitcherSelect from './components/PitcherSelect'
import PitchTracker from './components/PitchTracker'
import PitchInsights from './components/PitchInsights'
import EnhancedPitchInsights from './components/EnhancedPitchInsights'
import ScoutScreen from './components/ScoutScreen'
import TeamManagementScreen from './components/TeamManagementScreen'
import Settings from './components/Settings'

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/game" element={<GameSetup />} />
          <Route path="/pitcher-select/:gameId" element={<PitcherSelect />} />
          <Route path="/track/:pitcherId" element={<PitchTracker />} />
          <Route path="/insights/:pitcherId" element={<PitchInsights />} />
          <Route path="/enhanced-insights/:pitcherId" element={<EnhancedPitchInsights />} />
          <Route path="/scout" element={<ScoutScreen />} />
          <Route path="/team" element={<TeamManagementScreen />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <Navigation />
      </div>
    </HashRouter>
  )
}

export default App