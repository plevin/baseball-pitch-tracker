// Service for generating actionable coaching insights for youth baseball
import { analyzePitcher } from './AnalyticsService';

/**
 * Generate actionable coaching advice based on pitcher analysis
 * @param {Array} pitches - Array of pitch objects for analysis
 * @returns {Object} - Object containing various coaching insights 
 */
export const generateCoachingAdvice = (pitches) => {
  if (!pitches || pitches.length === 0) {
    return {
      hasData: false,
      message: 'No pitch data available for analysis'
    };
  }
  
  // First get the basic pitcher analysis
  const pitcherAnalysis = analyzePitcher(pitches);
  
  if (!pitcherAnalysis.hasData) {
    return {
      hasData: false,
      message: 'Analysis failed to generate insights'
    };
  }
  
  // Generate coaching advice for batters
  const batterAdvice = generateBatterAdvice(pitcherAnalysis);
  
  // Generate pitcher management advice
  const pitcherManagement = generatePitcherManagement(pitcherAnalysis, pitches);
  
  // Generate defensive positioning advice
  const defensiveAdvice = generateDefensiveAdvice(pitcherAnalysis, pitches);
  
  // Return complete coaching package
  return {
    hasData: true,
    batterAdvice,
    pitcherManagement,
    defensiveAdvice,
    gameStrategy: generateGameStrategy(pitcherAnalysis, pitches),
    inGameAdjustments: generateInGameAdjustments(pitcherAnalysis, pitches)
  };
};

/**
 * Generate advice for batters facing this pitcher
 */
const generateBatterAdvice = (analysis) => {
  const advice = {
    general: '',
    firstPitch: '',
    twoStrikes: '',
    keyCount: { count: '', advice: '' }
  };
  
  // General approach
  if (analysis.pitchTypePercentages) {
    const dominantPitch = Object.entries(analysis.pitchTypePercentages)
      .sort((a, b) => b[1] - a[1])[0];
      
    if (dominantPitch[1] > 70) {
      advice.general = `Look for ${dominantPitch[0]} (${dominantPitch[1]}% of pitches)`;
    } else if (dominantPitch[1] > 55) {
      advice.general = `Expect ${dominantPitch[0]} but be ready to adjust`;
    } else {
      advice.general = `Mixed approach - focus on good pitch selection`;
    }
  }
  
  // First pitch advice
  if (analysis.firstPitchPercentages) {
    const firstPitchDominant = Object.entries(analysis.firstPitchPercentages)
      .sort((a, b) => b[1] - a[1])[0];
      
    if (firstPitchDominant[1] > 65) {
      advice.firstPitch = `Aggressive on first pitch - expect ${firstPitchDominant[0]}`;
    } else {
      advice.firstPitch = `Take first pitch - mixed approach`;
    }
  }
  
  // Two strikes approach
  if (analysis.countMatrix && analysis.countMatrix['0-2'] && analysis.countMatrix['1-2']) {
    const twoStrikeCounts = ['0-2', '1-2', '2-2'];
    let twoStrikePitches = {};
    
    twoStrikeCounts.forEach(count => {
      if (analysis.countMatrix[count]) {
        Object.entries(analysis.countMatrix[count].types).forEach(([type, pct]) => {
          twoStrikePitches[type] = (twoStrikePitches[type] || 0) + pct;
        });
      }
    });
    
    if (Object.keys(twoStrikePitches).length > 0) {
      const dominantTwoStrike = Object.entries(twoStrikePitches)
        .sort((a, b) => b[1] - a[1])[0];
        
      advice.twoStrikes = `Protect against ${dominantTwoStrike[0]} with two strikes`;
    } else {
      advice.twoStrikes = `Shorten swing with two strikes`;
    }
  }
  
  // Key count advice
  if (analysis.countMatrix) {
    const keyCounts = ['1-0', '2-0', '3-1', '0-1', '0-2'];
    
    for (const count of keyCounts) {
      if (analysis.countMatrix[count] && analysis.countMatrix[count].types) {
        const dominantType = Object.entries(analysis.countMatrix[count].types)
          .sort((a, b) => b[1] - a[1])[0];
          
        if (dominantType[1] > 65) {
          advice.keyCount = {
            count,
            advice: `On ${count} count: Look for ${dominantType[0]} (${dominantType[1]}%)`
          };
          break;
        }
      }
    }
  }
  
  return advice;
};

/**
 * Generate pitcher management advice
 */
