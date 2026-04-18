/**
 * Compares initial and current objects and returns an object containing only the differences.
 * Highly optimized for partial updates (PATCH-like behavior).
 * 
 * @param {Object} initial - The original data from the backend.
 * @param {Object} current - The current form state.
 * @returns {Object} - An object with only the changed fields.
 */
export const getPayloadDiff = (initial, current) => {
  const diff = {};
  
  Object.keys(current).forEach(key => {
    const initialVal = initial?.[key];
    const currentVal = current[key];

    // Handle nested objects (like addressDetails or aadhaarDetails)
    if (currentVal && typeof currentVal === 'object' && !Array.isArray(currentVal) && !(currentVal instanceof File)) {
      const nestedDiff = getPayloadDiff(initialVal || {}, currentVal);
      if (Object.keys(nestedDiff).length > 0) {
        diff[key] = nestedDiff;
      }
    } 
    // Handle primitive types or arrays/files
    else if (JSON.stringify(initialVal) !== JSON.stringify(currentVal)) {
      diff[key] = currentVal;
    }
  });

  return diff;
};

/**
 * Safely retrieves and parses JSON data from sessionStorage.
 * @param {string} key - The storage key.
 * @param {*} fallback - Default value if no data is found.
 * @returns {*} The parsed data or fallback.
 */
export const getSavedData = (key, fallback) => {
  const saved = sessionStorage.getItem(key);
  try {
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.warn(`Error parsing sessionStorage key "${key}":`, e);
    return fallback;
  }
};
