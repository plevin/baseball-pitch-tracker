import React, { useState, useEffect } from 'react';
import { getPitchesByPitcher, getPitcherById } from '../services/StorageService';

const CoachDashboard = ({ pitcherId, gameId }) => {
  const [pitcher, setPitcher] = useState(null);
  const [insights, setInsights] = useState({
    pitchCount: 0,
    strikePercentage: 0,
    keyTendency: { type: '', percentage: 0 },
    batterHandedness: { left: '', right: '' },
    fatigueWarning: 'none',
    recentTrend: '',
    keyCountTendency: { count: '', pitch: '' },
    pitchesPerInning: []
  });

  useEffect(() => {
    const loadPitcherData = async () => {
      const pitcherData = getPitcherById(pitcherId);
      setPitcher(pitcherData);
    };
    
    const generateInsights = () => {
      // Get all pitches for this pitcher
      const allPitches = getPitchesByPitcher(pitcherId);
      
      // Filter for current game if gameId is provided
      const gamePitches = gameId 
        ? allPitches.filter(pitch => pitch.gameId === gameId)
        : allPitches;
      
      if (gamePitches.length === 0) {
        return;
      }
      
      // Sort pitches by timestamp
      gamePitches.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Calculate basic stats
      const totalPitches = gamePitches.length;
      
      // Calculate strikes percentage
      const strikes = gamePitches.filter(pitch => 
        pitch.result === 'strike' || 
        pitch.result === 'foul' || 
        pitch.result === 'swinging_strike' ||
        pitch.result === 'out'
      ).length;
      
      const strikePercentage = Math.round((strikes / totalPitches) * 100);
      
      // Calculate pitch types
      const pitchTypes = gamePitches.reduce((acc, pitch) => {
        acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
        return acc;
      }, {});
      
      // Find dominant pitch type
      const sortedTypes = Object.entries(pitchTypes)
        .sort((a, b) => b[1] - a[1]);
      
      const keyTendency = {
        type: sortedTypes[0][0],
        percentage: Math.round((sortedTypes[0][1] / totalPitches) * 100)
      };
      
      // Calculate pitches per inning
      const inningPitches = {};
      gamePitches.forEach(pitch => {
        const inning = pitch.inning;
        inningPitches[inning] = (inningPitches[inning] || 0) + 1;
      });
      
      const pitchesPerInning = Object.entries(inningPitches)
        .map(([inning, count]) => ({ inning: parseInt(inning), count }))
        .sort((a, b) => a.inning - b.inning);
      
      // Batter handedness analysis
      const leftBatters = gamePitches.filter(pitch => pitch.batterSide === 'L');
      const rightBatters = gamePitches.filter(pitch => pitch.batterSide === 'R');
      
      // Calculate pitch types by batter side
      const leftTypes = leftBatters.reduce((acc, pitch) => {
        acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
        return acc;
      }, {});
      
      const rightTypes = rightBatters.reduce((acc, pitch) => {
        acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
        return acc;
      }, {});
      
      let vsLeft = '';
      if (leftBatters.length > 0) {
        const dominantLeft = Object.entries(leftTypes)
          .sort((a, b) => b[1] - a[1])[0][0];
        vsLeft = dominantLeft;
      }
      
      let vsRight = '';
      if (rightBatters.length > 0) {
        const dominantRight = Object.entries(rightTypes)
          .sort((a, b) => b[1] - a[1])[0][0];
        vsRight = dominantRight;
      }
      
      // Simple fatigue detection
      let fatigueWarning = 'none';
      
      // Check recent pitches for strike percentage
      const recentPitches = gamePitches.slice(-15);
      const recentStrikes = recentPitches.filter(pitch => 
        pitch.result === 'strike' || 
        pitch.result === 'foul' || 
        pitch.result === 'swinging_strike' ||
        pitch.result === 'out'
      ).length;
      
      const recentStrikePercentage = Math.round((recentStrikes / recentPitches.length) * 100);
      
      // Check earlier pitches for comparison
      const earlierPitches = gamePitches.slice(0, 15);
      const earlierStrikes = earlierPitches.filter(pitch => 
        pitch.result === 'strike' || 
        pitch.result === 'foul' || 
        pitch.result === 'swinging_strike' ||
        pitch.result === 'out'
      ).length;
      
      const earlierStrikePercentage = Math.round((earlierStrikes / earlierPitches.length) * 100);
      
      let recentTrend = '';
      
      if (recentStrikePercentage < earlierStrikePercentage - 15) {
        fatigueWarning = 'high';
        recentTrend = `Strike % dropped from ${earlierStrikePercentage}% to ${recentStrikePercentage}%`;
      } else if (recentStrikePercentage < earlierStrikePercentage - 10) {
        fatigueWarning = 'medium';
        recentTrend = `Strike % dropped from ${earlierStrikePercentage}% to ${recentStrikePercentage}%`;
      } else if (recentStrikePercentage < earlierStrikePercentage - 5) {
        fatigueWarning = 'low';
        recentTrend = `Strike % dropped slightly from ${earlierStrikePercentage}% to ${recentStrikePercentage}%`;
      } else {
        recentTrend = `Strike % steady (${recentStrikePercentage}%)`;
      }
      
      // Key count analysis
      const countMap = {};
      
      gamePitches.forEach(pitch => {
        if (!countMap[pitch.count]) {
          countMap[pitch.count] = {};
        }
        
        countMap[pitch.count][pitch.pitchType] = (countMap[pitch.count][pitch.pitchType] || 0) + 1;
      });
      
      // Find a key count
      let keyCountTendency = { count: '', pitch: '' };
      
      const keyCounts = ['1-0', '0-1', '2-0', '0-2', '1-1', '2-1', '1-2', '3-1', '3-2'];
      
      for (const count of keyCounts) {
        if (countMap[count]) {
          const pitchesInCount = Object.values(countMap[count]).reduce((sum, val) => sum + val, 0);
          
          if (pitchesInCount >= 3) {
            const dominantPitch = Object.entries(countMap[count])
              .sort((a, b) => b[1] - a[1])[0];
            
            const percentage = Math.round((dominantPitch[1] / pitchesInCount) * 100);
            
            if (percentage >= 70) {
              keyCountTendency = {
                count,
                pitch: dominantPitch[0],
                percentage
              };
              break;
            }
          }
        }
      }
      
      setInsights({
        pitchCount: totalPitches,
        strikePercentage,
        keyTendency,
        batterHandedness: { 
          left: vsLeft || 'N/A',
          right: vsRight || 'N/A'
        },
        fatigueWarning,
        recentTrend,
        keyCountTendency,
        pitchesPerInning
      });
    };
    
    loadPitcherData();
    generateInsights();
  }, [pitcherId, gameId]);

  const getWarningColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-yellow-300';
      default: return 'bg-green-500';
    }
  };

  const getWarningText = (level) => {
    switch (level) {
      case 'high': return 'High Fatigue Warning';
      case 'medium': return 'Medium Fatigue Warning';
      case 'low': return 'Low Fatigue Warning';
      default: return 'No Fatigue Detected';
    }
  };

  if (!pitcher) {
    return <div className="p-4 bg-white rounded shadow">Loading pitcher data...</div>;
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Coach's Quick Dashboard</h2>
        <div className="text-sm text-gray-500">In-Game Insights</div>
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Pitch Count & Strike Percentage */}
        <div className="bg-gray-100 p-3 rounded">
          <div className="font-medium text-sm mb-1">Pitch Count</div>
          <div className="text-2xl font-bold">{insights.pitchCount}</div>
          <div className="text-sm mt-1">
            Strike %: <span className="font-medium">{insights.strikePercentage}%</span>
          </div>
        </div>
        
        {/* Key Pitch Tendency */}
        <div className="bg-gray-100 p-3 rounded">
          <div className="font-medium text-sm mb-1">Key Tendency</div>
          <div className="text-xl font-bold">
            {insights.keyTendency.type} 
            <span className="text-sm font-normal ml-1">
              ({insights.keyTendency.percentage}%)
            </span>
          </div>
          <div className="text-sm mt-1">
            {insights.keyTendency.percentage > 65 ? 
              'Heavily favored pitch' : 
              'Mixed approach'}
          </div>
        </div>
      </div>
      
      {/* Fatigue Warning */}
      <div className={`p-3 rounded mb-4 ${
        insights.fatigueWarning === 'high' ? 'bg-red-100' :
        insights.fatigueWarning === 'medium' ? 'bg-yellow-100' :
        insights.fatigueWarning === 'low' ? 'bg-yellow-50' :
        'bg-green-50'
      }`}>
        <div className="flex items-center mb-1">
          <div className={`w-3 h-3 rounded-full mr-2 ${getWarningColor(insights.fatigueWarning)}`}></div>
          <span className="font-medium">{getWarningText(insights.fatigueWarning)}</span>
        </div>
        <div className="text-sm">
          {insights.recentTrend}
        </div>
      </div>
      
      {/* Key Insights Box */}
      <div className="bg-blue-50 p-3 rounded mb-4">
        <h3 className="font-medium mb-2">Key Insights</h3>
        
        <div className="space-y-2 text-sm">
          {/* Batter Handedness */}
          <div className="flex justify-between">
            <span>vs Left:</span>
            <span className="font-medium">{insights.batterHandedness.left}</span>
          </div>
          
          <div className="flex justify-between">
            <span>vs Right:</span>
            <span className="font-medium">{insights.batterHandedness.right}</span>
          </div>
          
          {/* Key Count */}
          {insights.keyCountTendency.count && (
            <div className="flex justify-between text-red-600 font-medium">
              <span>On {insights.keyCountTendency.count} count:</span>
              <span>{insights.keyCountTendency.pitch} ({insights.keyCountTendency.percentage}%)</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button 
          className="flex-1 bg-blue-600 text-white p-2 rounded text-center"
          onClick={() => window.print()}
        >
          Print Report
        </button>
        <button 
          className="flex-1 bg-gray-200 p-2 rounded text-center"
          onClick={() => {
            // Would open detailed view in the real app
            alert('This would open the detailed view');
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default CoachDashboard;