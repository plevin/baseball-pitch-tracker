import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
//import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GameSetup from './components/GameSetup';
import PitcherSelect from './components/PitcherSelect';
import PitchTracker from './components/PitchTracker';
import PitchInsights from './components/PitchInsights';
import Settings from './components/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/game" replace />} />
        <Route path="/game" element={<GameSetup />} />
        <Route path="/pitcher-select/:gameId" element={<PitcherSelect />} />
        <Route path="/track/:pitcherId" element={<PitchTracker />} />
        <Route path="/insights/:pitcherId" element={<PitchInsights />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
