import React, { useState, useEffect } from 'react';
import { getPitchesByPitcher } from '../services/StorageService';

const BatterAdjustmentCards = ({ pitcherId, gameId }) => {
  const [currentBatterSide, setCurrentBatterSide] = useState('R');
  const [batterAdvice, setBatterAdvice] = useState({
    general: {
      strategy: '',
      confidence: 0
    },
    firstPitch: {
      advice: '',
      confidence: 0
    },
    withTwoStrikes: {
      advice: '',
      confidence: 0
    },
    keyCount: {
      count: '',
      advice: '',
      confidence: 0
    }
  });

  useEffect(() => {
    const analyzePitcher = () => {
      // Get all pitches for this pitcher
      const allPitches = getPitchesByPitcher(pitcherId);
      
      // Filter for current game if gameId is provided
      const relevantPitches = gameId 
        ? allPitches.filter(pitch => pitch.gameId === gameId)
        : allPitches;
      
      if (relevantPitches.length === 0) {
        return;
      }
      
      // Filter for current batter side
      const batterPitches = relevantPitches.filter(pitch => 
        pitch.batterSide === currentBatterSide
      );
      
      if (batterPitches.length === 0) {
        // No data for this batter side, use all pitches
        generateBatterAdvice(relevantPitches);
      } else {
        // Generate advice based on batter-specific data
        generateBatterAdvice(batterPitches);
      }
    };
    
    const generateBatterAdvice = (pitches) => {
      // Calculate overall pitch type percentages
      const pitchTypes = pitches.reduce((acc, pitch) => {
        acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
        return acc;
      }, {});
      
      const totalPitches = pitches.length;
      const pitchTypePercentages = {};
      Object.keys(pitchTypes).forEach(type => {
        pitchTypePercentages[type] = Math.round((pitchTypes[type] / totalPitches) * 100);
      });
      
      // Find dominant pitch type
      const dominantPitch = Object.entries(pitchTypePercentages)
        .sort((a, b) => b[1] - a[1])
        .map(([type, pct]) => ({ type, pct }))[0];
      
      // General strategy based on pitch mix
      let generalStrategy = '';
      let generalConfidence = 0;
      
      if (dominantPitch.pct > 75) {
        // Very dominant pitch type
        generalStrategy = `Look for ${dominantPitch.type} - pitcher relies heavily on it`;
        generalConfidence = 90;
      } else if (dominantPitch.pct > 60) {
        // Somewhat dominant
        generalStrategy = `Expect ${dominantPitch.type} but be ready to adjust`;
        generalConfidence = 75;
      } else {
        // Mixed approach
        generalStrategy = 'Pitcher mixes pitches well - look for patterns by count';
        generalConfidence = 60;
      }
      
      // First pitch analysis
      const firstPitches = pitches.filter(pitch => pitch.count === '0-0');
      let firstPitchAdvice = '';
      let firstPitchConfidence = 0;
      
      if (firstPitches.length >= 3) {
        const firstPitchTypes = firstPitches.reduce((acc, pitch) => {
          acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
          return acc;
        }, {});
        
        const dominantFirstPitch = Object.entries(firstPitchTypes)
          .sort((a, b) => b[1] - a[1])
          .map(([type, count]) => ({ 
            type, 
            pct: Math.round((count / firstPitches.length) * 100) 
          }))[0];
        
        if (dominantFirstPitch.pct > 70) {
          firstPitchAdvice = `Be aggressive - expect ${dominantFirstPitch.type} first pitch`;
          firstPitchConfidence = 85;
        } else if (dominantFirstPitch.pct > 55) {
          firstPitchAdvice = `Look for ${dominantFirstPitch.type} but be selective`;
          firstPitchConfidence = 70;
        } else {
          firstPitchAdvice = 'Mixed first pitch approach - focus on middle of zone';
          firstPitchConfidence = 60;
        }
      } else {
        firstPitchAdvice = 'Limited data on first pitches - be ready for anything';
        firstPitchConfidence = 50;
      }
      
      // Two strike approach
      const twoStrikePitches = pitches.filter(pitch => {
        const [, strikes] = pitch.count.split('-').map(Number);
        return strikes === 2;
      });
      
      let twoStrikeAdvice = '';
      let twoStrikeConfidence = 0;
      
      if (twoStrikePitches.length >= 3) {
        const twoStrikeTypes = twoStrikePitches.reduce((acc, pitch) => {
          acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
          return acc;
        }, {});
        
        const dominantTwoStrike = Object.entries(twoStrikeTypes)
          .sort((a, b) => b[1] - a[1])
          .map(([type, count]) => ({ 
            type, 
            pct: Math.round((count / twoStrikePitches.length) * 100) 
          }))[0];
        
        if (dominantTwoStrike.pct > 65) {
          twoStrikeAdvice = `Protect against ${dominantTwoStrike.type} with two strikes`;
          twoStrikeConfidence = 80;
        } else {
          twoStrikeAdvice = 'Shortened swing, protect the plate with two strikes';
          twoStrikeConfidence = 65;
        }
      } else {
        twoStrikeAdvice = 'Protect with two strikes - not enough data for specifics';
        twoStrikeConfidence = 50;
      }
      
      // Find a key count where pitcher has a strong tendency
      const countMap = {};
      const keyCounts = ['1-0', '0-1', '2-0', '0-2', '1-1', '2-1', '1-2', '3-1', '3-2'];
      
      keyCounts.forEach(count => {
        const pitchesForCount = pitches.filter(pitch => pitch.count === count);
        
        if (pitchesForCount.length >= 3) {
          const countTypes = pitchesForCount.reduce((acc, pitch) => {
            acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
            return acc;
          }, {});
          
          const dominantCountPitch = Object.entries(countTypes)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => ({ 
              type, 
              pct: Math.round((count / pitchesForCount.length) * 100) 
            }))[0];
          
          countMap[count] = {
            pitch: dominantCountPitch.type,
            percentage: dominantCountPitch.pct,
            total: pitchesForCount.length
          };
        }
      });
      
      // Find the count with the strongest tendency
      let keyCount = { count: '', advice: '', confidence: 0 };
      
      Object.entries(countMap).forEach(([count, data]) => {
        if (data.percentage > 65 && (data.percentage > keyCount.confidence || keyCount.confidence === 0)) {
          keyCount = {
            count,
            advice: `On ${count} count, look for ${data.pitch}`,
            confidence: data.percentage
          };
        }
      });
      
      if (keyCount.count === '') {
        keyCount = {
          count: 'various',
          advice: 'No strong count-based tendencies detected',
          confidence: 50
        };
      }
      
      // Set the advice
      setBatterAdvice({
        general: {
          strategy: generalStrategy,
          confidence: generalConfidence
        },
        firstPitch: {
          advice: firstPitchAdvice,
          confidence: firstPitchConfidence
        },
        withTwoStrikes: {
          advice: twoStrikeAdvice,
          confidence: twoStrikeConfidence
        },
        keyCount
      });
    };
    
    analyzePitcher();
  }, [pitcherId, gameId, currentBatterSide]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'bg-green-100 border-green-500';
    if (confidence >= 65) return 'bg-yellow-100 border-yellow-500';
    return 'bg-gray-100 border-gray-500';
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-lg">Batter Approach Cards</h2>
        
        <div className="flex border rounded overflow-hidden">
          <button
            className={`px-3 py-1 ${currentBatterSide === 'L' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setCurrentBatterSide('L')}
          >
            Left
          </button>
          <button
            className={`px-3 py-1 ${currentBatterSide === 'R' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setCurrentBatterSide('R')}
          >
            Right
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* General Approach Card */}
        <div className={`p-3 border-l-4 rounded ${getConfidenceColor(batterAdvice.general.confidence)}`}>
          <h3 className="font-bold mb-1">Overall Approach</h3>
          <p>{batterAdvice.general.strategy}</p>
          <div className="mt-2 text-xs text-gray-500">
            Confidence: {batterAdvice.general.confidence}%
          </div>
        </div>
        
        {/* First Pitch Card */}
        <div className={`p-3 border-l-4 rounded ${getConfidenceColor(batterAdvice.firstPitch.confidence)}`}>
          <h3 className="font-bold mb-1">First Pitch</h3>
          <p>{batterAdvice.firstPitch.advice}</p>
          <div className="mt-2 text-xs text-gray-500">
            Confidence: {batterAdvice.firstPitch.confidence}%
          </div>
        </div>
        
        {/* Two Strikes Card */}
        <div className={`p-3 border-l-4 rounded ${getConfidenceColor(batterAdvice.withTwoStrikes.confidence)}`}>
          <h3 className="font-bold mb-1">With Two Strikes</h3>
          <p>{batterAdvice.withTwoStrikes.advice}</p>
          <div className="mt-2 text-xs text-gray-500">
            Confidence: {batterAdvice.withTwoStrikes.confidence}%
          </div>
        </div>
        
        {/* Key Count Card */}
        <div className={`p-3 border-l-4 rounded ${getConfidenceColor(batterAdvice.keyCount.confidence)}`}>
          <h3 className="font-bold mb-1">Key Count: {batterAdvice.keyCount.count}</h3>
          <p>{batterAdvice.keyCount.advice}</p>
          <div className="mt-2 text-xs text-gray-500">
            Confidence: {batterAdvice.keyCount.confidence}%
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Advice is based on {currentBatterSide === 'L' ? 'left' : 'right'}-handed batter analysis.</p>
        <p>Higher confidence (green) means stronger tendencies detected.</p>
      </div>
    </div>
  );
};

export default BatterAdjustmentCards;