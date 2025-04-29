import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPitcherById, getPitchesByPitcher, savePitch } from '../services/StorageService';
import { analyzePitcher } from '../services/AnalyticsService';

const PitchTracker = () => {
  const { pitcherId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get gameId from URL query params
  const queryParams = new URLSearchParams(location.search);
  const gameId = queryParams.get('gameId');
  
  // Basic state
  const [balls, setBalls] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [selectedPitchType, setSelectedPitchType] = useState('fastball');
  const [inning, setInning] = useState(1);
  const [isTop, setIsTop] = useState(true);
  const [outs, setOuts] = useState(0);
  const [batterSide, setBatterSide] = useState('R'); // R for right, L for left
  const [pitcher, setPitcher] = useState(null);
  const [showAdvancedResults, setShowAdvancedResults] = useState(false);
  
  // Add state for insights
  const [insights, setInsights] = useState(null);
  const [pitches, setPitches] = useState([]);

  // Load pitcher data and insights
  useEffect(() => {
    const loadData = async () => {
      // Get pitcher data
      const pitcherData = getPitcherById(pitcherId);
      setPitcher(pitcherData);
      
      if (!pitcherData) {
        console.error('Pitcher not found:', pitcherId);
        alert('Pitcher not found');
        navigate('/game');
        return;
      }
      
      // Get pitch data
      let pitchData = [];
      if (gameId) {
        // Get pitches for this pitcher and game
        pitchData = getPitchesByPitcher(pitcherId).filter(pitch => pitch.gameId === gameId);
      } else {
        // Get all pitches for this pitcher
        pitchData = getPitchesByPitcher(pitcherId);
      }
      
      setPitches(pitchData);
      
      // Generate insights if we have data
      if (pitchData.length > 0) {
        const pitcherInsights = analyzePitcher(pitchData);
        setInsights(pitcherInsights);
      }
    };
    
    loadData();
  }, [pitcherId, gameId, navigate]);
  
  // Add function to refresh insights after logging a pitch
  const refreshInsights = () => {
    const pitchData = getPitchesByPitcher(pitcherId).filter(pitch => 
      gameId ? pitch.gameId === gameId : true
    );
    
    setPitches(pitchData);
    
    if (pitchData.length > 0) {
      const pitcherInsights = analyzePitcher(pitchData);
      setInsights(pitcherInsights);
    }
  };
  
  // Format percentages for display
  const formatPercentages = (percentages) => {
    if (!percentages || Object.keys(percentages).length === 0) {
      return 'No data';
    }
    
    return Object.entries(percentages)
      .map(([type, percentage]) => `${type}: ${percentage}%`)
      .join(', ');
  };
  
  // Select pitch type
  const selectPitchType = (type) => {
    setSelectedPitchType(type);
    console.log('Selected pitch type:', type);
  };
  
  // Handle outs changes
  const changeOuts = (increment) => {
    if (increment) {
      // Increase outs, and if we reach 3, move to next half-inning
      if (outs === 2) {
        setOuts(0);
        changeInning(true);
      } else {
        setOuts(outs + 1);
      }
    } else {
      // Decrease outs, with minimum of 0
      setOuts(Math.max(0, outs - 1));
    }
  };
  
  // Log pitch result
  const logPitchResult = (result) => {
    if (!gameId) {
      alert('No game selected. Please go back and select a game.');
      return;
    }
    
    const pitchData = {
      pitcherId,
      gameId,
      inning,
      isTop,
      outs,
      count: `${balls}-${strikes}`,
      pitchType: selectedPitchType,
      result,
      batterSide
    };
    
    console.log('Pitch logged:', pitchData);
    
    // Save pitch data
    try {
      savePitch(pitchData);
      
      // Refresh insights after saving a pitch
      refreshInsights();
    } catch (error) {
      console.error('Error saving pitch:', error);
      alert('Failed to save pitch data');
    }
    
    // Update count
    if (result === 'ball') {
      if (balls === 3) {
        // Walk - reset count
        setBalls(0);
        setStrikes(0);
      } else {
        setBalls(balls + 1);
      }
    } else if (result === 'strike') {
      if (strikes === 2) {
        // Strikeout - reset count
        setBalls(0);
        setStrikes(0);
      } else {
        setStrikes(strikes + 1);
      }
    } else if (result === 'foul') {
      // For fouls, only increment strikes if less than 2
      if (strikes < 2) {
        setStrikes(strikes + 1);
      }
    } else if (result === 'swinging_strike') {
      if (strikes === 2) {
        // Strikeout - reset count
        setBalls(0);
        setStrikes(0);
      } else {
        setStrikes(strikes + 1);
      }
    } else if (result === 'hit') {
      // Hit - reset count
      setBalls(0);
      setStrikes(0);
    } else if (result === 'out') {
      // Out in play - reset count and increment outs
      setBalls(0);
      setStrikes(0);
      changeOuts(true);
    }
  };
  
  // Handle inning changes
  const changeInning = (increment) => {
    if (increment) {
      if (isTop) {
        setIsTop(false); // Move from top to bottom of inning
      } else {
        setInning(inning + 1); // Move to next inning
        setIsTop(true);
      }
    } else {
      if (!isTop) {
        setIsTop(true); // Move from bottom to top of inning
      } else if (inning > 1) {
        setInning(inning - 1); // Move to previous inning
        setIsTop(false);
      }
    }
  };
  
  const resetCount = () => {
    setBalls(0);
    setStrikes(0);
  };
  
  // If pitcher hasn't loaded yet, show loading
  if (!pitcher) {
    return <div className="p-4 text-center">Loading...</div>;
  }
  
  return (
    <div className="p-4">
      <div className="bg-blue-600 text-white p-4 rounded-t mb-4">
        <div className="flex justify-between">
          <button onClick={() => navigate(-1)}>&lt; Back</button>
          <h1>{pitcher.name} #{pitcher.number}</h1>
          <div></div>
        </div>
      </div>
      
      {/* Inning Controls */}
      <div className="bg-blue-500 text-white p-2 flex justify-between items-center mb-4">
        <button 
          onClick={() => changeInning(false)}
          className="bg-blue-700 px-3 py-1 rounded"
        >
          &lt;
        </button>
        <div className="text-center">
          <span className="font-bold">{isTop ? 'Top' : 'Bottom'} {inning}</span>
        </div>
        <button 
          onClick={() => changeInning(true)}
          className="bg-blue-700 px-3 py-1 rounded"
        >
          &gt;
        </button>
      </div>
      
      {/* Outs Controls */}
      <div className="bg-gray-200 p-2 flex justify-between items-center mb-4">
        <button 
          onClick={() => changeOuts(false)}
          className="bg-gray-400 px-3 py-1 rounded"
          disabled={outs === 0}
        >
          &lt;
        </button>
        <div className="text-center">
          <span className="font-bold">Outs: {outs}</span>
        </div>
        <button 
          onClick={() => changeOuts(true)}
          className="bg-gray-400 px-3 py-1 rounded"
          disabled={outs === 3}
        >
          &gt;
        </button>
      </div>
      
      <div className="text-center mb-4">
        <div className="text-lg">
          <span className="font-bold">Count: </span>
          <span>{balls}-{strikes}</span>
        </div>
      </div>
      
      {/* Batter Side Toggle */}
      <div className="flex justify-center py-2 mb-4">
        <span className="mr-2">Batter: </span>
        <button
          onClick={() => setBatterSide('L')}
          className={`px-3 py-1 mx-1 rounded ${batterSide === 'L' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
        >
          L
        </button>
        <button
          onClick={() => setBatterSide('R')}
          className={`px-3 py-1 mx-1 rounded ${batterSide === 'R' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
        >
          R
        </button>
      </div>
      
      <div className="mb-4">
        <h2 className="font-bold mb-2">Pitch Type</h2>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => selectPitchType('fastball')}
            className={`p-2 rounded ${selectedPitchType === 'fastball' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-200'}`}
          >
            Fastball
          </button>
          <button 
            onClick={() => selectPitchType('off-speed')}
            className={`p-2 rounded ${selectedPitchType === 'off-speed' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200'}`}
          >
            Off-Speed
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold">Result</h2>
          <button 
            onClick={() => setShowAdvancedResults(!showAdvancedResults)}
            className="text-sm text-blue-600"
          >
            {showAdvancedResults ? "Simple View" : "Advanced View"}
          </button>
        </div>
        
        {!showAdvancedResults ? (
          // Simple Results - Now includes all pitch result types
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => logPitchResult('ball')}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Ball
            </button>
            <button 
              onClick={() => logPitchResult('strike')}
              className="bg-red-500 text-white p-2 rounded"
            >
              Strike
            </button>
            <button 
              onClick={() => logPitchResult('foul')}
              className="bg-yellow-500 text-white p-2 rounded"
            >
              Foul
            </button>
            <button 
              onClick={() => logPitchResult('swinging_strike')}
              className="bg-purple-500 text-white p-2 rounded"
            >
              Swing & Miss
            </button>
            <button 
              onClick={() => logPitchResult('hit')}
              className="bg-green-500 text-white p-2 rounded"
            >
              Hit
            </button>
            <button 
              onClick={() => logPitchResult('out')}
              className="bg-gray-500 text-white p-2 rounded"
            >
              Out
            </button>
          </div>
        ) : (
          // Advanced Results
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => logPitchResult('ball')}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Ball
            </button>
            <button 
              onClick={() => logPitchResult('strike')}
              className="bg-red-500 text-white p-2 rounded"
            >
              Called Strike
            </button>
            <button 
              onClick={() => logPitchResult('foul')}
              className="bg-yellow-500 text-white p-2 rounded"
            >
              Foul
            </button>
            <button 
              onClick={() => logPitchResult('swinging_strike')}
              className="bg-purple-500 text-white p-2 rounded"
            >
              Swinging Strike
            </button>
            <button 
              onClick={() => logPitchResult('hit')}
              className="bg-green-500 text-white p-2 rounded"
            >
              Hit
            </button>
            <button 
              onClick={() => logPitchResult('out')}
              className="bg-gray-500 text-white p-2 rounded"
            >
              Out (In Play)
            </button>
          </div>
        )}
      </div>
      
      {/* Replace the existing button with this */}
      <div className="mt-8 grid grid-cols-2 gap-2">
        <button 
          onClick={resetCount}
          className="bg-gray-500 text-white p-2 rounded"
        >
          Reset Count
        </button>
  
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => navigate(`/insights/${pitcherId}?gameId=${gameId}`)}
            className="bg-blue-600 text-white p-2 rounded"
          >
            View Insights
          </button>
    
          <button 
            onClick={() => navigate(`/enhanced-insights/${pitcherId}?gameId=${gameId}`)}
            className="bg-green-600 text-white p-2 rounded"
          >
            View Enhanced Insights
          </button>
        </div>
      </div>
      
      {/* Live Insights Section - Only show in simple view with enough data */}
      {!showAdvancedResults && insights && insights.hasData && (
        <div className="mt-8 border-t pt-4">
          <h2 className="font-bold mb-4">Live Insights</h2>
          
          {insights.totalPitches >= 5 && (
            <div className="bg-white p-3 rounded shadow mb-3">
              <h3 className="font-bold text-sm mb-1">Quick Stats</h3>
              <p className="text-sm mb-1">Pitches: {insights.totalPitches} | Mix: {formatPercentages(insights.pitchTypePercentages)}</p>
              {insights.resultPercentages && insights.resultPercentages.strike && (
                <p className="text-sm mb-1">Strike %: {insights.resultPercentages.strike}%</p>
              )}
              {insights.swingAndMissRate !== undefined && insights.contactRate !== undefined && (
                <p className="text-sm">Swing & Miss: {insights.swingAndMissRate}% | Contact: {insights.contactRate}%</p>
              )}
            </div>
          )}
          
          {/* Predictions */}
          {insights.predictions && Object.keys(insights.predictions).length > 0 && (
            <div className="bg-white p-3 rounded shadow">
              <h3 className="font-bold text-sm mb-1">Predictions</h3>
              
              {/* Current situation-based prediction */}
              {(() => {
                // First try to match the current situation
                if (outs === 2 && insights.predictions.twoOuts) {
                  return (
                    <div className="mb-2 bg-yellow-100 p-2 rounded">
                      <p className="text-sm font-bold">Current Situation (2 outs):</p>
                      <p className="text-sm">Likely {insights.predictions.twoOuts.type} ({insights.predictions.twoOuts.confidence}%)</p>
                    </div>
                  );
                }
                
                if (balls === 3 && insights.predictions.threeBallPitch) {
                  return (
                    <div className="mb-2 bg-yellow-100 p-2 rounded">
                      <p className="text-sm font-bold">Current Situation (3-ball count):</p>
                      <p className="text-sm">Likely {insights.predictions.threeBallPitch.type} ({insights.predictions.threeBallPitch.confidence}%)</p>
                    </div>
                  );
                }
                
                if (balls === 0 && strikes === 0 && insights.predictions.firstPitch) {
                  return (
                    <div className="mb-2 bg-yellow-100 p-2 rounded">
                      <p className="text-sm font-bold">Current Situation (first pitch):</p>
                      <p className="text-sm">Likely {insights.predictions.firstPitch.type} ({insights.predictions.firstPitch.confidence}%)</p>
                    </div>
                  );
                }
                
                // Default - just show the most confident prediction
                const allPredictions = Object.values(insights.predictions);
                if (allPredictions.length > 0) {
                  const bestPrediction = allPredictions.sort((a, b) => b.confidence - a.confidence)[0];
                  const predictionType = Object.keys(insights.predictions).find(
                    key => insights.predictions[key] === bestPrediction
                  );
                  
                  let situationName = "Unknown";
                  if (predictionType === 'firstPitch') situationName = "First Pitch";
                  else if (predictionType === 'threeBallPitch') situationName = "3-Ball Count";
                  else if (predictionType === 'twoOuts') situationName = "2 Outs";
                  else if (predictionType === 'vsLefty') situationName = "vs Left-handed";
                  else if (predictionType === 'vsRighty') situationName = "vs Right-handed";
                  
                  return (
                    <div className="mb-2">
                      <p className="text-sm font-bold">{situationName}:</p>
                      <p className="text-sm">Likely {bestPrediction.type} ({bestPrediction.confidence}%)</p>
                    </div>
                  );
                }
                
                return null;
              })()}
              
              {insights.quality === 'low' && (
                <p className="text-xs text-gray-500 mt-2">
                  Note: Limited data available. Predictions may not be reliable.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PitchTracker;
