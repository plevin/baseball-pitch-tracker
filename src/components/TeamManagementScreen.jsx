import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPitchers, savePitcher } from '../services/StorageService';

const TeamManagementScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('our');
  const [pitchers, setPitchers] = useState([]);
  const [newPitcherName, setNewPitcherName] = useState('');
  const [newPitcherNumber, setNewPitcherNumber] = useState('');
  const [teamName, setTeamName] = useState(localStorage.getItem('ourTeamName') || 'Our Team');
  
  // Load pitchers data
  useEffect(() => {
    const loadData = () => {
      const allPitchers = getPitchers();
      setPitchers(allPitchers);
    };
    
    loadData();
  }, []);
  
  // Filter pitchers by team
  const filteredPitchers = pitchers.filter(pitcher => pitcher.team === activeTab);
  
  // Save our team name
  const saveTeamName = () => {
    localStorage.setItem('ourTeamName', teamName);
    alert('Team name saved successfully!');
  };
  
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
        team: activeTab
      };
      
      const savedPitcher = savePitcher(pitcher);
      setPitchers([...pitchers, savedPitcher]);
      
      // Clear form
      setNewPitcherName('');
      setNewPitcherNumber('');
      
    } catch (error) {
      console.error('Error creating pitcher:', error);
      alert('Failed to create pitcher');
    }
  };
  
  return (
    <div className="p-4 pb-20">
      <div className="bg-baseball-blue text-white p-4 rounded-t mb-4">
        <div className="flex justify-between">
          <button onClick={() => navigate(-1)}>&lt; Back</button>
          <h1 className="text-xl font-bold">Team Management</h1>
          <div></div>
        </div>
      </div>
      
      {/* Team Selection Tabs */}
      <div className="flex mb-4 border-b">
        <button
          onClick={() => setActiveTab('our')}
          className={`flex-1 py-2 text-center ${
            activeTab === 'our' 
              ? 'border-b-2 border-baseball-blue text-baseball-blue font-bold' 
              : 'text-gray-500'
          }`}
        >
          Our Team
        </button>
        <button
          onClick={() => setActiveTab('opponent')}
          className={`flex-1 py-2 text-center ${
            activeTab === 'opponent' 
              ? 'border-b-2 border-baseball-blue text-baseball-blue font-bold' 
              : 'text-gray-500'
          }`}
        >
          Opponents
        </button>
      </div>
      
      {/* Our Team Name Setting */}
      {activeTab === 'our' && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="font-bold mb-2">Team Name</h2>
          <div className="flex">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter your team name"
              className="flex-1 p-2 border rounded-l"
            />
            <button
              onClick={saveTeamName}
              className="bg-baseball-blue text-white px-4 py-2 rounded-r"
            >
              Save
            </button>
          </div>
        </div>
      )}
      
      {/* Pitchers List */}
      {filteredPitchers.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold mb-2">
            {activeTab === 'our' ? teamName : 'Opponent'} Pitchers
          </h2>
          <div className="space-y-2">
            {filteredPitchers.map(pitcher => (
              <div
                key={pitcher.id}
                className="w-full bg-white p-3 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <span className="font-medium">{pitcher.name}</span>
                  <span className="text-sm text-gray-500 ml-2">#{pitcher.number}</span>
                </div>
                <button 
                  onClick={() => {
                    const pitches = []
                    if (pitches.length > 0) {
                      navigate(`/enhanced-insights/${pitcher.id}`);
                    } else {
                      alert('No pitches tracked yet for this pitcher');
                    }
                  }}
                  className="text-baseball-blue"
                >
                  Stats
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add New Pitcher Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-bold mb-2">
          Add New {activeTab === 'our' ? teamName : 'Opponent'} Pitcher
        </h2>
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
            className="w-full bg-baseball-blue text-white py-2 rounded font-bold"
          >
            Add Pitcher
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementScreen;