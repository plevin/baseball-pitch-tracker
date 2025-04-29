import React, { useState, useEffect } from 'react';
import { getPitchesByPitcher } from '../services/StorageService';

const FatigueDetectionSystem = ({ pitcherId, gameId }) => {
  const [fatigueData, setFatigueData] = useState({
    fatigueScore: 0,
    indicators: [],
    trendData: {
      strikePercentage: [],
      velocity: [], // Simulated - we don't actually track velocity
      locationConsistency: [], // Simulated - we don't actually track exact location
      pitchMix: []
    },
    recommendation: '',
    warningLevel: 'none' // none, low, medium, high
  });

  useEffect(() => {
    const analyzeFatigue = () => {
      // Get all pitches for this pitcher in this game
      const allPitches = getPitchesByPitcher(pitcherId);
      const gamePitches = gameId 
        ? allPitches.filter(pitch => pitch.gameId === gameId)
        : allPitches;
      
      if (gamePitches.length < 10) {
        // Not enough data for meaningful analysis
        setFatigueData({
          fatigueScore: 0,
          indicators: [],
          trendData: {
            strikePercentage: [],
            velocity: [],
            locationConsistency: [],
            pitchMix: []
          },
          recommendation: 'Not enough pitches to analyze fatigue',
          warningLevel: 'none'
        });
        return;
      }
      
      // Sort pitches by timestamp
      gamePitches.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Split pitches into segments to analyze trends
      // (For a youth game with ~75 pitches, 15 pitch segments work well)
      const segmentSize = 15;
      const segments = [];
      
      for (let i = 0; i < gamePitches.length; i += segmentSize) {
        segments.push(gamePitches.slice(i, i + segmentSize));
      }
      
      // Calculate strike percentage for each segment
      const strikePercentageTrend = segments.map(segment => {
        const strikes = segment.filter(pitch => 
          pitch.result === 'strike' || 
          pitch.result === 'foul' || 
          pitch.result === 'swinging_strike' ||
          pitch.result === 'out'
        ).length;
        
        return Math.round((strikes / segment.length) * 100);
      });
      
      // Analyze pitch mix changes
      const pitchMixTrend = segments.map(segment => {
        const types = segment.reduce((acc, pitch) => {
          acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
          return acc;
        }, {});
        
        const mainType = Object.entries(types)
          .sort((a, b) => b[1] - a[1])[0][0];
        
        const mainTypePercentage = Math.round((types[mainType] / segment.length) * 100);
        
        return {
          mainType,
          percentage: mainTypePercentage
        };
      });
      
      // Simulate velocity trend (we don't actually track this)
      // For youth pitchers, velocity often drops 2-3 mph when fatigued
      const velocityTrend = [];
      let baseVelocity = 65; // Assuming a baseline for youth pitcher
      
      for (let i = 0; i < segments.length; i++) {
        // Slight natural decrease as game progresses
        const naturalDecrease = i * 0.5;
        
        // More significant decrease if strike percentage is dropping
        const strikeTrend = i > 0 
          ? strikePercentageTrend[i] - strikePercentageTrend[i-1] 
          : 0;
        
        const strikeImpact = strikeTrend < -5 ? Math.abs(strikeTrend) / 10 : 0;
        
        velocityTrend.push(Math.round(baseVelocity - naturalDecrease - strikeImpact));
      }
      
      // Simulate location consistency
      // (A percentage representing how consistent the pitcher's location is)
      const locationConsistencyTrend = [];
      let baseConsistency = 80; // Starting consistency percentage
      
      for (let i = 0; i < segments.length; i++) {
        // Natural decrease in consistency
        const naturalDecrease = i * 2;
        
        // More significant decrease if strike percentage is dropping
        const strikeTrend = i > 0 
          ? strikePercentageTrend[i] - strikePercentageTrend[i-1] 
          : 0;
        
        const strikeImpact = strikeTrend < 0 ? Math.abs(strikeTrend) : 0;
        
        // Calculate consistency but don't go below 40%
        const consistency = Math.max(40, Math.round(baseConsistency - naturalDecrease - strikeImpact));
        locationConsistencyTrend.push(consistency);
      }
      
      // Calculate overall fatigue indicators
      const indicators = [];
      let fatigueScore = 0;
      
      // Check strike percentage trend
      if (strikePercentageTrend.length >= 2) {
        const lastTwo = strikePercentageTrend.slice(-2);
        const difference = lastTwo[1] - lastTwo[0];
        
        if (difference <= -10) {
          indicators.push({
            type: 'Strike Percentage',
            severity: 'high',
            detail: `Dropped ${Math.abs(difference)}% in latest pitches`
          });
          fatigueScore += 3;
        } else if (difference <= -5) {
          indicators.push({
            type: 'Strike Percentage',
            severity: 'medium',
            detail: `Dropped ${Math.abs(difference)}% in latest pitches`
          });
          fatigueScore += 2;
        }
      }
      
      // Check velocity trend
      if (velocityTrend.length >= 2) {
        const startVelocity = velocityTrend[0];
        const currentVelocity = velocityTrend[velocityTrend.length - 1];
        const difference = currentVelocity - startVelocity;
        
        if (difference <= -3) {
          indicators.push({
            type: 'Velocity',
            severity: 'high',
            detail: `Down ${Math.abs(difference)} mph from start`
          });
          fatigueScore += 3;
        } else if (difference <= -2) {
          indicators.push({
            type: 'Velocity',
            severity: 'medium',
            detail: `Down ${Math.abs(difference)} mph from start`
          });
          fatigueScore += 2;
        }
      }
      
      // Check location consistency
      if (locationConsistencyTrend.length >= 2) {
        const startConsistency = locationConsistencyTrend[0];
        const currentConsistency = locationConsistencyTrend[locationConsistencyTrend.length - 1];
        const difference = currentConsistency - startConsistency;
        
        if (difference <= -20) {
          indicators.push({
            type: 'Location Consistency',
            severity: 'high',
            detail: `Down ${Math.abs(difference)}% from start`
          });
          fatigueScore += 3;
        } else if (difference <= -10) {
          indicators.push({
            type: 'Location Consistency',
            severity: 'medium',
            detail: `Down ${Math.abs(difference)}% from start`
          });
          fatigueScore += 2;
        }
      }
      
      // Check pitch mix changes
      if (pitchMixTrend.length >= 2) {
        const startMix = pitchMixTrend[0];
        const currentMix = pitchMixTrend[pitchMixTrend.length - 1];
        
        // Check if main pitch type changed
        if (startMix.mainType !== currentMix.mainType) {
          indicators.push({
            type: 'Pitch Selection',
            severity: 'medium',
            detail: `Switched from ${startMix.mainType} to ${currentMix.mainType}`
          });
          fatigueScore += 2;
        }
        
        // Or if percentage of main pitch decreased significantly
        else if (currentMix.percentage < startMix.percentage - 15) {
          indicators.push({
            type: 'Pitch Selection',
            severity: 'medium',
            detail: `${startMix.mainType} usage down ${startMix.percentage - currentMix.percentage}%`
          });
          fatigueScore += 1;
        }
      }
      
      // Check recent ball-to-strike ratio
      const recentPitches = gamePitches.slice(-10);
      const recentStrikes = recentPitches.filter(pitch => 
        pitch.result === 'strike' || 
        pitch.result === 'foul' || 
        pitch.result === 'swinging_strike' ||
        pitch.result === 'out'
      ).length;
      
      const recentStrikePercentage = Math.round((recentStrikes / recentPitches.length) * 100);
      
      if (recentStrikePercentage < 50) {
        indicators.push({
          type: 'Recent Control',
          severity: 'high',
          detail: `Only ${recentStrikePercentage}% strikes in last 10 pitches`
        });
        fatigueScore += 3;
      } else if (recentStrikePercentage < 60) {
        indicators.push({
          type: 'Recent Control',
          severity: 'medium',
          detail: `Only ${recentStrikePercentage}% strikes in last 10 pitches`
        });
        fatigueScore += 2;
      }
      
      // Determine overall warning level
      let warningLevel = 'none';
      if (fatigueScore >= 8) {
        warningLevel = 'high';
      } else if (fatigueScore >= 5) {
        warningLevel = 'medium';
      } else if (fatigueScore >= 3) {
        warningLevel = 'low';
      }
      
      // Generate recommendation
      let recommendation = '';
      switch (warningLevel) {
        case 'high':
          recommendation = 'Consider removing pitcher - multiple fatigue indicators present';
          break;
        case 'medium':
          recommendation = 'Watch closely - signs of fatigue are emerging';
          break;
        case 'low':
          recommendation = 'Monitor situation - early fatigue indicators present';
          break;
        default:
          recommendation = 'No significant fatigue detected';
      }
      
      // Set the state with all the calculated data
      setFatigueData({
        fatigueScore,
        indicators,
        trendData: {
          strikePercentage: strikePercentageTrend,
          velocity: velocityTrend,
          locationConsistency: locationConsistencyTrend,
          pitchMix: pitchMixTrend
        },
        recommendation,
        warningLevel
      });
    };
    
    analyzeFatigue();
  }, [pitcherId, gameId]);

  const getWarningColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-yellow-300';
      default: return 'bg-green-500';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 border-red-600';
      case 'medium': return 'text-yellow-600 border-yellow-600';
      default: return 'text-gray-600 border-gray-600';
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-lg">Fatigue Detection</h2>
        
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${getWarningColor(fatigueData.warningLevel)} mr-2`}></div>
          <span className="text-sm font-medium">
            {fatigueData.warningLevel === 'none' ? 'No Fatigue' : 
             `${fatigueData.warningLevel.charAt(0).toUpperCase() + fatigueData.warningLevel.slice(1)} Warning`}
          </span>
        </div>
      </div>
      
      {/* Fatigue Indicators */}
      <div className="mb-4">
        {fatigueData.indicators.length === 0 ? (
          <div className="p-3 bg-green-50 text-green-700 rounded">
            No fatigue indicators detected. Pitcher appears fresh.
          </div>
        ) : (
          <div className="space-y-2">
            {fatigueData.indicators.map((indicator, index) => (
              <div 
                key={index} 
                className={`p-2 border-l-4 rounded ${getSeverityColor(indicator.severity)}`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{indicator.type}</span>
                  <span className="text-sm">{indicator.detail}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Trends Overview */}
      {fatigueData.trendData.strikePercentage.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Performance Trends</h3>
          
          <div className="grid grid-cols-2 gap-2">
            {/* Strike Percentage Trend */}
            <div className="p-2 bg-gray-50 rounded">
              <div className="text-sm font-medium mb-1">Strike %</div>
              <div className="flex items-end h-10 space-x-1">
                {fatigueData.trendData.strikePercentage.map((value, i) => (
                  <div 
                    key={i}
                    className="bg-blue-500 rounded-t"
                    style={{ 
                      height: `${value}%`, 
                      width: `${100 / fatigueData.trendData.strikePercentage.length}%` 
                    }}
                  ></div>
                ))}
              </div>
              <div className="text-xs text-center mt-1">Time →</div>
            </div>
            
            {/* Velocity Trend (simulated) */}
            <div className="p-2 bg-gray-50 rounded">
              <div className="text-sm font-medium mb-1">Velocity</div>
              <div className="flex items-end h-10 space-x-1">
                {fatigueData.trendData.velocity.map((value, i) => {
                  const max = Math.max(...fatigueData.trendData.velocity);
                  const min = Math.min(...fatigueData.trendData.velocity);
                  const range = max - min || 1;
                  const height = ((value - min) / range) * 100;
                  
                  return (
                    <div 
                      key={i}
                      className="bg-red-500 rounded-t"
                      style={{ 
                        height: `${height}%`, 
                        width: `${100 / fatigueData.trendData.velocity.length}%` 
                      }}
                    ></div>
                  );
                })}
              </div>
              <div className="text-xs text-center mt-1">Time →</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Recommendation */}
      <div className={`p-3 rounded ${
        fatigueData.warningLevel === 'high' ? 'bg-red-100 text-red-800' :
        fatigueData.warningLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
        fatigueData.warningLevel === 'low' ? 'bg-yellow-50 text-yellow-800' :
        'bg-green-50 text-green-800'
      }`}>
        <h3 className="font-medium mb-1">Recommendation</h3>
        <p>{fatigueData.recommendation}</p>
        
        {fatigueData.warningLevel !== 'none' && (
          <div className="mt-2 text-sm">
            <span className="font-medium">Action Items:</span>
            <ul className="list-disc pl-5 mt-1">
              {fatigueData.warningLevel === 'high' && (
                <>
                  <li>Begin warming up relief pitcher immediately</li>
                  <li>Consider a mound visit to check pitcher</li>
                  <li>Be ready to make a change this inning</li>
                </>
              )}
              
              {fatigueData.warningLevel === 'medium' && (
                <>
                  <li>Start warming up relief pitcher</li>
                  <li>Monitor next 5-10 pitches closely</li>
                  <li>Look for mechanical changes</li>
                </>
              )}
              
              {fatigueData.warningLevel === 'low' && (
                <>
                  <li>Have relief pitcher start light warmup</li>
                  <li>Watch for additional fatigue signs</li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FatigueDetectionSystem;