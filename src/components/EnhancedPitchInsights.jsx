import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPitcherById, getPitchesByPitcher } from '../services/StorageService';
import { analyzePitcher } from '../services/AnalyticsService';
import PitchCountDashboard from './PitchCountDashboard';
import GameSituationGuide from './GameSituationGuide';
import BatterAdjustmentCards from './BatterAdjustmentCards';
import InningStrategyGuide from './InningStrategyGuide';
import FatigueDetectionSystem from './FatigueDetectionSystem';
import CoachDashboard from './CoachDashboard';
import CoachingInsights from './CoachingInsights';

const PitchInsights = () => {
  const { pitcherId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get gameId from URL query params
  const queryParams = new URLSearchParams(location.search);
  const gameId = queryParams.get('gameId');
  
  const [pitcher, setPitcher] = useState(null);
  const [pitches, setPitches] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('coach'); // 'coach' or 'detailed'
  
  // Load data
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
        pitchData = getPitchesByPitcher(pitcherId)
          .filter(pitch => pitch.gameId === gameId);
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
      
      setLoading(false);
    };
    
    loadData();
  }, [pitcherId, gameId, navigate]);
  
  // Format percentages for display
  const formatPercentages = (percentages) => {
    if (!percentages || Object.keys(percentages).length === 0) {
      return 'No data';
    }
    
    return Object.entries(percentages)
      .map(([type, percentage]) => `${type}: ${percentage}%`)
      .join(', ');
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }
  
  // If no data available
  if (!insights || !insights.hasData || pitches.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-blue-600 text-white p-4 rounded-t mb-4">
          <div className="flex justify-between">
            <button onClick={() => navigate(-1)}>&lt; Back</button>
            <h1>{pitcher.name} #{pitcher.number}</h1>
            <div></div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">No Data Yet</h2>
          <p>No pitches have been tracked yet for this pitcher.</p>
          <p className="mt-4">
            <button
              onClick={() => navigate(`/track/${pitcherId}${gameId ? `?gameId=${gameId}` : ''}`)}
              className="bg-blue-600 text-white p-2 rounded"
            >
              Track Pitches
            </button>
          </p>
        </div>
      </div>
    );
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
      
      {/* View Mode Toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md shadow">
          <button
            onClick={() => setViewMode('coach')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              viewMode === 'coach'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Coach View
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              viewMode === 'detailed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Detailed View
          </button>
        </div>
      </div>
      
      {viewMode === 'coach' ? (
        // Coach-focused view with new components
        <div className="space-y-4">
          {/* Coach Dashboard */}
          <CoachDashboard
            pitcherId={pitcherId}
            gameId={gameId}
          />
          
          {/* New Pitch Count Dashboard */}
          <PitchCountDashboard 
            pitcherId={pitcherId} 
            gameId={gameId} 
          />
          
          {/* New Game Situation Guide */}
          <GameSituationGuide 
            pitcherId={pitcherId} 
            gameId={gameId}
          />
          
          {/* New Batter Adjustment Cards */}
          <BatterAdjustmentCards
            pitcherId={pitcherId}
            gameId={gameId}
          />
          
          {/* New Inning Strategy Guide */}
          <InningStrategyGuide
            pitcherId={pitcherId}
            gameId={gameId}
          />
          
          {/* New Fatigue Detection System */}
          <FatigueDetectionSystem
            pitcherId={pitcherId}
            gameId={gameId}
          />
          
          {/* New Coaching Insights */}
          <CoachingInsights
            pitcherId={pitcherId}
            gameId={gameId}
          />
          
          {/* Quick Strategies */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-3">Quick Coaching Tips</h2>
            
            <div className="space-y-3">
              {/* First Pitch Strategy */}
              {insights.firstPitchPercentages && Object.keys(insights.firstPitchPercentages).length > 0 && (
                <div className="p-2 bg-blue-50 rounded">
                  <span className="font-medium">First Pitch: </span>
                  {Object.entries(insights.firstPitchPercentages)
                    .sort((a, b) => b[1] - a[1])[0][1] > 65 ? (
                      <span className="text-red-600">
                        Heavily favors {Object.entries(insights.firstPitchPercentages)
                          .sort((a, b) => b[1] - a[1])[0][0]} 
                        ({Object.entries(insights.firstPitchPercentages)
                          .sort((a, b) => b[1] - a[1])[0][1]}%)
                      </span>
                    ) : (
                      <span>
                        Mixes pitches well ({formatPercentages(insights.firstPitchPercentages)})
                      </span>
                    )
                  }
                </div>
              )}
              
              {/* Behind in Count Strategy */}
              {insights.predictions && insights.predictions.threeBallPitch && (
                <div className="p-2 bg-blue-50 rounded">
                  <span className="font-medium">Three Ball Count: </span>
                  <span className={insights.predictions.threeBallPitch.confidence > 70 ? 'text-red-600' : ''}>
                    {insights.predictions.threeBallPitch.confidence > 70 
                      ? 'Strongly favors ' 
                      : 'Usually throws '} 
                    {insights.predictions.threeBallPitch.type} 
                    ({insights.predictions.threeBallPitch.confidence}%)
                  </span>
                </div>
              )}
              
              {/* Batter Handedness Strategy */}
              {insights.predictions && insights.predictions.vsLefty && insights.predictions.vsRighty && (
                <div className="p-2 bg-blue-50 rounded">
                  <span className="font-medium">Batter Preference: </span>
                  {insights.predictions.vsLefty.type === insights.predictions.vsRighty.type ? (
                    <span>
                      Uses same approach regardless of batter hand ({insights.predictions.vsLefty.type})
                    </span>
                  ) : (
                    <span className="text-red-600">
                      Changes approach based on batter hand
                      (L: {insights.predictions.vsLefty.type}, 
                      R: {insights.predictions.vsRighty.type})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Original detailed view
        <div className="space-y-4">
          {/* Overview */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Overview</h2>
            <p className="mb-1"><strong>Total Pitches:</strong> {insights.totalPitches}</p>
            <p className="mb-1"><strong>Pitch Mix:</strong> {formatPercentages(insights.pitchTypePercentages)}</p>
            
            {insights.resultPercentages && insights.resultPercentages.strike && (
              <p className="mb-1"><strong>Strike %:</strong> {insights.resultPercentages.strike}%</p>
            )}
            
            {insights.quality && (
              <div className="mt-2 text-sm">
                <strong>Data Quality:</strong> <span className={
                  insights.quality === 'high' ? 'text-green-600' : 
                  insights.quality === 'medium' ? 'text-yellow-600' : 
                  'text-red-600'
                }>
                  {insights.quality === 'high' ? 'High' : 
                   insights.quality === 'medium' ? 'Medium' : 
                   'Low (limited predictive value)'}
                </span>
              </div>
            )}
          </div>
          
          {/* First Pitch Tendencies */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">First Pitch Tendencies</h2>
            <p>{formatPercentages(insights.firstPitchPercentages)}</p>
          </div>
          
          {/* Count Situations */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Count Situations</h2>
            <p className="mb-1"><strong>When Behind:</strong> {insights.behindInCount} pitches</p>
            <p className="mb-1"><strong>When Even:</strong> {insights.evenCount} pitches</p>
            <p className="mb-1"><strong>When Ahead:</strong> {insights.aheadInCount} pitches</p>
          </div>
          
          {/* vs. L/R */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">vs. Left/Right</h2>
            <p className="mb-1"><strong>vs. Left:</strong> {insights.vsLeft} pitches</p>
            <p className="mb-1"><strong>vs. Right:</strong> {insights.vsRight} pitches</p>
          </div>
          
          {/* Predictions */}
          {insights.predictions && Object.keys(insights.predictions).length > 0 && (
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-bold mb-2">Predictions</h2>
              
              {insights.predictions.firstPitch && (
                <p className="mb-1">
                  <strong>First Pitch:</strong> Likely {insights.predictions.firstPitch.type} 
                  <span className="text-sm text-gray-500 ml-1">
                    ({insights.predictions.firstPitch.confidence}% confidence)
                  </span>
                </p>
              )}
              
              {insights.predictions.threeBallPitch && (
                <p className="mb-1">
                  <strong>3-Ball Count:</strong> Watch for {insights.predictions.threeBallPitch.type}
                  <span className="text-sm text-gray-500 ml-1">
                    ({insights.predictions.threeBallPitch.confidence}% confidence)
                  </span>
                </p>
              )}
              
              {insights.predictions.vsLefty && (
                <p className="mb-1">
                  <strong>vs. Lefties:</strong> Prefers {insights.predictions.vsLefty.type}
                  <span className="text-sm text-gray-500 ml-1">
                    ({insights.predictions.vsLefty.confidence}% confidence)
                  </span>
                </p>
              )}
              
              {insights.predictions.vsRighty && (
                <p className="mb-1">
                  <strong>vs. Righties:</strong> Prefers {insights.predictions.vsRighty.type}
                  <span className="text-sm text-gray-500 ml-1">
                    ({insights.predictions.vsRighty.confidence}% confidence)
                  </span>
                </p>
              )}
              
              {insights.quality === 'low' && (
                <p className="mt-2 text-sm text-gray-500">
                  Note: Limited data available. Predictions may not be reliable.
                </p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Common actions for both views */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => navigate(`/track/${pitcherId}${gameId ? `?gameId=${gameId}` : ''}`)}
          className="bg-blue-600 text-white p-2 rounded"
        >
          Continue Tracking
        </button>
      </div>
    </div>
  );
};

export default PitchInsights;