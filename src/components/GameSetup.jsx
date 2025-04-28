import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveGame, getGames } from '../services/StorageService';

const GameSetup = () => {
  const navigate = useNavigate();
  const [opponent, setOpponent] = useState('');
  const [location, setLocation] = useState('Home');
  const [games, setGames] = useState([]);
  
  // Load existing games on component mount
  useEffect(() => {
    const loadGames = () => {
      const existingGames = getGames();
      setGames(existingGames);
    };
    
    loadGames();
  }, []);
  
  const handleCreateGame = () => {
    if (!opponent.trim()) {
      alert('Please enter an opponent name');
      return;
    }
    
    try {
      // Create and save the new game
      const game = {
        opponent,
        location,
        date: new Date().toISOString()
      };
      
      const savedGame = saveGame(game);
      
      // Update the games list
      setGames([...games, savedGame]);
      
      // Reset form fields
      setOpponent('');
      
      // Navigate to pitcher selection screen
      navigate(`/pitcher-select/${savedGame.id}`);
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game');
    }
  };
  
  const handleSelectGame = (game) => {
    navigate(`/pitcher-select/${game.id}`);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Baseball Pitch Tracker</h1>
        <button 
          onClick={() => navigate('/settings')}
          className="text-blue-600"
        >
          Settings
        </button>
      </div>
      
      {/* Recent Games */}
      {games.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Recent Games</h2>
          <div className="space-y-2">
            {games.slice().reverse().map(game => (
              <button
                key={game.id}
                onClick={() => handleSelectGame(game)}
                className="w-full bg-white p-3 rounded-lg shadow text-left flex justify-between items-center"
              >
                <div>
                  <span className="font-medium">vs. {game.opponent}</span>
                  <span className="text-sm text-gray-500 ml-2">({game.location})</span>
                </div>
                <span className="text-gray-500 text-sm">{formatDate(game.date)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* New Game Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-bold mb-2">New Game</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opponent
            </label>
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="Enter opponent name"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="flex">
              <button
                onClick={() => setLocation('Home')}
                className={`flex-1 py-2 ${location === 'Home' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200'} rounded-l`}
              >
                Home
              </button>
              <button
                onClick={() => setLocation('Away')}
                className={`flex-1 py-2 ${location === 'Away' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200'} rounded-r`}
              >
                Away
              </button>
            </div>
          </div>
          
          <button
            onClick={handleCreateGame}
            className="w-full bg-blue-600 text-white py-2 rounded font-bold"
          >
            Create Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;