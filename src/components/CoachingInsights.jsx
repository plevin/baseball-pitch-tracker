import React, { useState, useEffect } from 'react';
import { getPitchesByPitcher } from '../services/StorageService';
import { generateCoachingAdvice } from '../services/CoachingService';

const CoachingInsights = ({ pitcherId, gameId }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = () => {
      // Get all pitches for this pitcher
      const allPitches = getPitchesByPitcher(pitcherId);
      
      // Filter for current game if gameId is provided
      const relevantPitches = gameId 
        ? allPitches.filter(pitch => pitch.gameId === gameId)
        : allPitches;
      
      if (relevantPitches.length === 0) {
        setLoading(false);
        return;
      }
      
      // Generate coaching advice
      const advice = generateCoachingAdvice(relevantPitches);
      setInsights(advice);
      setLoading(false);
    };
    
    loadInsights();
  }, [pitcherId, gameId]);

  if (loading) {
    return <div className="p-3 text-center">Loading coaching insights...</div>;
  }

  if (!insights || !insights.hasData) {
    return (
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-bold text-lg mb-2">Coaching Insights</h2>
        <p>Not enough data to generate coaching insights yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="font-bold text-lg mb-3">Coaching Insights</h2>
      
      <div className="space-y-4">
        {/* Batter Advice */}
        <div className="p-3 bg-blue-50 rounded">
          <h3 className="font-medium mb-2">Batter Approach</h3>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">General: </span>
              {insights.batterAdvice.general}
            </div>
            
            {insights.batterAdvice.firstPitch && (
              <div>
                <span className="font-medium">First Pitch: </span>
                {insights.batterAdvice.firstPitch}
              </div>
            )}
            
            {insights.batterAdvice.twoStrikes && (
              <div>
                <span className="font-medium">Two Strikes: </span>
                {insights.batterAdvice.twoStrikes}
              </div>
            )}
            
            {insights.batterAdvice.keyCount.count && (
              <div className="text-red-600">
                <span className="font-medium">Key Count: </span>
                {insights.batterAdvice.keyCount.advice}
              </div>
            )}
          </div>
        </div>
        
        {/* Pitcher Management */}
        <div className={`p-3 rounded ${
          insights.pitcherManagement.fatigueRisk === 'high' ? 'bg-red-50' :
          insights.pitcherManagement.fatigueRisk === 'medium' ? 'bg-yellow-50' :
          'bg-green-50'
        }`}>
          <h3 className="font-medium mb-2">Pitcher Management</h3>
          
          {insights.pitcherManagement.warnings.length > 0 && (
            <div className="mb-2">
              <div className="font-medium text-red-600">Warnings:</div>
              <ul className="list-disc pl-5 text-sm">
                {insights.pitcherManagement.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          {insights.pitcherManagement.recommendations.length > 0 && (
            <div>
              <div className="font-medium">Recommendations:</div>
              <ul className="list-disc pl-5 text-sm">
                {insights.pitcherManagement.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          
          {insights.pitcherManagement.warnings.length === 0 && 
           insights.pitcherManagement.recommendations.length === 0 && (
            <div className="text-green-600">
              No pitcher management concerns at this time
            </div>
          )}
        </div>
        
        {/* Game Strategy */}
        <div className="p-3 border border-gray-200 rounded">
          <h3 className="font-medium mb-2">Game Strategy</h3>
          
          <div className="text-sm mb-2">{insights.gameStrategy.overall}</div>
          
          <div className="grid grid-cols-2 gap-2 mt-1">
            {insights.gameStrategy.strengths.length > 0 && (
              <div>
                <div className="font-medium text-green-600">Strengths:</div>
                <ul className="list-disc pl-5 text-sm">
                  {insights.gameStrategy.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {insights.gameStrategy.weaknesses.length > 0 && (
              <div>
                <div className="font-medium text-red-600">Weaknesses:</div>
                <ul className="list-disc pl-5 text-sm">
                  {insights.gameStrategy.weaknesses.map((weakness, index) => (
                    <li key={index}>{weakness}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* In-Game Adjustments */}
        {insights.inGameAdjustments.adjustmentsMade && (
          <div className="p-3 bg-purple-50 rounded">
            <h3 className="font-medium mb-1">In-Game Adjustments</h3>
            
            <div className="text-sm mb-2">{insights.inGameAdjustments.recommendation}</div>
            
            <div>
              <div className="font-medium">Observed Adjustments:</div>
              <ul className="list-disc pl-5 text-sm">
                {insights.inGameAdjustments.adjustments.map((adjustment, index) => (
                  <li key={index}>{adjustment}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachingInsights;