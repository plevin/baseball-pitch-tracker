import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGames, getPitchers, exportAllData, importAllData } from '../services/StorageService';
// Import the logo directly in the React component
import logoImage from '../assets/logo.png'; // You'll need to add the logo to this path

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [pitchers, setPitchers] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [teamName, setTeamName] = useState(localStorage.getItem('ourTeamName') || 'Our Team');
  
  // Load existing data
  useEffect(() => {
    const loadData = () => {
      const existingGames = getGames();
      const existingPitchers = getPitchers();
      setGames(existingGames);
      setPitchers(existingPitchers);
    };
    
    loadData();
  }, []);
  
  // Handle creating a new game
  const handleNewGame = () => {
    navigate('/game');
  };
  
  // Handle continuing an existing game
  const handleContinueGame = (gameId) => {
    navigate(`/pitcher-select/${gameId}`);
  };
  
  // Handle exporting data
  const handleExportData = () => {
    try {
      // Get all data
      const data = exportAllData();
      
      // Convert to JSON string
      const dataStr = JSON.stringify(data, null, 2);
      
      // Create a blob
      const blob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `baseball-pitch-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
      
      setExportStatus({
        success: true,
        message: 'Data exported successfully'
      });
      
      // Clear status after a few seconds
      setTimeout(() => {
        setExportStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({
        success: false,
        message: `Export failed: ${error.message}`
      });
    }
  };
  
  // Handle importing data
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Parse JSON
        const data = JSON.parse(e.target.result);
        
        // Import data
        importAllData(data);
        
        setImportStatus({
          success: true,
          message: 'Import successful! Reloading data...'
        });
        
        // Reload data after import
        setTimeout(() => {
          const existingGames = getGames();
          const existingPitchers = getPitchers();
          setGames(existingGames);
          setPitchers(existingPitchers);
          
          // Clear status
          setImportStatus(null);
        }, 2000);
      } catch (error) {
        console.error('Import error:', error);
        setImportStatus({
          success: false,
          message: `Import failed: ${error.message}`
        });
      }
    };
    
    reader.onerror = () => {
      setImportStatus({
        success: false,
        message: 'Error reading file'
      });
    };
    
    reader.readAsText(file);
  };
  
  // Handle resetting all data
  const handleResetData = () => {
    localStorage.removeItem('baseballGames');
    localStorage.removeItem('baseballPitchers');
    localStorage.removeItem('baseballPitches');
    
    // Reset state
    setGames([]);
    setPitchers([]);
    setShowResetConfirm(false);
    
    // Show temporary success message
    setImportStatus({
      success: true,
      message: 'All data has been reset'
    });
    
    // Clear status after a few seconds
    setTimeout(() => {
      setImportStatus(null);
    }, 3000);
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
    <div className="p-4 max-w-md mx-auto">
      {/* Custom Logo and Title */}
      <div className="text-center mb-8 mt-4">
        {/* Logo - Using the imported image file */}
        <div className="w-48 h-48 mx-auto mb-2 flex items-center justify-center">
          <img 
            src={logoImage} 
            alt="Baseball Pitch Tracker Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-baseball-blue">Baseball Pitch Tracker</h1>
        <p className="text-gray-600">Track pitches, analyze patterns, gain insights</p>
      </div>
      
      {/* Main Actions */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <button 
          onClick={handleNewGame}
          className="bg-baseball-blue text-white p-4 rounded-lg shadow-md flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Start New Game
        </button>
        
        {/* Team Management Link */}
        <button 
          onClick={() => navigate('/team')}
          className="bg-baseball-green text-white p-4 rounded-lg shadow-md flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Manage Teams
        </button>
        
        {/* Scout Pitchers Link */}
        <button 
          onClick={() => navigate('/scout')}
          className="bg-baseball-red text-white p-4 rounded-lg shadow-md flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Scout Opponents
        </button>
      </div>
      
      {/* Recent Games (if any) */}
      {games.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2 text-gray-700">Recent Games</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {games.slice().reverse().slice(0, 5).map(game => (
              <button
                key={game.id}
                onClick={() => handleContinueGame(game.id)}
                className="w-full bg-white p-3 rounded-lg shadow-sm text-left flex justify-between items-center hover:bg-gray-50"
              >
                <div className="flex flex-col">
                  <span className="font-medium">vs. {game.opponent}</span>
                  <span className="text-sm text-gray-500">{game.location}</span>
                </div>
                <span className="text-gray-500 text-sm">{formatDate(game.date)}</span>
              </button>
            ))}
            
            {games.length > 5 && (
              <button
                onClick={() => navigate('/game')}
                className="w-full text-center text-baseball-blue py-2"
              >
                View All Games
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Your Team's Pitchers (if any) */}
      {pitchers.filter(p => p.team === 'our').length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2 text-gray-700">{teamName} Pitchers</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {pitchers.filter(p => p.team === 'our').map(pitcher => (
              <div
                key={pitcher.id}
                className="w-full bg-white p-3 rounded-lg shadow-sm text-left flex justify-between items-center"
              >
                <div className="flex items-center">
                  <span className="font-medium">{pitcher.name}</span>
                  <span className="text-sm text-gray-500 ml-2">#{pitcher.number}</span>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => navigate('/team')}
              className="w-full text-center text-baseball-blue py-2"
            >
              Manage Team
            </button>
          </div>
        </div>
      )}
      
      {/* Data Management */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-lg font-bold mb-4 text-gray-700">Data Management</h2>
        
        <div className="space-y-4">
          {/* Backup Data */}
          <div>
            <button
              onClick={handleExportData}
              className="w-full bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 rounded flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Backup Data
            </button>
            {exportStatus && (
              <p className={`mt-1 text-sm ${exportStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                {exportStatus.message}
              </p>
            )}
          </div>
          
          {/* Restore Data */}
          <div>
            <label className="w-full bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 rounded flex items-center justify-center cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Restore from Backup
              <input 
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            {importStatus && (
              <p className={`mt-1 text-sm ${importStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                {importStatus.message}
              </p>
            )}
          </div>
          
          {/* Reset Data */}
          <div>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full bg-red-100 border border-red-300 text-red-700 py-2 px-4 rounded flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Reset All Data
              </button>
            ) : (
              <div className="border border-red-300 rounded p-3 bg-red-50">
                <p className="text-sm text-red-700 mb-2">Are you sure? This will delete all games, pitchers, and pitch data.</p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleResetData}
                    className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-sm"
                  >
                    Yes, Delete All
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-1 px-2 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* App Info */}
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Baseball Pitch Tracker v1.0.0</p>
        <button 
          onClick={() => navigate('/settings')}
          className="text-baseball-blue mt-1"
        >
          Settings
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;