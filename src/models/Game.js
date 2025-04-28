/**
 * Game model for consistent data formatting
 */

/**
 * Create a new Game object with default values
 * @param {Object} gameData - Optional partial game data to initialize with
 * @returns {Object} - A properly formatted Game object
 */
export const createGame = (gameData = {}) => {
    const defaults = {
      id: null,
      opponent: '',
      location: 'Home',
      date: new Date().toISOString(),
      notes: ''
    };
    
    return {
      ...defaults,
      ...gameData,
      // Force date to be ISO string format
      date: gameData.date ? new Date(gameData.date).toISOString() : defaults.date
    };
  };
  
  /**
   * Validate a Game object
   * @param {Object} game - Game object to validate
   * @returns {boolean} - True if valid
   */
  export const validateGame = (game) => {
    if (!game) return false;
    if (!game.opponent || typeof game.opponent !== 'string') return false;
    if (!game.location || typeof game.location !== 'string') return false;
    
    // Check if date is valid
    try {
      new Date(game.date);
    } catch (e) {
      return false;
    }
    
    return true;
  };
  
  export default {
    createGame,
    validateGame
  };