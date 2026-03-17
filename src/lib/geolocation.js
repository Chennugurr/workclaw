import axios from 'axios';

export async function getLocationFromIP(ipAddress) {
  try {
    const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
    const { city, region, country_name, latitude, longitude } = response.data;
    return {
      city,
      region,
      country: country_name,
      latitude,
      longitude,
    };
  } catch (error) {
    console.error('Error fetching location from IP:', error);
    return null;
  }
}
