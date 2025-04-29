import React, { useState, useEffect } from 'react';
import { getPitchesByPitcher } from '../services/StorageService';

const InningStrategyGuide = ({ pitcherId, gameId }) => {
  const [inningData, setInningData] = useState({
    inningBreakdown: [],
    firstTimeThrough: { pitchType: '', percentage: 0 },
    secondTimeThrough: { pitchType: '', percentage: 0 },
    fatigueIndicators: [],
    currentInning: 0
  });

  useEffect(() => {
    const analyzeInningData = () => {
      // Get all pitches for this pitcher
      const allPitches = getPitchesByPitcher(pitcherId);
      
      // Filter for current game if gameId is provided
      const gamePitches = gameId 
        ? allPitches.filter(pitch => pitch.gameId === gameId)
        : allPitches;
      
      if (gamePitches.length === 0) {
        return;
      }
      
      // Get the current/latest inning
      const currentInning = Math.max(...gamePitches.map(pitch => pitch.inning));
      
      // Group pitches by inning
      const inningMap = {};
      for (let i = 1; i <= 7; i++) {
        const pitchesInInning = gamePitches.filter(pitch => pitch.inning === i);
        if (pitchesInInning.length > 0) {
          inningMap[i] = pitchesInInning;
        }
      }
      
      // Analyze each inning
      const inningBreakdown = [];
      
      Object.entries(inningMap).forEach(([inning, pitches]) => {
        // Calculate total pitches
        const totalPitches = pitches.length;
        
        // Calculate strikes and balls
        const strikes = pitches.filter(pitch => 
          pitch.result === 'strike' || 
          pitch.result === 'foul' || 
          pitch.result === 'swinging_strike' ||
          pitch.result === 'out'
        ).length;
        
        const strikePercentage = Math.round((strikes / totalPitches) * 100);
        
        // Calculate pitch types
        const types = pitches.reduce((acc, pitch) => {
          acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
          return acc;
        }, {});
        
        const typePercentages = {};
        Object.keys(types).forEach(type => {
          typePercentages[type] = Math.round((types[type] / totalPitches) * 100);
        });
        
        // Get dominant pitch type
        const dominantType = Object.entries(typePercentages)
          .sort((a, b) => b[1] - a[1])[0];
        
        inningBreakdown.push({
          inning: parseInt(inning),
          pitches: totalPitches,
          strikePercentage,
          dominantType: dominantType[0],
          dominantPercentage: dominantType[1],
          typeBreakdown: typePercentages
        });
      });
      
      // Sort by inning
      inningBreakdown.sort((a, b) => a.inning - b.inning);
      
      // First time through lineup vs. second time
      // This is a simplified approximation since we don't track individual batters
      // Assuming first ~9 batters are first time through lineup
      const estimatedFirstTime = gamePitches.slice(0, Math.min(25, gamePitches.length));
      const estimatedSecondTime = gamePitches.length > 25 ? gamePitches.slice(25) : [];
      
      // Calculate pitch type percentages for first time through
      let firstTimeThrough = { pitchType: 'N/A', percentage: 0 };
      
      if (estimatedFirstTime.length > 0) {
        const firstTimeTypes = estimatedFirstTime.reduce((acc, pitch) => {
          acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
          return acc;
        }, {});
        
        const dominant = Object.entries(firstTimeTypes)
          .sort((a, b) => b[1] - a[1])[0];
        
        firstTimeThrough = {
          pitchType: dominant[0],
          percentage: Math.round((dominant[1] / estimatedFirstTime.length) * 100)
        };
      }
      
      // Calculate pitch type percentages for second time through
      let secondTimeThrough = { pitchType: 'N/A', percentage: 0 };
      
      if (estimatedSecondTime.length > 0) {
        const secondTimeTypes = estimatedSecondTime.reduce((acc, pitch) => {
          acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
          return acc;
        }, {});
        
        const dominant = Object.entries(secondTimeTypes)
          .sort((a, b) => b[1] - a[1])[0];
        
        secondTimeThrough = {
          pitchType: dominant[0],
          percentage: Math.round((dominant[1] / estimatedSecondTime.length) * 100)
        };
      }
      
      // Calculate fatigue indicators
      const fatigueIndicators = [];
      
      // Check for declining strike percentage
      if (inningBreakdown.length >= 2) {
        const lastTwoInnings = inningBreakdown.slice(-2);
        const [secondLast, last] = lastTwoInnings;
        
        if (last.strikePercentage < secondLast.strikePercentage - 10) {
          fatigueIndicators.push({
            type: 'Strike Percentage',
            detail: `Dropped from ${secondLast.strikePercentage}% to ${last.strikePercentage}%`,
            severity: 'medium'
          });
        }
        
        // Check for increasing pitches per inning
        if (last.pitches > secondLast.pitches + 5) {
          fatigueIndicators.push({
            type: 'Pitch Count',
            detail: `Increased from ${secondLast.pitches} to ${last.pitches} pitches per inning`,
            severity: 'high'
          });
        }
        
        // Check for pitch mix changes
        const pitchTypes = Object.keys({...secondLast.typeBreakdown, ...last.typeBreakdown});
        for (const type of pitchTypes) {
          const prevPct = secondLast.typeBreakdown[type] || 0;
          const currentPct = last.typeBreakdown[type] || 0;
          
          if (Math.abs(currentPct - prevPct) > 15) {
            fatigueIndicators.push({
              type: 'Pitch Selection',
              detail: `${type} usage changed from ${prevPct}% to ${currentPct}%`,
              severity: 'medium'
            });
          }
        }
      }
      
      // Set all data
      setInningData({
        inningBreakdown,
        firstTimeThrough,
        secondTimeThrough,
        fatigueIndicators,
        currentInning
      });
    };
    
    analyzeInningData();
  }, [pitcherId, gameId]);

  const getPitchTypeColor = (pitchType) => {
    return pitchType === 'fastball' ? 'text-red-600' : 'text-green-600';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="font-bold text-lg mb-3">Inning-by-Inning Strategy</h2>
      
      {/* Inning Progression */}
      <div className="mb-4">
        <h3 className="font-medium mb-2">Inning Breakdown</h3>
        <div className="overflow-x-auto">
          <div className="flex space-x-2 pb-1">
            {inningData.inningBreakdown.map((inning) => (
              <div 
                key={inning.inning} 
                className={`w-20 p-2 border rounded text-center flex-shrink-0 ${
                  inning.inning === inningData.currentInning ? 'border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="font-bold">Inning {inning.inning}</div>
                <div className={`font-medium ${getPitchTypeColor(inning.dominantType)}`}>
                  {inning.dominantType} ({inning.dominantPercentage}%)
                </div>
                <div className="text-xs text-gray-500">
                  {inning.pitches} pitches
                </div>
                <div className="text-xs">
                  {inning.strikePercentage}% strikes
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* First vs Second Time Through */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-2 bg-gray-100 rounded">
          <div className="text-sm font-medium mb-1">First Time Through</div>
          <div className={`font-bold ${getPitchTypeColor(inningData.firstTimeThrough.pitchType)}`}>
            {inningData.firstTimeThrough.pitchType}
          </div>
          <div className="text-xs">
            {inningData.firstTimeThrough.percentage}% of pitches
          </div>
        </div>
        
        <div className="p-2 bg-gray-100 rounded">
          <div className="text-sm font-medium mb-1">Second Time Through</div>
          <div className={`font-bold ${getPitchTypeColor(inningData.secondTimeThrough.pitchType)}`}>
            {inningData.secondTimeThrough.pitchType}
          </div>
          <div className="text-xs">
            {inningData.secondTimeThrough.percentage}% of pitches
          </div>
        </div>
      </div>
      
      {/* Fatigue Indicators */}
      <div className="mb-3">
        <h3 className="font-medium mb-2">Fatigue Indicators</h3>
        
        {inningData.fatigueIndicators.length === 0 ? (
          <div className="text-sm text-gray-500">No fatigue indicators detected</div>
        ) : (
          <div className="space-y-2">
            {inningData.fatigueIndicators.map((indicator, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                <div className="font-medium">{indicator.type}</div>
                <div className={`text-sm ${getSeverityColor(indicator.severity)}`}>
                  {indicator.detail}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Coaching Strategy */}
      <div className="p-3 bg-blue-50 rounded">
        <h3 className="font-medium mb-1">Coaching Tips</h3>
        <ul className="list-disc pl-4 space-y-1 text-sm">
          {inningData.firstTimeThrough.pitchType !== inningData.secondTimeThrough.pitchType && 
           inningData.firstTimeThrough.pitchType !== 'N/A' && 
           inningData.secondTimeThrough.pitchType !== 'N/A' && (
            <li>
              Pitcher switches from <span className={getPitchTypeColor(inningData.firstTimeThrough.pitchType)}>
                {inningData.firstTimeThrough.pitchType}</span> to <span className={getPitchTypeColor(inningData.secondTimeThrough.pitchType)}>
                {inningData.secondTimeThrough.pitchType}</span> as game progresses
            </li>
          )}
          
          {inningData.fatigueIndicators.length > 0 && (
            <li className="text-red-600 font-medium">
              Showing fatigue signs - consider more patient approach
            </li>
          )}
          
          {inningData.inningBreakdown.length > 0 && 
           inningData.inningBreakdown[inningData.inningBreakdown.length - 1].strikePercentage < 60 && (
            <li>
              Struggling with control in current inning - take until you get a strike
            </li>
          )}
          
          {inningData.currentInning >= 4 && (
            <li>
              Pitcher is {inningData.fatigueIndicators.length > 0 
                ? 'showing fatigue - look for mistakes in the zone' 
                : 'holding velocity well - maintain approach'}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default InningStrategyGuide;