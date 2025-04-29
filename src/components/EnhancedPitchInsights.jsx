import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPitcherById, getPitchesByPitcher } from '../services/StorageService';
import { analyzePitcher } from '../services/AnalyticsService';

const EnhancedPitchInsights = () => {
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
  
  // Helper to calculate pitch mix breakdown
  const calculatePitchMix = () => {
    if (!pitches || pitches.length === 0) return {};
    
    const counts = pitches.reduce((acc, pitch) => {
      acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
      return acc;
    }, {});
    
    const total = pitches.length;
    const percentages = {};
    
    Object.keys(counts).forEach(type => {
      percentages[type] = Math.round((counts[type] / total) * 100);
    });
    
    return percentages;
  };
  
  // Helper to calculate count tendencies
  const calculateCountTendencies = () => {
    if (!pitches || pitches.length === 0) return {};
    
    const tendencies = {};
    
    // First pitch tendencies
    const firstPitches = pitches.filter(pitch => pitch.count === '0-0');
    const firstPitchTypes = firstPitches.reduce((acc, pitch) => {
      acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
      return acc;
    }, {});
    
    if (firstPitches.length > 0) {
      tendencies.firstPitch = {};
      Object.keys(firstPitchTypes).forEach(type => {
        tendencies.firstPitch[type] = Math.round((firstPitchTypes[type] / firstPitches.length) * 100);
      });
    }
    
    // Behind in count
    const behindPitches = pitches.filter(pitch => {
      const [balls, strikes] = pitch.count.split('-').map(Number);
      return balls > strikes;
    });
    
    const behindTypes = behindPitches.reduce((acc, pitch) => {
      acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
      return acc;
    }, {});
    
    if (behindPitches.length > 0) {
      tendencies.behind = {};
      Object.keys(behindTypes).forEach(type => {
        tendencies.behind[type] = Math.round((behindTypes[type] / behindPitches.length) * 100);
      });
    }
    
    // Ahead in count
    const aheadPitches = pitches.filter(pitch => {
      const [balls, strikes] = pitch.count.split('-').map(Number);
      return strikes > balls;
    });
    
    const aheadTypes = aheadPitches.reduce((acc, pitch) => {
      acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
      return acc;
    }, {});
    
    if (aheadPitches.length > 0) {
      tendencies.ahead = {};
      Object.keys(aheadTypes).forEach(type => {
        tendencies.ahead[type] = Math.round((aheadTypes[type] / aheadPitches.length) * 100);
      });
    }
    
    return tendencies;
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
  
  // Get the preferred pitch type in a situation
  const getPreferredPitch = (pitchTypes) => {
    if (!pitchTypes || Object.keys(pitchTypes).length === 0) {
      return { type: 'Unknown', percentage: 0 };
    }
    
    const sorted = Object.entries(pitchTypes).sort((a, b) => b[1] - a[1]);
    return { type: sorted[0][0], percentage: sorted[0][1] };
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }
  
  // If no data available
  if (!insights || !insights.hasData || pitches.length === 0) {
    return (
      <div className="p-4 pb-20">
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
  
  const pitchMix = calculatePitchMix();
  const countTendencies = calculateCountTendencies();
  
  return (
    <div className="p-4 pb-20">
      <div className="bg-blue-600 text-white p-4 rounded-t mb-4">
        <div className="flex justify-between">
          <button onClick={() => navigate(-1)}>&lt; Back</button>
          <h1>{pitcher.name} #{pitcher.number}</h1>
          <div></div>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Pitch Mix Visualization */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-4">Pitch Mix</h2>
          <div className="h-6 w-full bg-gray-200 rounded overflow-hidden">
            {Object.entries(pitchMix).map(([type, percentage], index) => (
              <div 
                key={type}
                className={`h-full inline-block ${
                  type === 'fastball' ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${percentage}%` }}
                title={`${type}: ${percentage}%`}
              ></div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-sm">
            {Object.entries(pitchMix).map(([type, percentage]) => (
              <div key={type} className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-1 ${
                  type === 'fastball' ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                <span className="mr-2">{type}</span>
                <span className="font-bold">{percentage}%</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Key Insights - Removed print report and view details buttons */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-4">Key Insights</h2>
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 rounded border border-blue-100">
              <p className="font-medium text-blue-800">
                {getPreferredPitch(countTendencies.firstPitch)?.percentage > 60 
                  ? `Strong tendency to throw ${getPreferredPitch(countTendencies.firstPitch)?.type} on first pitch (${getPreferredPitch(countTendencies.firstPitch)?.percentage}%)`
                  : `No strong first pitch preference detected`}
              </p>
            </div>
            
            {getPreferredPitch(countTendencies.behind)?.percentage > 60 && (
              <div className="p-3 bg-blue-50 rounded border border-blue-100">
                <p className="font-medium text-blue-800">
                  When behind in count, heavily favors {getPreferredPitch(countTendencies.behind)?.type} 
                  ({getPreferredPitch(countTendencies.behind)?.percentage}%)
                </p>
              </div>
            )}
            
            {insights.resultPercentages.strike > 65 && (
              <div className="p-3 bg-green-50 rounded border border-green-100">
                <p className="font-medium text-green-800">
                  Good strike thrower ({insights.resultPercentages.strike}% strikes)
                </p>
              </div>
            )}
            
            {insights.resultPercentages.ball > 45 && (
              <div className="p-3 bg-red-50 rounded border border-red-100">
                <p className="font-medium text-red-800">
                  Control issues detected ({insights.resultPercentages.ball}% balls)
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Count Breakdown */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-4">Count Breakdown</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-sm mb-1">First Pitch</h3>
              <p className="text-sm">{formatPercentages(countTendencies.firstPitch)}</p>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1">Behind in Count</h3>
              <p className="text-sm">{formatPercentages(countTendencies.behind)}</p>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1">Ahead in Count</h3>
              <p className="text-sm">{formatPercentages(countTendencies.ahead)}</p>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1">Two Strikes</h3>
              <p className="text-sm">
                {formatPercentages(
                  pitches.filter(p => p.count.split('-')[1] === '2')
                    .reduce((acc, pitch) => {
                      acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
                      return acc;
                    }, {})
                )}
              </p>
            </div>
          </div>
        </div>
        
        {/* Batter Handedness */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-4">vs Left/Right</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-sm mb-1">vs Left</h3>
              <p className="text-sm">
                {formatPercentages(
                  pitches.filter(p => p.batterSide === 'L')
                    .reduce((acc, pitch) => {
                      acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
                      return acc;
                    }, {})
                )}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1">vs Right</h3>
              <p className="text-sm">
                {formatPercentages(
                  pitches.filter(p => p.batterSide === 'R')
                    .reduce((acc, pitch) => {
                      acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
                      return acc;
                    }, {})
                )}
              </p>
            </div>
          </div>
        </div>
        
        {/* Sample Size and Quality */}
        <div className="bg-gray-100 p-3 rounded text-center text-sm">
          <div className="font-bold">Sample Size: {pitches.length} pitches</div>
          <div className={
            insights.quality === 'high' ? 'text-green-600' : 
            insights.quality === 'medium' ? 'text-yellow-600' : 
            'text-red-600'
          }>
            Data Quality: {insights.quality === 'high' ? 'High' : 
                          insights.quality === 'medium' ? 'Medium' : 
                          'Low (limited predictive value)'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPitchInsights;