/**
 * Geocoding Utilities for Water Tanker module
 */

const locationCache = new Map();

/**
 * Reverse geocodes coordinates into an address object.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} - The address object from Nominatim
 */
export const reverseGeocode = async (lat, lng) => {
  if (lat == null || lng == null) return null;

  // Round to 5 decimal places (~1m precision) for caching
  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (locationCache.has(cacheKey)) {
    return locationCache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          // Nominatim requires a User-Agent
          "User-Agent": "Digit-UI-WT-Module",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    locationCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error in reverseGeocode:", error);
    return null;
  }
};

/**
 * Extracts a human-readable area name from a Nominatim address object.
 * @param {Object} data - The Nominatim response data
 * @returns {string} - A concise area name
 */
export const getAreaName = (data, useFull = false) => {
  if (!data) return "Unknown Address";
  
  if (useFull && data.display_name) return data.display_name;
  if (!data.address) return data.display_name || "Unknown Address";

  const { address } = data;
  
  // Collect all relevant address parts for a full address
  const addressParts = [
    address.house_number || address.amenity,
    address.road,
    address.suburb || address.neighbourhood || address.village,
    address.city_district || address.city || address.town,
    address.state,
    address.postcode
  ].filter(Boolean);

  if (addressParts.length > 0) {
    return addressParts.join(", ");
  }

  return data.display_name || "Unknown Address";
};

/**
 * Helper to calculate distance between two coordinates in km
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Forward geocodes an address string into coordinates.
 * @param {string} address - The address string
 * @returns {Promise<Array>} - The geocoding results from Nominatim
 */
export const geocodeAddress = async (address) => {
  if (!address || !address.trim()) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "Digit-UI-WT-Module",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in geocodeAddress:", error);
    return null;
  }
};
