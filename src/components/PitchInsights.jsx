import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPitcherById, getPitchesByPitcher } from '../services/StorageService';
import { analyzePitcher } from '../services/AnalyticsService';

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
        
        {/* Outs Situations - New section */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Outs Situations</h2>
          <p className="mb-1"><strong>0 Outs:</strong> {insights.outsSituation[0]} pitches</p>
          <p className="mb-1"><strong>1 Out:</strong> {insights.outsSituation[1]} pitches</p>
          <p className="mb-1"><strong>2 Outs:</strong> {insights.outsSituation[2]} pitches</p>
          
          {insights.twoOutPercentages && Object.keys(insights.twoOutPercentages).length > 0 && (
            <div className="mt-2">
              <p className="mb-1"><strong>With 2 Outs:</strong> {formatPercentages(insights.twoOutPercentages)}</p>
            </div>
          )}
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
            
            {/* Two-outs prediction - New section */}
            {insights.predictions.twoOuts && (
              <p className="mb-1">
                <strong>With 2 Outs:</strong> Likely {insights.predictions.twoOuts.type}
                <span className="text-sm text-gray-500 ml-1">
                  ({insights.predictions.twoOuts.confidence}% confidence)
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
    </div>
  );
};

export default PitchInsights;