const generatePitcherManagement = (analysis, pitches) => {
  // Initialize advice object
  const advice = {
    fatigueRisk: 'low',
    recommendations: [],
    warnings: []
  };
  
  // Check total pitch count
  const totalPitches = pitches.length;
  
  if (totalPitches > 70) {
    advice.fatigueRisk = 'high';
    advice.warnings.push('Approaching pitch limit - prepare relief pitcher');
  } else if (totalPitches > 50) {
    advice.fatigueRisk = 'medium';
    advice.recommendations.push('Begin considering relief options in next inning');
  }
  
  // Check recent control
  const recentPitches = pitches.slice(-10);
  const recentStrikes = recentPitches.filter(pitch => 
    pitch.result === 'strike' || 
    pitch.result === 'foul' || 
    pitch.result === 'swinging_strike' ||
    pitch.result === 'out'
  ).length;
  
  const recentStrikePercentage = Math.round((recentStrikes / recentPitches.length) * 100);
  
  if (recentStrikePercentage < 50) {
    advice.fatigueRisk = Math.max(advice.fatigueRisk === 'low' ? 1 : 2, 2); // Upgrade to at least medium
    advice.warnings.push('Control issues: Only ' + recentStrikePercentage + '% strikes in last 10 pitches');
  } else if (recentStrikePercentage < 60) {
    advice.recommendations.push('Monitor control - strike percentage dropping');
  }
  
  // Check for pattern changes
  // (This would be more sophisticated in a real implementation)
  
  return advice;
};

/**
 * Generate defensive positioning advice
 */
const generateDefensiveAdvice = (analysis, pitches) => {
  // For youth baseball, simplified defensive advice based on pitch tendencies
  return {
    recommendations: [
      'Position middle infielders straight up (not expecting advanced pull/oppo tendencies at this age)',
      analysis.pitchTypePercentages && analysis.pitchTypePercentages.fastball > 60 
        ? 'Outfielders slightly deeper - high fastball percentage increases likelihood of hard contact'
        : 'Outfielders at medium depth - mixed pitch selection'
    ]
  };
};

/**
 * Generate overall game strategy advice
 */
const generateGameStrategy = (analysis, pitches) => {
  const strategy = {
    overall: '',
    strengths: [],
    weaknesses: []
  };
  
  // Determine overall pitch quality
  if (analysis.resultPercentages && analysis.resultPercentages.strike) {
    const strikePercentage = analysis.resultPercentages.strike;
    
    if (strikePercentage > 65) {
      strategy.overall = 'High-strike pitcher - emphasize strike zone discipline';
      strategy.strengths.push('Good control');
    } else if (strikePercentage < 55) {
      strategy.overall = 'Control issues - take until you get a strike';
      strategy.weaknesses.push('Inconsistent control');
    } else {
      strategy.overall = 'Average control - normal approach';
    }
  }
  
  // Check for pitch dominance
  if (analysis.pitchTypePercentages) {
    const dominantPitch = Object.entries(analysis.pitchTypePercentages)
      .sort((a, b) => b[1] - a[1])[0];
      
    if (dominantPitch[1] > 70) {
      strategy.weaknesses.push(`Heavy reliance on ${dominantPitch[0]}`);
    }
  }
  
  return strategy;
};

/**
 * Generate in-game adjustments advice
 */
const generateInGameAdjustments = (analysis, pitches) => {
  // Analyze if pitcher adjusts during the game
  
  // Split pitches into first half and second half
  const halfway = Math.floor(pitches.length / 2);
  const firstHalf = pitches.slice(0, halfway);
  const secondHalf = pitches.slice(halfway);
  
  // Calculate pitch mix in each half
  const getHalfMix = (halfPitches) => {
    const types = halfPitches.reduce((acc, pitch) => {
      acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
      return acc;
    }, {});
    
    const total = halfPitches.length;
    
    const percentages = {};
    Object.keys(types).forEach(type => {
      percentages[type] = Math.round((types[type] / total) * 100);
    });
    
    return percentages;
  };
  
  const firstHalfMix = getHalfMix(firstHalf);
  const secondHalfMix = getHalfMix(secondHalf);
  
  // Check for significant changes
  const adjustments = [];
  
  Object.keys({...firstHalfMix, ...secondHalfMix}).forEach(type => {
    const first = firstHalfMix[type] || 0;
    const second = secondHalfMix[type] || 0;
    
    if (Math.abs(first - second) >= 15) {
      if (second > first) {
        adjustments.push(`Increased ${type} usage from ${first}% to ${second}%`);
      } else {
        adjustments.push(`Decreased ${type} usage from ${first}% to ${second}%`);
      }
    }
  });
  
  return {
    adjustmentsMade: adjustments.length > 0,
    adjustments,
    recommendation: adjustments.length > 0 
      ? 'Pitcher makes adjustments during game - be ready to adapt your approach'
      : 'Consistent approach throughout game - stick with initial strategy'
  };
};

export default {
  generateCoachingAdvice
};