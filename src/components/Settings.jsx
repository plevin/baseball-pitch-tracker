import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportAllData, importAllData } from '../services/StorageService';

const Settings = () => {
  const navigate = useNavigate();
  const [importStatus, setImportStatus] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  
  // Export all data as JSON
  const handleExport = () => {
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
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({
        success: false,
        message: `Export failed: ${error.message}`
      });
    }
  };
  
  // Import data from file
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Parse JSON
        const data = JSON.parse(e.target.result);
        
        // Import data
        const result = importAllData(data);
        
        setImportStatus({
          success: true,
          message: `Import successful: ${result.gamesImported} games, ${result.pitchersImported} pitchers, ${result.pitchesImported} pitches`
        });
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
  
  return (
    <div className="p-4">
      <div className="bg-blue-600 text-white p-4 rounded-t mb-4">
        <div className="flex justify-between">
          <button onClick={() => navigate(-1)}>&lt; Back</button>
          <h1>Settings</h1>
          <div></div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Data Management */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-4">Data Management</h2>
          
          {/* Export Data */}
          <div className="mb-4">
            <h3 className="font-bold mb-2">Export Data</h3>
            <p className="text-sm text-gray-600 mb-2">
              Export all your data to a JSON file for backup or transfer.
            </p>
            <button
              onClick={handleExport}
              className="bg-blue-600 text-white py-2 px-4 rounded"
            >
              Export All Data
            </button>
            {exportStatus && (
              <p className={`mt-2 text-sm ${exportStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                {exportStatus.message}
              </p>
            )}
          </div>
          
          {/* Import Data */}
          <div>
            <h3 className="font-bold mb-2">Import Data</h3>
            <p className="text-sm text-gray-600 mb-2">
              Import data from a previously exported JSON file.
            </p>
            <p className="text-sm text-red-600 mb-2">
              Warning: This will overwrite all existing data.
            </p>
            <label className="block">
              <span className="sr-only">Choose file</span>
              <input 
                type="file"
                accept=".json"
                onChange={handleImport}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700"
              />
            </label>
            {importStatus && (
              <p className={`mt-2 text-sm ${importStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                {importStatus.message}
              </p>
            )}
          </div>
        </div>
        
        {/* About */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2">About</h2>
          <p>Baseball Pitch Tracker</p>
          <p className="text-sm text-gray-600">Version 1.0.0</p>
          <p className="text-sm text-gray-600 mt-2">
            A mobile-friendly web app for tracking baseball pitches
            and analyzing patterns during youth baseball games.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;