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
        {/* Logo - G with stars */}
        <div className="w-36 h-36 mx-auto mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" className="w-full h-full">
            <path fill="#0f52ba" d="M772.8,801.7c-36.7,0-73.3,0-110,0c0-30.7,0-61.3,0-92c36.7,0,73.3,0,110,0
              C772.8,740.3,772.8,771,772.8,801.7z"/>
            <path fill="#0f52ba" d="M159,159c82.1,0,164.3,0,246.4,0c0,30.7,0,61.3,0,92c-82.1,0-164.3,0-246.4,0
              C159,220.3,159,189.7,159,159z"/>
            <path fill="#0f52ba" d="M500,159c91.6,0,183.3,0,275,0c0,27.6,0,55.3,0,82.9c-1.8,1.7-3.1,4-5.4,4.9
              c-11.7,4.6-21.3,11.7-28.5,22c-8.7,12.4-12.5,26.3-13.3,41.2c-0.3,5.2-0.4,10.3-0.4,15.5c-0.1,76.3,0,152.7-0.2,229
              c0,12.1-1.5,24-5.1,35.6c-6.2,19.9-18.1,35.4-37.1,45.2c-14,7.3-29.1,9.5-44.7,9.2c-52-0.7-104.1-0.3-156.1-0.3
              c-1.7,0-3.3,0.2-5.1,0.3c0,32.7,0,64.8,0,97.3c0.7,0.1,1.2,0.3,1.7,0.3c54.5,0,109,0.1,163.4-0.1c3.5,0,7.1-0.4,10.4-1.3
              c18.7-5.1,32.8-16.5,43-32.6c7.4-11.7,11.5-24.8,13.6-38.5c1.1-7.3,1.5-14.7,1.5-22.1c0.1-77.6,0.2-155.3-0.1-232.9
              c0-10.1-1.2-20.1-3.9-29.8c-6-21.1-18.1-37.3-37.8-47.3c-15.2-7.7-31.4-10.1-48.1-10c-31.9,0.1-63.9,0-95.8,0.1
              c-4.9,0-9.8,0.4-13.8,3.3c-4.2,3-6.6,7.2-6.6,12.3c-0.2,30-0.3,60-0.1,90c0,3.4,1.5,7.9,3.8,10c3.2,2.9,7.9,2.8,12.4,2.8
              c31.6-0.1,63.3-0.1,94.9,0c4.6,0,9.2,0.5,13.6,1.7c15.4,4.3,25.2,14.4,29,29.9c4.2,17.3,1.3,33.2-11.7,46.3
              c-8.9,8.9-19.9,13-32.4,13.1c-18.3,0.1-36.6,0.1-54.9,0c-2.3,0-4.7-0.1-7-0.2c-4.6-0.2-8.4,1.1-11.4,4.8
              c-2.6,3.1-3.5,6.7-3.5,10.7c0,20.8-0.2,41.6,0.1,62.4c0.1,8.2,3.9,13.9,12.3,14.9c2.7,0.3,5.5,0.2,8.3,0.2
              c18.2,0,36.3,0,54.5,0c13.1,0,24.2-4.5,33.5-13.5c11.3-11,16.3-24.8,16.5-40.1c0.4-28.8,0.1-57.6,0.1-87.3
              c-18.3,0-36,0-53.9,0c0,9,0,17.5,0,26.8c18.3,0,36.3,0,54.7,0c0-54.1,0-107.7,0-161.9c-110,0-219.7,0-329.6,0
              C500,98.2,500,128.6,500,159z"/>
            <path fill="#0f52ba" d="M159,467.4c82.1,0,164.3,0,246.4,0c0,32,0,63.5,0,95.5c-82.1,0-164.3,0-246.4,0
              C159,531,159,499.2,159,467.4z"/>
            <path fill="#0f52ba" d="M270.5,866.4c-42.7-42.6-85.1-85.1-127.5-127.4c21,0,42,0,64.4,0c21.4,21.5,43.1,43.2,65.5,65.6
              c0-21.5,0-42.5,0-63.4c-37.9,0-75.8,0-114.3,0c0,86.7,0,173.2,0,260.1c30.7,0,61.3,0,92.9,0c0-38.5,0-76.8,0-115.1
              c0-5.8,0.2-11.6,0.2-17.4C257.6,873.8,263.9,873.1,270.5,866.4z"/>
            <path fill="#0f52ba" d="M582.1,804.6c-34.7,0-69.3,0-104,0c-9.3,0-18.7,0-28,0c0-32,0-63.5,0-95.5c44.3,0,88.6,0,133.6,0
              c0-30.7,0-60.9,0-91.7c-75.3,0-150.6,0-226.3,0c0,96,0,191.9,0,288.1c30.7,0,61.3,0,92.6,0c0-34.3,0-68.2,0-102.4
              c44.3,0,88.6,0,133.6,0c0,34,0,67.9,0,102.2c30.7,0,61.3,0,92.6,0c0-96,0-191.9,0-288.1c-31.3,0-62,0-93.9,0
              C582.1,680.4,582.1,742.5,582.1,804.6z"/>
            <path fill="#0f52ba" d="M178.9,978.1c-6.4-8.9-12.8-17.7-19.1-26.7c-1-1.5-1.9-3.1-3.6-5.8c10.3-7.4,20.8-14.9,32.3-23.1
              c-20.1-28.1-39.8-55.6-59.7-83.4c0,43.4,0,85.4,0,128.2c-15.3,10.2-30.2,20.2-45.8,30.7c0-63.7,0-126.1,0-189.8
              c18.7,0,36.6,0,55.5,0c26.5,37,52.8,73.8,80,112c4.8-3.4,9.7-6.8,14.7-10.2c0-34.3,0-68.2,0-102.3c15.1-10.3,30-20.5,45.7-31.1
              c0,63.9,0,126.4,0,189.5c-18.6,0-36.6,0-55.6,0C209.6,1019.8,194.2,999,178.9,978.1z"/>
            <path fill="#0f52ba" d="M331.8,960.9c15.2,0,29.6,0,44.4,0c0,13.3,0,26.2,0,39c-37.7,0-75.1,0-112.8,0c0-12.9,0-25.8,0-39.1
              c17.6,0,35,0,52.9,0c0-34,0-67.6,0-101.6c15.1,0,29.7,0,44.8,0C331.8,893.4,331.8,926.9,331.8,960.9z"/>
            <path fill="#0f52ba" d="M493,1000c-38.2,0-75.7,0-113.2,0c0-41.2,0-82.1,0-123.7c15.3,0,30.1,0,44.8,0
              c0,28.5,0,56.8,0,85.4c23,0,45.6,0,68.4,0C493,974.9,493,987.4,493,1000z"/>
            <path fill="#0f52ba" d="M547.5,961c14.7,0,29.3,0,44.4,0c0,12.9,0,25.6,0,38.6c-37.8,0-75.4,0-113.2,0
              c0-13,0-25.6,0-38.5c17.9,0,35.4,0,53.2,0c0-34.1,0-67.6,0-101.4c15.3,0,29.8,0,44.9,0
              C547.5,893.7,547.5,927.1,547.5,961z"/>
            <path fill="#0f52ba" d="M585.5,876.5c15.3,0,29.9,0,44.8,0c0,41.2,0,82,0,123c-15.3,0-29.9,0-44.8,0
              C585.5,958.3,585.5,917.6,585.5,876.5z"/>
            <path fill="#0f52ba" d="M846.1,876.2c15.3,0,29.9,0,44.9,0c0,41.2,0,82.1,0,123.4c-15.3,0-29.9,0-44.9,0
              C846.1,958.4,846.1,917.5,846.1,876.2z"/>
            <path fill="#0f52ba" d="M685,1000c0-41.2,0-82.2,0-123.5c53.4,0,106.5,0,160,0c0,13.2,0,25.8,0,38.8c-38.3,0-76.3,0-114.9,0
              c0,7.8,0,15.4,0,23.3c31,0,61.8,0,92.8,0c0,12.9,0,25.2,0,38c-30.8,0-61.5,0-92.7,0c0,7.9,0,15.3,0,23
              c38.4,0,76.5,0,115,0c0,13.1,0,25.9,0,39.1C791.4,1000,738.5,1000,685,1000z"/>
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