// Using localStorage for now, but this could be upgraded to IndexedDB or a backend API
// Simple wrapper for localStorage with utility functions for our app

import { createGame, validateGame } from '../models/Game';
import { createPitcher, validatePitcher } from '../models/Pitcher';
import { createPitch, validatePitch } from '../models/Pitch';

// Game functions
export const saveGame = (gameData) => {
  try {
    // Create and validate game object
    const game = createGame(gameData);
    if (!validateGame(game)) {
      throw new Error('Invalid game data');
    }
    
    // Get existing games
    const games = getGames();
    
    // Generate a unique ID for the new game if not provided
    if (!game.id) {
      game.id = Date.now().toString();
    }
    
    // Check if game with this ID already exists
    const existingIndex = games.findIndex(g => g.id === game.id);
    
    if (existingIndex >= 0) {
      // Update existing game
      games[existingIndex] = game;
    } else {
      // Add new game
      games.push(game);
    }
    
    // Save the updated list
    localStorage.setItem('baseballGames', JSON.stringify(games));
    
    return game;
  } catch (error) {
    console.error('Error saving game:', error);
    throw error;
  }
};

export const getGames = () => {
  try {
    const gamesJSON = localStorage.getItem('baseballGames');
    return gamesJSON ? JSON.parse(gamesJSON) : [];
  } catch (error) {
    console.error('Error getting games:', error);
    return [];
  }
};

export const getGameById = (id) => {
  try {
    const games = getGames();
    return games.find(game => game.id === id) || null;
  } catch (error) {
    console.error(`Error getting game with id ${id}:`, error);
    return null;
  }
};

// Pitcher functions
export const savePitcher = (pitcherData) => {
  try {
    // Create and validate pitcher object
    const pitcher = createPitcher(pitcherData);
    if (!validatePitcher(pitcher)) {
      throw new Error('Invalid pitcher data');
    }
    
    // Get existing pitchers
    const pitchers = getPitchers();
    
    // Generate a unique ID for the new pitcher if not provided
    if (!pitcher.id) {
      pitcher.id = Date.now().toString();
    }
    
    // Check if pitcher with this ID already exists
    const existingIndex = pitchers.findIndex(p => p.id === pitcher.id);
    
    if (existingIndex >= 0) {
      // Update existing pitcher
      pitchers[existingIndex] = pitcher;
    } else {
      // Add new pitcher
      pitchers.push(pitcher);
    }
    
    // Save the updated list
    localStorage.setItem('baseballPitchers', JSON.stringify(pitchers));
    
    return pitcher;
  } catch (error) {
    console.error('Error saving pitcher:', error);
    throw error;
  }
};

export const getPitchers = () => {
  try {
    const pitchersJSON = localStorage.getItem('baseballPitchers');
    return pitchersJSON ? JSON.parse(pitchersJSON) : [];
  } catch (error) {
    console.error('Error getting pitchers:', error);
    return [];
  }
};

export const getPitcherById = (id) => {
  try {
    const pitchers = getPitchers();
    return pitchers.find(pitcher => pitcher.id === id) || null;
  } catch (error) {
    console.error(`Error getting pitcher with id ${id}:`, error);
    return null;
  }
};

// Pitch functions
export const savePitch = (pitchData) => {
  try {
    // Create and validate pitch object
    const pitch = createPitch(pitchData);
    if (!validatePitch(pitch)) {
      throw new Error('Invalid pitch data');
    }
    
    // Get existing pitches
    const pitches = getPitches();
    
    // Generate a unique ID for the new pitch if not provided
    if (!pitch.id) {
      pitch.id = Date.now().toString();
    }
    
    // Check if pitch with this ID already exists
    const existingIndex = pitches.findIndex(p => p.id === pitch.id);
    
    if (existingIndex >= 0) {
      // Update existing pitch
      pitches[existingIndex] = pitch;
    } else {
      // Add new pitch
      pitches.push(pitch);
    }
    
    // Save the updated list
    localStorage.setItem('baseballPitches', JSON.stringify(pitches));
    
    return pitch;
  } catch (error) {
    console.error('Error saving pitch:', error);
    throw error;
  }
};

export const getPitches = () => {
  try {
    const pitchesJSON = localStorage.getItem('baseballPitches');
    return pitchesJSON ? JSON.parse(pitchesJSON) : [];
  } catch (error) {
    console.error('Error getting pitches:', error);
    return [];
  }
};

export const getPitchesByPitcher = (pitcherId) => {
  try {
    const pitches = getPitches();
    return pitches.filter(pitch => pitch.pitcherId === pitcherId);
  } catch (error) {
    console.error(`Error getting pitches for pitcher ${pitcherId}:`, error);
    return [];
  }
};

export const getPitchesByGame = (gameId) => {
  try {
    const pitches = getPitches();
    return pitches.filter(pitch => pitch.gameId === gameId);
  } catch (error) {
    console.error(`Error getting pitches for game ${gameId}:`, error);
    return [];
  }
};

// Export functions for data backup and restore
export const exportAllData = () => {
  try {
    const data = {
      games: getGames(),
      pitchers: getPitchers(),
      pitches: getPitches(),
      exportDate: new Date().toISOString()
    };
    
    return data;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const importAllData = (data) => {
  try {
    if (!data) throw new Error('No data provided');
    
    // Validate the data format
    if (!data.games || !Array.isArray(data.games)) throw new Error('Invalid games data');
    if (!data.pitchers || !Array.isArray(data.pitchers)) throw new Error('Invalid pitchers data');
    if (!data.pitches || !Array.isArray(data.pitches)) throw new Error('Invalid pitches data');
    
    // Validate and clean up each entity
    const games = data.games.filter(game => validateGame(createGame(game)));
    const pitchers = data.pitchers.filter(pitcher => validatePitcher(createPitcher(pitcher)));
    const pitches = data.pitches.filter(pitch => validatePitch(createPitch(pitch)));
    
    // Save the data
    localStorage.setItem('baseballGames', JSON.stringify(games));
    localStorage.setItem('baseballPitchers', JSON.stringify(pitchers));
    localStorage.setItem('baseballPitches', JSON.stringify(pitches));
    
    return {
      gamesImported: games.length,
      pitchersImported: pitchers.length,
      pitchesImported: pitches.length
    };
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

export default {
  saveGame,
  getGames,
  getGameById,
  savePitcher,
  getPitchers,
  getPitcherById,
  savePitch,
  getPitches,
  getPitchesByPitcher,
  getPitchesByGame,
  exportAllData,
  importAllData
};