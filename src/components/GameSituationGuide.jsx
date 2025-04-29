import React, { useState, useEffect } from 'react';
import { getPitchesByPitcher } from '../services/StorageService';

const GameSituationGuide = ({ pitcherId, gameId }) => {
  const [activeTab, setActiveTab] = useState('count');
  const [pitchData, setPitchData] = useState({
    counts: {},
    firstPitch: { type: null, percentage: 0 },
    twoStrikePitch: { type: null, percentage: 0 },
    threeBallPitch: { type: null, percentage: 0 },
    vsBatter: {
      left: { preferred: null, percentage: 0 },
      right: { preferred: null, percentage: 0 }
    }
  });

  useEffect(() => {
    const analyzePitchData = () => {
      // Get all pitches for this pitcher
      const allPitches = getPitchesByPitcher(pitcherId);
      
      // Filter for current game if gameId is provided
      const relevantPitches = gameId 
        ? allPitches.filter(pitch => pitch.gameId === gameId)
        : allPitches;
      
      if (relevantPitches.length === 0) {
        return;
      }
      
      // Analyze first pitch tendencies
      const firstPitches = relevantPitches.filter(pitch => pitch.count === '0-0');
      const firstPitchTypes = firstPitches.reduce((acc, pitch) => {
        acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
        return acc;
      }, {});
      
      let preferredFirstPitch = { type: 'No data', percentage: 0 };
      if (firstPitches.length > 0) {
        const sorted = Object.entries(firstPitchTypes)
          .sort((a, b) => b[1] - a[1]);
        
        if (sorted.length > 0) {
          const [type, count] = sorted[0];
          preferredFirstPitch = {
            type,
            percentage: Math.round((count / firstPitches.length) * 100)
          };
        }
      }
      
      // Analyze two-strike tendencies
      const twoStrikePitches = relevantPitches.filter(pitch => {
        const [, strikes] = pitch.count.split('-').map(Number);
        return strikes === 2;
      });
      
      const twoStrikeTypes = twoStrikePitches.reduce((acc, pitch) => {
        acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
        return acc;
      }, {});
      
      let preferredTwoStrikePitch = { type: 'No data', percentage: 0 };
      if (twoStrikePitches.length > 0) {
        const sorted = Object.entries(twoStrikeTypes)
          .sort((a, b) => b[1] - a[1]);
        
        if (sorted.length > 0) {
          const [type, count] = sorted[0];
          preferredTwoStrikePitch = {
            type,
            percentage: Math.round((count / twoStrikePitches.length) * 100)
          };
        }
      }
      
      // Analyze three-ball tendencies
      const threeBallPitches = relevantPitches.filter(pitch => {
        const [balls] = pitch.count.split('-').map(Number);
        return balls === 3;
      });
      
      const threeBallTypes = threeBallPitches.reduce((acc, pitch) => {
        acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
        return acc;
      }, {});
      
      let preferredThreeBallPitch = { type: 'No data', percentage: 0 };
      if (threeBallPitches.length > 0) {
        const sorted = Object.entries(threeBallTypes)
          .sort((a, b) => b[1] - a[1]);
        
        if (sorted.length > 0) {
          const [type, count] = sorted[0];
          preferredThreeBallPitch = {
            type,
            percentage: Math.round((count / threeBallPitches.length) * 100)
          };
        }
      }
      
      // Analyze batter handedness tendencies
      const leftBatters = relevantPitches.filter(pitch => pitch.batterSide === 'L');
      const rightBatters = relevantPitches.filter(pitch => pitch.batterSide === 'R');
      
      const leftTypes = leftBatters.reduce((acc, pitch) => {
        acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
        return acc;
      }, {});
      
      const rightTypes = rightBatters.reduce((acc, pitch) => {
        acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
        return acc;
      }, {});
      
      let vsLeft = { preferred: 'No data', percentage: 0 };
      if (leftBatters.length > 0) {
        const sorted = Object.entries(leftTypes)
          .sort((a, b) => b[1] - a[1]);
        
        if (sorted.length > 0) {
          const [type, count] = sorted[0];
          vsLeft = {
            preferred: type,
            percentage: Math.round((count / leftBatters.length) * 100)
          };
        }
      }
      
      let vsRight = { preferred: 'No data', percentage: 0 };
      if (rightBatters.length > 0) {
        const sorted = Object.entries(rightTypes)
          .sort((a, b) => b[1] - a[1]);
        
        if (sorted.length > 0) {
          const [type, count] = sorted[0];
          vsRight = {
            preferred: type,
            percentage: Math.round((count / rightBatters.length) * 100)
          };
        }
      }
      
      // Analyze counts
      const countMap = {};
      
      // Define key counts to track
      const keyCounts = ['0-0', '1-0', '0-1', '2-0', '0-2', '1-1', '2-1', '1-2', '3-0', '3-1', '3-2'];
      
      keyCounts.forEach(countKey => {
        const pitchesInCount = relevantPitches.filter(pitch => pitch.count === countKey);
        if (pitchesInCount.length > 0) {
          const types = pitchesInCount.reduce((acc, pitch) => {
            acc[pitch.pitchType] = (acc[pitch.pitchType] || 0) + 1;
            return acc;
          }, {});
          
          const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);
          const [preferredType, count] = sorted[0];
          const percentage = Math.round((count / pitchesInCount.length) * 100);
          
          countMap[countKey] = {
            preferredType,
            percentage,
            total: pitchesInCount.length
          };
        }
      });
      
      setPitchData({
        counts: countMap,
        firstPitch: preferredFirstPitch,
        twoStrikePitch: preferredTwoStrikePitch,
        threeBallPitch: preferredThreeBallPitch,
        vsBatter: {
          left: vsLeft,
          right: vsRight
        }
      });
    };
    
    analyzePitchData();
  }, [pitcherId, gameId]);

  const renderCountTab = () => {
    return (
      <div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Object.entries(pitchData.counts).map(([count, data]) => (
            <div key={count} className="bg-gray-100 p-2 rounded">
              <div className="font-bold text-center">{count}</div>
              <div className="text-sm text-center">{data.preferredType}</div>
              <div className="text-xs text-gray-500 text-center">{data.percentage}% ({data.total})</div>
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 p-3 rounded">
          <h4 className="font-medium mb-1">Key Counts</h4>
          
          <div className="space-y-2">
            {pitchData.firstPitch.type && (
              <div className="flex justify-between">
                <span>First Pitch:</span>
                <span className="font-medium">
                  {pitchData.firstPitch.type} ({pitchData.firstPitch.percentage}%)
                </span>
              </div>
            )}
            
            {pitchData.twoStrikePitch.type && (
              <div className="flex justify-between">
                <span>Two Strikes:</span>
                <span className="font-medium">
                  {pitchData.twoStrikePitch.type} ({pitchData.twoStrikePitch.percentage}%)
                </span>
              </div>
            )}
            
            {pitchData.threeBallPitch.type && (
              <div className="flex justify-between">
                <span>Three Balls:</span>
                <span className="font-medium">
                  {pitchData.threeBallPitch.type} ({pitchData.threeBallPitch.percentage}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBatterTab = () => {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-3 rounded">
          <h4 className="font-medium mb-2">vs. Left-handed Batters</h4>
          {pitchData.vsBatter.left.preferred === 'No data' ? (
            <p className="text-sm text-gray-500">No data available</p>
          ) : (
            <div>
              <div className="text-lg font-bold">
                {pitchData.vsBatter.left.preferred}
              </div>
              <div className="text-sm text-gray-700">
                Used {pitchData.vsBatter.left.percentage}% of the time
              </div>
              <div className="mt-2 text-sm">
                <strong>Strategy:</strong> Look for {pitchData.vsBatter.left.preferred} when behind in the count
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 p-3 rounded">
          <h4 className="font-medium mb-2">vs. Right-handed Batters</h4>
          {pitchData.vsBatter.right.preferred === 'No data' ? (
            <p className="text-sm text-gray-500">No data available</p>
          ) : (
            <div>
              <div className="text-lg font-bold">
                {pitchData.vsBatter.right.preferred}
              </div>
              <div className="text-sm text-gray-700">
                Used {pitchData.vsBatter.right.percentage}% of the time
              </div>
              <div className="mt-2 text-sm">
                <strong>Strategy:</strong> Look for {pitchData.vsBatter.right.preferred} when behind in the count
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="font-bold text-lg mb-3">Game Situation Guide</h2>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 ${activeTab === 'count' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('count')}
        >
          Count Strategy
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'batter' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('batter')}
        >
          Batter Matchups
        </button>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'count' && renderCountTab()}
        {activeTab === 'batter' && renderBatterTab()}
      </div>
    </div>
  );
};

export default GameSituationGuide;