import ApiConstants from 'src/core/constants/ApiConstants';
export const fetchAppRemoteConfig = async () => {
  try {
    const response = await fetch(`${ApiConstants.SERVER_URL}/api/v1/config`);
    if (!response.ok) {
      throw new Error('Server response was not ok');
    }

    const config = await response.json();
    return config;
  } catch (error) {
    console.error('Fetch Config from Server error:', error);
    return null;
  }
};
