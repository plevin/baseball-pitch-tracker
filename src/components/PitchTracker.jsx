import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPitcherById, savePitch } from '../services/StorageService';

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
  const [outs, setOuts] = useState(0);
  const [selectedPitchType, setSelectedPitchType] = useState('fastball');
  const [inning, setInning] = useState(1);
  const [isTop, setIsTop] = useState(true);
  const [batterSide, setBatterSide] = useState('R'); // R for right, L for left
  const [pitcher, setPitcher] = useState(null);
  
  // Load pitcher data
  useEffect(() => {
    const loadPitcher = () => {
      const pitcherData = getPitcherById(pitcherId);
      setPitcher(pitcherData);
      
      if (!pitcherData) {
        console.error('Pitcher not found:', pitcherId);
        alert('Pitcher not found');
        navigate('/game');
      }
    };
    
    loadPitcher();
  }, [pitcherId, navigate]);
  
  // Select pitch type
  const selectPitchType = (type) => {
    setSelectedPitchType(type);
    console.log('Selected pitch type:', type);
  };
  
  // Handle outs logic
  const incrementOuts = () => {
    if (outs === 2) {
      // Move to next half-inning when reaching 3 outs
      setOuts(0);
      if (isTop) {
        setIsTop(false); // Move to bottom of inning
      } else {
        setInning(inning + 1); // Move to next inning
        setIsTop(true);
      }
    } else {
      setOuts(outs + 1);
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
      count: `${balls}-${strikes}`,
      pitchType: selectedPitchType,
      result,
      batterSide
    };
    
    console.log('Pitch logged:', pitchData);
    
    // Save pitch data
    try {
      savePitch(pitchData);
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
    } else if (result === 'strike' || result === 'swinging_strike') {
      if (strikes === 2) {
        // Strikeout - reset count and increment outs
        setBalls(0);
        setStrikes(0);
        incrementOuts(); // Add this line to increment outs on strikeouts
      } else {
        setStrikes(strikes + 1);
      }
    } else if (result === 'foul') {
      if (strikes < 2) {
        setStrikes(strikes + 1);
      }
      // Foul with 2 strikes stays at 2 strikes
    } else if (result === 'out') {
      // In play out - reset count and increment outs
      setBalls(0);
      setStrikes(0);
      incrementOuts();
    } else {
      // Hit or other result - reset count
      setBalls(0);
      setStrikes(0);
    }
  };
  
  // Handle inning changes
  const changeInning = (increment) => {
    if (increment) {
      if (isTop) {
        setIsTop(false); // Move from top to bottom of inning
        setOuts(0); // Reset outs for new half-inning
      } else {
        setInning(inning + 1); // Move to next inning
        setIsTop(true);
        setOuts(0); // Reset outs for new half-inning
      }
    } else {
      if (!isTop) {
        setIsTop(true); // Move from bottom to top of inning
        setOuts(0); // Reset outs for new half-inning
      } else if (inning > 1) {
        setInning(inning - 1); // Move to previous inning
        setIsTop(false);
        setOuts(0); // Reset outs for new half-inning
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
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg">
          <span className="font-bold">Count: </span>
          <span>{balls}-{strikes}</span>
        </div>
        <div className="text-lg">
          <span className="font-bold">Outs: </span>
          <span>{outs}</span>
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
        <h2 className="font-bold mb-2">Result</h2>
        
        {/* Combined Results View */}
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
      </div>
      
      <div className="mt-8 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={resetCount}
            className="bg-gray-500 text-white p-2 rounded"
          >
            Reset Count
          </button>
          <button 
            onClick={() => navigate(`/insights/${pitcherId}?gameId=${gameId}`)}
            className="bg-blue-600 text-white p-2 rounded"
          >
            View Insights
          </button>
        </div>
        
        {/* Enhanced Insights Button */}
        <button 
          onClick={() => navigate(`/enhanced-insights/${pitcherId}?gameId=${gameId}`)}
          className="w-full bg-indigo-600 text-white p-2 rounded font-bold"
        >
          Enhanced Analytics
        </button>
      </div>
    </div>
  );
};

export default PitchTracker;