// Environment configuration with fallbacks for mobile builds
export const CONFIG = {
  LAMBDA_URL: process.env.EXPO_PUBLIC_LAMBDA_URL || 'https://ndtvckiakm24uoxqj3dbhx3ocm0ynfpa.lambda-url.eu-west-2.on.aws',
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://ndtvckiakm24uoxqj3dbhx3ocm0ynfpa.lambda-url.eu-west-2.on.aws',
  COGNITO_CLIENT_ID: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || '4o3q1jj15uki6u7lsf05dv3sgf',
  COGNITO_REGION: process.env.EXPO_PUBLIC_COGNITO_REGION || 'eu-west-2'
};

export const LAMBDA_URL = CONFIG.LAMBDA_URL;

export const generateStoryAPI = async (storyData) => {
  const response = await fetch(LAMBDA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(storyData)
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return await response.json();
};
