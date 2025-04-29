import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGames, getPitchers, exportAllData, importAllData } from '../services/StorageService';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [pitchers, setPitchers] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  
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
      {/* App Logo and Title */}
      <div className="text-center mb-8 mt-4">
        <div className="w-20 h-20 bg-baseball-blue rounded-full mx-auto flex items-center justify-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-12 h-12">
            <path d="M9.5 6.5C9.5 8.98528 7.48528 11 5 11C2.51472 11 0.5 8.98528 0.5 6.5C0.5 4.01472 2.51472 2 5 2C7.48528 2 9.5 4.01472 9.5 6.5Z" />
            <path d="M5.5 14C3.01472 14 1 16.0147 1 18.5C1 20.9853 3.01472 23 5.5 23C7.98528 23 10 20.9853 10 18.5C10 16.0147 7.98528 14 5.5 14Z" />
            <path d="M14 5.5C14 7.98528 16.0147 10 18.5 10C20.9853 10 23 7.98528 23 5.5C23 3.01472 20.9853 1 18.5 1C16.0147 1 14 3.01472 14 5.5Z" />
            <path d="M18.5 13C16.0147 13 14 15.0147 14 17.5C14 19.9853 16.0147 22 18.5 22C20.9853 22 23 19.9853 23 17.5C23 15.0147 20.9853 13 18.5 13Z" />
          </svg>
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
        
        {/* Scout Pitchers Link */}
        <button 
          onClick={() => navigate('/game')}
          className="bg-baseball-green text-white p-4 rounded-lg shadow-md flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Scout Pitchers
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