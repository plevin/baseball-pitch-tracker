import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGames, getPitchers, getPitchesByPitcher } from '../services/StorageService';

const ScoutScreen = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [pitchers, setPitchers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load teams and pitchers data
  useEffect(() => {
    const loadData = async () => {
      // Get all games to extract opponent teams
      const games = getGames();
      
      // Extract unique opponent teams
      const uniqueTeams = [...new Set(games.map(game => game.opponent))];
      setTeams(uniqueTeams);
      
      // Get all pitchers
      const allPitchers = getPitchers().filter(pitcher => pitcher.team === 'opponent');
      setPitchers(allPitchers);
      
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  // Filter pitchers by team
  const pitchersForTeam = selectedTeam 
    ? pitchers.filter(pitcher => {
        // Find games where this pitcher was tracked
        const pitcherGames = getGames().filter(game => {
          const pitcherPitches = getPitchesByPitcher(pitcher.id);
          // Check if any pitches by this pitcher exist for this game
          return pitcherPitches.some(pitch => pitch.gameId === game.id);
        });
        
        // Check if any of those games were against the selected team
        return pitcherGames.some(game => game.opponent === selectedTeam);
      })
    : [];
  
  // Filter pitchers by those with recorded pitches
  const pitchersWithData = pitchers.filter(pitcher => {
    const pitches = getPitchesByPitcher(pitcher.id);
    return pitches.length > 0;
  });
  
  // Group pitchers by team
  const getPitchersByTeam = () => {
    const teamMap = {};
    
    // For each pitcher with data, find which team(s) they pitched for
    pitchersWithData.forEach(pitcher => {
      // Get all games where this pitcher threw pitches
      const pitcherPitches = getPitchesByPitcher(pitcher.id);
      
      // Extract unique game IDs
      const gameIds = [...new Set(pitcherPitches.map(pitch => pitch.gameId))];
      
      // Get team names for these games
      gameIds.forEach(gameId => {
        const game = getGames().find(g => g.id === gameId);
        if (game) {
          if (!teamMap[game.opponent]) {
            teamMap[game.opponent] = [];
          }
          
          // Only add pitcher if not already in the list
          if (!teamMap[game.opponent].some(p => p.id === pitcher.id)) {
            teamMap[game.opponent].push(pitcher);
          }
        }
      });
    });
    
    return teamMap;
  };
  
  const pitchersByTeam = getPitchersByTeam();
  
  // Handle viewing pitcher insights
  const viewPitcherInsights = (pitcher) => {
    // Get most recent game for this pitcher
    const pitcherPitches = getPitchesByPitcher(pitcher.id);
    const gameIds = [...new Set(pitcherPitches.map(pitch => pitch.gameId))];
    const mostRecentGameId = gameIds.sort().reverse()[0];
    
    // Navigate to enhanced insights for this pitcher
    navigate(`/enhanced-insights/${pitcher.id}?gameId=${mostRecentGameId}`);
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading scouting data...</div>;
  }
  
  return (
    <div className="p-4 pb-20">
      <div className="bg-baseball-blue text-white p-4 rounded-t mb-4">
        <h1 className="text-xl font-bold text-center">Pitcher Scouting Report</h1>
      </div>
      
      {/* Team Filter */}
      {teams.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Teams</h2>
          <div className="flex flex-wrap gap-2">
            {teams.map(team => (
              <button
                key={team}
                onClick={() => setSelectedTeam(selectedTeam === team ? null : team)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTeam === team 
                    ? 'bg-baseball-blue text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {team}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Pitchers by Team */}
      {Object.keys(pitchersByTeam).length > 0 ? (
        selectedTeam ? (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">{selectedTeam} Pitchers</h2>
              <button 
                onClick={() => setSelectedTeam(null)}
                className="text-sm text-baseball-blue"
              >
                Show All Teams
              </button>
            </div>
            
            {pitchersByTeam[selectedTeam]?.length > 0 ? (
              <div className="space-y-2">
                {pitchersByTeam[selectedTeam].map(pitcher => (
                  <button
                    key={pitcher.id}
                    onClick={() => viewPitcherInsights(pitcher)}
                    className="w-full bg-white p-3 rounded-lg shadow text-left flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">{pitcher.name}</span>
                      <span className="text-sm text-gray-500 ml-2">#{pitcher.number}</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No pitchers found for this team.</p>
            )}
          </div>
        ) : (
          <div>
            {Object.entries(pitchersByTeam).map(([team, teamPitchers]) => (
              <div key={team} className="mb-6">
                <h2 className="text-lg font-bold mb-2">{team}</h2>
                <div className="space-y-2">
                  {teamPitchers.map(pitcher => (
                    <button
                      key={pitcher.id}
                      onClick={() => viewPitcherInsights(pitcher)}
                      className="w-full bg-white p-3 rounded-lg shadow text-left flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium">{pitcher.name}</span>
                        <span className="text-sm text-gray-500 ml-2">#{pitcher.number}</span>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pitchers Tracked Yet</h3>
          <p className="text-gray-500 mb-4">Start tracking pitches in a game to build your scouting report.</p>
          <button
            onClick={() => navigate('/game')}
            className="bg-baseball-blue text-white py-2 px-4 rounded font-medium"
          >
            Track a New Game
          </button>
        </div>
      )}
    </div>
  );
};

export default ScoutScreen;