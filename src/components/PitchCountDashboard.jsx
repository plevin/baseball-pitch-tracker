import React, { useEffect, useState } from 'react';
import { getPitchesByPitcher } from '../services/StorageService';

const PitchCountDashboard = ({ pitcherId, gameId }) => {
  const [pitchStats, setPitchStats] = useState({
    totalPitches: 0,
    pitchesThisGame: 0,
    pitchesPerInning: [],
    pitchesPerBatter: 0,
    strikePercentage: 0,
    projectedInningsRemaining: 0
  });

  useEffect(() => {
    const loadPitchData = () => {
      // Get all pitches for this pitcher in this game
      const allPitches = getPitchesByPitcher(pitcherId);
      const gamePitches = gameId ? allPitches.filter(pitch => pitch.gameId === gameId) : [];
      
      if (gamePitches.length === 0) {
        return;
      }
      
      // Calculate basic stats
      const totalPitches = gamePitches.length;
      
      // Calculate strikes and balls
      const strikes = gamePitches.filter(pitch => 
        pitch.result === 'strike' || 
        pitch.result === 'foul' || 
        pitch.result === 'swinging_strike' ||
        pitch.result === 'out'
      ).length;
      
      const strikePercentage = Math.round((strikes / totalPitches) * 100);
      
      // Calculate pitches per inning
      const inningMap = new Map();
      gamePitches.forEach(pitch => {
        const inningKey = `${pitch.isTop ? 'Top' : 'Bottom'}-${pitch.inning}`;
        if (!inningMap.has(inningKey)) {
          inningMap.set(inningKey, 0);
        }
        inningMap.set(inningKey, inningMap.get(inningKey) + 1);
      });
      
      const pitchesPerInning = Array.from(inningMap.entries()).map(([inning, count]) => ({
        inning,
        count
      }));
      
      // Calculate average pitches per inning
      const avgPitchesPerInning = totalPitches / pitchesPerInning.length;
      
      // Project innings remaining (based on 95 pitch limit)
      const pitchesRemaining = 95 - totalPitches;
      const projectedInningsRemaining = Math.floor(pitchesRemaining / avgPitchesPerInning);
      
      // Estimate pitches per batter (simplified)
      // This is a rough estimate - we don't track individual batters currently
      // Using a heuristic based on average plate appearance length
      const estimatedBatters = Math.ceil(totalPitches / 3.8);
      const pitchesPerBatter = (totalPitches / estimatedBatters).toFixed(1);
      
      setPitchStats({
        totalPitches,
        pitchesThisGame: totalPitches,
        pitchesPerInning,
        pitchesPerBatter,
        strikePercentage,
        projectedInningsRemaining
      });
    };
    
    loadPitchData();
  }, [pitcherId, gameId]);

  // Determine pitch count status color
  const getPitchCountColor = (count) => {
    if (count < 60) return 'bg-green-500'; // Green: Plenty of pitches left
    if (count < 80) return 'bg-yellow-500'; // Yellow: Approaching limit
    return 'bg-red-500'; // Red: Near limit
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="font-bold text-lg mb-3">Pitch Count Dashboard</h2>
      
      {/* Main Pitch Count Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl font-bold">
          {pitchStats.totalPitches}
          <span className="text-sm text-gray-500 ml-1">/ 95</span>
        </div>
        
        <div className="w-3/5 bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-full ${getPitchCountColor(pitchStats.totalPitches)}`}
            style={{ width: `${Math.min(100, (pitchStats.totalPitches / 95) * 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Pitch Efficiency Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-100 p-2 rounded">
          <div className="text-sm text-gray-600">Strike %</div>
          <div className="font-bold">{pitchStats.strikePercentage}%</div>
        </div>
        
        <div className="bg-gray-100 p-2 rounded">
          <div className="text-sm text-gray-600">Pitches/Batter</div>
          <div className="font-bold">{pitchStats.pitchesPerBatter}</div>
        </div>
      </div>
      
      {/* Innings & Projection */}
      <div className="mb-3">
        <h3 className="font-medium text-sm mb-1">Innings Breakdown</h3>
        <div className="flex flex-wrap gap-2">
          {pitchStats.pitchesPerInning.map((inning, index) => (
            <div key={index} className="bg-blue-100 px-2 py-1 rounded text-sm">
              {inning.inning}: {inning.count}
            </div>
          ))}
        </div>
      </div>
      
      {/* Projection */}
      <div className="border-t pt-3 mt-3">
        <div className="text-sm">
          <span className="font-medium">Projected Innings Remaining:</span> {' '}
          <span className={pitchStats.projectedInningsRemaining <= 1 ? 'text-red-600 font-bold' : 'font-bold'}>
            {pitchStats.projectedInningsRemaining}
          </span>
        </div>
        
        {pitchStats.projectedInningsRemaining <= 1 && (
          <div className="text-sm text-red-600 mt-1">
            Consider warming up next pitcher
          </div>
        )}
      </div>
    </div>
  );
};

export default PitchCountDashboard;