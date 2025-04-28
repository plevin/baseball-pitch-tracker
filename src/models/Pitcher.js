/**
 * Pitcher model for consistent data formatting
 */

/**
 * Create a new Pitcher object with default values
 * @param {Object} pitcherData - Optional partial pitcher data to initialize with
 * @returns {Object} - A properly formatted Pitcher object
 */
export const createPitcher = (pitcherData = {}) => {
    const defaults = {
      id: null,
      name: '',
      number: '',
      team: 'opponent', // 'opponent' or 'our'
      notes: ''
    };
    
    return {
      ...defaults,
      ...pitcherData
    };
  };
  
  /**
   * Validate a Pitcher object
   * @param {Object} pitcher - Pitcher object to validate
   * @returns {boolean} - True if valid
   */
  export const validatePitcher = (pitcher) => {
    if (!pitcher) return false;
    if (!pitcher.name || typeof pitcher.name !== 'string') return false;
    if (!pitcher.number || typeof pitcher.number !== 'string') return false;
    if (!pitcher.team || (pitcher.team !== 'opponent' && pitcher.team !== 'our')) return false;
    
    return true;
  };
  
  export default {
    createPitcher,
    validatePitcher
  };