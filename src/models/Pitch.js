/**
 * Pitch model for consistent data formatting
 */

// Valid pitch types
export const PITCH_TYPES = ['fastball', 'off-speed'];

// Valid pitch results
export const PITCH_RESULTS = [
  'ball', 
  'strike', 
  'foul', 
  'swinging_strike',
  'hit', 
  'out'
];

// Valid batter sides
export const BATTER_SIDES = ['L', 'R'];

/**
 * Create a new Pitch object with default values
 * @param {Object} pitchData - Optional partial pitch data to initialize with
 * @returns {Object} - A properly formatted Pitch object
 */
export const createPitch = (pitchData = {}) => {
  const defaults = {
    id: null,
    pitcherId: null,
    gameId: null,
    inning: 1,
    isTop: true,
    count: '0-0',
    pitchType: 'fastball',
    result: 'strike',
    batterSide: 'R',
    timestamp: new Date().toISOString()
  };
  
  return {
    ...defaults,
    ...pitchData,
    // Force timestamp to be ISO string format
    timestamp: pitchData.timestamp 
      ? new Date(pitchData.timestamp).toISOString() 
      : defaults.timestamp
  };
};

/**
 * Validate a Pitch object
 * @param {Object} pitch - Pitch object to validate
 * @returns {boolean} - True if valid
 */
export const validatePitch = (pitch) => {
  if (!pitch) return false;
  if (!pitch.pitcherId) return false;
  if (!pitch.gameId) return false;
  
  // Validate inning
  if (typeof pitch.inning !== 'number' || pitch.inning < 1) return false;
  
  // Validate isTop
  if (typeof pitch.isTop !== 'boolean') return false;
  
  // Validate count format (balls-strikes)
  const countRegex = /^[0-3]-[0-2]$/;
  if (!countRegex.test(pitch.count)) return false;
  
  // Validate pitch type
  if (!PITCH_TYPES.includes(pitch.pitchType)) return false;
  
  // Validate result
  if (!PITCH_RESULTS.includes(pitch.result)) return false;
  
  // Validate batter side
  if (!BATTER_SIDES.includes(pitch.batterSide)) return false;
  
  // Check if timestamp is valid
  try {
    new Date(pitch.timestamp);
  } catch (e) {
    return false;
  }
  
  return true;
};

export default {
  createPitch,
  validatePitch,
  PITCH_TYPES,
  PITCH_RESULTS,
  BATTER_SIDES
};