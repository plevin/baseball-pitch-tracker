// Services for analyzing pitch data and generating insights

/**
 * Generate comprehensive insights for a pitcher
 * @param {Array} pitches - Array of pitch objects for the pitcher
 * @returns {Object} - Object containing various insights and statistics
 */
export const analyzePitcher = (pitches) => {
  if (!pitches || pitches.length === 0) {
    return {
      hasData: false,
      message: 'No pitch data available'
    };
  }
  
  // Basic statistics
  const totalPitches = pitches.length;
  
  // Pitch type breakdown
  const pitchTypes = pitches.reduce((acc, pitch) => {
    acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate pitch type percentages
  const pitchTypePercentages = {};
  Object.keys(pitchTypes).forEach(type => {
    pitchTypePercentages[type] = Math.round((pitchTypes[type] / totalPitches) * 100);
  });
  
  // First pitch tendencies
  const firstPitches = pitches.filter(pitch => pitch.count === '0-0');
  const firstPitchTypes = firstPitches.reduce((acc, pitch) => {
    acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate first pitch percentages
  const firstPitchPercentages = {};
  const totalFirstPitches = firstPitches.length;
  if (totalFirstPitches > 0) {
    Object.keys(firstPitchTypes).forEach(type => {
      firstPitchPercentages[type] = Math.round((firstPitchTypes[type] / totalFirstPitches) * 100);
    });
  }
  
  // Count situations
  const countMatrix = {};
  for (let balls = 0; balls <= 3; balls++) {
    for (let strikes = 0; strikes <= 2; strikes++) {
      const count = `${balls}-${strikes}`;
      const pitchesInCount = pitches.filter(pitch => pitch.count === count);
      
      if (pitchesInCount.length > 0) {
        const types = pitchesInCount.reduce((acc, pitch) => {
          acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
          return acc;
        }, {});
        
        const typesPercentage = {};
        Object.keys(types).forEach(type => {
          typesPercentage[type] = Math.round((types[type] / pitchesInCount.length) * 100);
        });
        
        countMatrix[count] = {
          total: pitchesInCount.length,
          types: typesPercentage
        };
      }
    }
  }
  
  // Ahead/behind in count
  const aheadInCount = pitches.filter(pitch => {
    const [balls, strikes] = pitch.count.split('-').map(Number);
    return strikes > balls;
  });
  
  const behindInCount = pitches.filter(pitch => {
    const [balls, strikes] = pitch.count.split('-').map(Number);
    return balls > strikes;
  });
  
  const evenCount = pitches.filter(pitch => {
    const [balls, strikes] = pitch.count.split('-').map(Number);
    return balls === strikes || (balls === 0 && strikes === 0);
  });
  
  // Batter handedness
  const vsLeft = pitches.filter(pitch => pitch.batterSide === 'L');
  const vsRight = pitches.filter(pitch => pitch.batterSide === 'R');
  
  // Results breakdown
  const results = pitches.reduce((acc, pitch) => {
    acc[pitch.result] = (acc[pitch.result] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate result percentages
  const resultPercentages = {};
  Object.keys(results).forEach(result => {
    resultPercentages[result] = Math.round((results[result] / totalPitches) * 100);
  });
  
  // Outs situation analysis
  const outsSituation = {
    0: pitches.filter(pitch => pitch.outs === 0).length,
    1: pitches.filter(pitch => pitch.outs === 1).length,
    2: pitches.filter(pitch => pitch.outs === 2).length,
  };
  
  // Analyze pitch types by outs
  const pitchTypesByOuts = {};
  for (let out = 0; out <= 2; out++) {
    const pitchesByOut = pitches.filter(pitch => pitch.outs === out);
    if (pitchesByOut.length > 0) {
      const types = pitchesByOut.reduce((acc, pitch) => {
        acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
        return acc;
      }, {});
      
      const typesPercentage = {};
      Object.keys(types).forEach(type => {
        typesPercentage[type] = Math.round((types[type] / pitchesByOut.length) * 100);
      });
      
      pitchTypesByOuts[out] = typesPercentage;
    }
  }
  
  // Add two-out pitch tendencies
  const twoOutPitches = pitches.filter(pitch => pitch.outs === 2);
  const twoOutTypes = twoOutPitches.reduce((acc, pitch) => {
    acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
    return acc;
  }, {});
  
  const twoOutPercentages = {};
  if (twoOutPitches.length > 0) {
    Object.keys(twoOutTypes).forEach(type => {
      twoOutPercentages[type] = Math.round((twoOutTypes[type] / twoOutPitches.length) * 100);
    });
  }
  
  // Calculate contact rate (fouls + hits + outs)
  const contactPitches = pitches.filter(pitch => 
    pitch.result === 'foul' || pitch.result === 'hit' || pitch.result === 'out'
  );
  const contactRate = Math.round((contactPitches.length / totalPitches) * 100);

  // Calculate swing and miss rate
  const swingingStrikes = pitches.filter(pitch => pitch.result === 'swinging_strike');
  const swingAndMissRate = Math.round((swingingStrikes.length / totalPitches) * 100);

  // Calculate hit rate vs out rate on contact
  const hitsOnContact = pitches.filter(pitch => pitch.result === 'hit').length;
  const outsOnContact = pitches.filter(pitch => pitch.result === 'out').length;
  const hitRate = contactPitches.length > 0 
    ? Math.round((hitsOnContact / contactPitches.length) * 100) 
    : 0;
  const outRate = contactPitches.length > 0 
    ? Math.round((outsOnContact / contactPitches.length) * 100) 
    : 0;

  // Calculate pitch effectiveness by result
  const pitchEffectiveness = {};
  Object.keys(pitchTypes).forEach(type => {
    const pitchesOfType = pitches.filter(pitch => pitch.pitchType === type);
    if (pitchesOfType.length > 0) {
      const strikes = pitchesOfType.filter(pitch => 
        pitch.result === 'strike' || 
        pitch.result === 'foul' || 
        pitch.result === 'swinging_strike' ||
        pitch.result === 'out'
      ).length;
      const strikePercentage = Math.round((strikes / pitchesOfType.length) * 100);
      
      const swingAndMiss = pitchesOfType.filter(pitch => 
        pitch.result === 'swinging_strike'
      ).length;
      const swingAndMissPercentage = Math.round((swingAndMiss / pitchesOfType.length) * 100);
      
      pitchEffectiveness[type] = {
        pitches: pitchesOfType.length,
        strikePercentage,
        swingAndMissPercentage
      };
    }
  });
  
  // Generate predictions
  const predictions = {};
  
  // Predict first pitch
  if (totalFirstPitches >= 3) {
    const preferredFirstPitch = Object.entries(firstPitchPercentages)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type)[0];
    
    predictions.firstPitch = {
      type: preferredFirstPitch,
      confidence: firstPitchPercentages[preferredFirstPitch]
    };
  }
  
  // Predict 3-ball pitch
  const threeBallCounts = pitches.filter(pitch => {
    const [balls] = pitch.count.split('-').map(Number);
    return balls === 3;
  });
  
  if (threeBallCounts.length >= 2) {
    const threeBallTypes = threeBallCounts.reduce((acc, pitch) => {
      acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
      return acc;
    }, {});
    
    const preferredThreeBallPitch = Object.entries(threeBallTypes)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type)[0];
    
    const confidence = Math.round((threeBallTypes[preferredThreeBallPitch] / threeBallCounts.length) * 100);
    
    predictions.threeBallPitch = {
      type: preferredThreeBallPitch,
      confidence
    };
  }
  
  // Predict vs lefty/righty
  if (vsLeft.length >= 3) {
    const vsLeftTypes = vsLeft.reduce((acc, pitch) => {
      acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
      return acc;
    }, {});
    
    const vsLeftPercentages = {};
    Object.keys(vsLeftTypes).forEach(type => {
      vsLeftPercentages[type] = Math.round((vsLeftTypes[type] / vsLeft.length) * 100);
    });
    
    const preferredVsLeft = Object.entries(vsLeftPercentages)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type)[0];
    
    predictions.vsLefty = {
      type: preferredVsLeft,
      confidence: vsLeftPercentages[preferredVsLeft]
    };
  }
  
  if (vsRight.length >= 3) {
    const vsRightTypes = vsRight.reduce((acc, pitch) => {
      acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
      return acc;
    }, {});
    
    const vsRightPercentages = {};
    Object.keys(vsRightTypes).forEach(type => {
      vsRightPercentages[type] = Math.round((vsRightTypes[type] / vsRight.length) * 100);
    });
    
    const preferredVsRight = Object.entries(vsRightPercentages)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type)[0];
    
    predictions.vsRighty = {
      type: preferredVsRight,
      confidence: vsRightPercentages[preferredVsRight]
    };
  }
  
  // Add predictions for 2-out situations if we have enough data
  if (twoOutPitches.length >= 3) {
    const preferredTwoOutPitch = Object.entries(twoOutPercentages)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type)[0];
    
    predictions.twoOuts = {
      type: preferredTwoOutPitch,
      confidence: twoOutPercentages[preferredTwoOutPitch]
    };
  }
  
  // Return the complete analysis
  return {
    hasData: true,
    totalPitches,
    pitchTypes,
    pitchTypePercentages,
    firstPitchPercentages,
    countMatrix,
    outsSituation,
    pitchTypesByOuts,
    twoOutPercentages,
    aheadInCount: aheadInCount.length,
    behindInCount: behindInCount.length,
    evenCount: evenCount.length,
    vsLeft: vsLeft.length,
    vsRight: vsRight.length,
    results,
    resultPercentages,
    contactRate,
    swingAndMissRate,
    hitRate,
    outRate,
    pitchEffectiveness,
    predictions,
    quality: totalPitches < 10 ? 'low' : totalPitches < 20 ? 'medium' : 'high'
  };
};

/**
 * Generate insights specific to a game
 * @param {Array} pitches - Array of pitch objects for the game
 * @returns {Object} - Game-specific insights
 */
export const analyzeGame = (pitches) => {
  if (!pitches || pitches.length === 0) {
    return {
      hasData: false,
      message: 'No pitch data available for this game'
    };
  }
  
  // Group pitches by pitcher
  const pitcherGroups = pitches.reduce((acc, pitch) => {
    acc[pitch.pitcherId] = acc[pitch.pitcherId] || [];
    acc[pitch.pitcherId].push(pitch);
    return acc;
  }, {});
  
  // Analyze each pitcher
  const pitcherAnalytics = {};
  Object.keys(pitcherGroups).forEach(pitcherId => {
    pitcherAnalytics[pitcherId] = analyzePitcher(pitcherGroups[pitcherId]);
  });
  
  return {
    hasData: true,
    totalPitches: pitches.length,
    pitcherBreakdown: pitcherAnalytics
  };
};

export default {
  analyzePitcher,
  analyzeGame
};
