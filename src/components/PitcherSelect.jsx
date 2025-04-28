import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameById, getPitchers, savePitcher } from '../services/StorageService';

const PitcherSelect = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  
  const [game, setGame] = useState(null);
  const [pitchers, setPitchers] = useState([]);
  const [pitcherTeam, setPitcherTeam] = useState('opponent');
  const [newPitcherName, setNewPitcherName] = useState('');
  const [newPitcherNumber, setNewPitcherNumber] = useState('');
  
  // Load game and pitchers data
  useEffect(() => {
    const loadData = async () => {
      // Get game data
      const gameData = getGameById(gameId);
      setGame(gameData);
      
      // Get pitchers
      const pitcherData = getPitchers();
      setPitchers(pitcherData);
    };
    
    loadData();
  }, [gameId]);
  
  // Handle creating a new pitcher
  const handleCreatePitcher = () => {
    if (!newPitcherName.trim()) {
      alert('Please enter pitcher name');
      return;
    }
    
    if (!newPitcherNumber.trim()) {
      alert('Please enter pitcher number');
      return;
    }
    
    try {
      const pitcher = {
        name: newPitcherName,
        number: newPitcherNumber,
        team: pitcherTeam
      };
      
      const savedPitcher = savePitcher(pitcher);
      setPitchers([...pitchers, savedPitcher]);
      
      // Clear form
      setNewPitcherName('');
      setNewPitcherNumber('');
      
      // Navigate to pitch tracker
      navigate(`/track/${savedPitcher.id}?gameId=${gameId}`);
    } catch (error) {
      console.error('Error creating pitcher:', error);
      alert('Failed to create pitcher');
    }
  };
  
  // Handle selecting an existing pitcher
  const handleSelectPitcher = (pitcher) => {
    navigate(`/track/${pitcher.id}?gameId=${gameId}`);
  };
  
  if (!game) {
    return <div className="p-4">Loading game data...</div>;
  }
  
  return (
    <div className="p-4">
      <div className="bg-blue-600 text-white p-4 rounded-t mb-4">
        <div className="flex justify-between">
          <button onClick={() => navigate('/game')}>&lt; Back</button>
          <h1>vs. {game.opponent}</h1>
          <div></div>
        </div>
      </div>
      
      <h2 className="text-lg font-bold mb-4">Select Pitcher</h2>
      
      {/* Team Selection Tabs */}
      <div className="flex mb-4 border-b">
        <button
          onClick={() => setPitcherTeam('opponent')}
          className={`flex-1 py-2 text-center ${
            pitcherTeam === 'opponent' 
              ? 'border-b-2 border-blue-600 text-blue-600 font-bold' 
              : 'text-gray-500'
          }`}
        >
          Opponent
        </button>
        <button
          onClick={() => setPitcherTeam('our')}
          className={`flex-1 py-2 text-center ${
            pitcherTeam === 'our' 
              ? 'border-b-2 border-blue-600 text-blue-600 font-bold' 
              : 'text-gray-500'
          }`}
        >
          Our Team
        </button>
      </div>
      
      {/* Pitcher List */}
      {pitchers.filter(p => p.team === pitcherTeam).length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-2">Recent Pitchers</h3>
          <div className="space-y-2">
            {pitchers
              .filter(p => p.team === pitcherTeam)
              .map(pitcher => (
                <button
                  key={pitcher.id}
                  onClick={() => handleSelectPitcher(pitcher)}
                  className="w-full bg-white p-3 rounded-lg shadow text-left flex justify-between items-center"
                >
                  <span>{pitcher.name}</span>
                  <span className="text-gray-500">#{pitcher.number}</span>
                </button>
              ))}
          </div>
        </div>
      )}
      
      {/* New Pitcher Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-bold mb-2">New Pitcher</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={newPitcherName}
              onChange={(e) => setNewPitcherName(e.target.value)}
              placeholder="Enter pitcher name"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number
            </label>
            <input
              type="text"
              value={newPitcherNumber}
              onChange={(e) => setNewPitcherNumber(e.target.value)}
              placeholder="Enter jersey number"
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={handleCreatePitcher}
            className="w-full bg-blue-600 text-white py-2 rounded font-bold"
          >
            Track This Pitcher
          </button>
        </div>
      </div>
    </div>
  );
};

export default PitcherSelect;