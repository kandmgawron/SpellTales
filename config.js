export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  LAMBDA_URL: process.env.EXPO_PUBLIC_LAMBDA_URL,
};

export const generateStoryAPI = async (storyData) => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/generate-story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${storyData.userProfile?.accessToken || ''}`
    },
    body: JSON.stringify({
      genre: storyData.genre,
      character1: storyData.character1,
      character2: storyData.character2,
      keyword1: storyData.keyword1,
      keyword2: storyData.keyword2,
      keyword3: storyData.keyword3,
      ageRating: storyData.ageRating,
      spellingWords: storyData.spellingWords,
      userEmail: storyData.userEmail,
      userProfile: storyData.userProfile
    })
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }
  
  return await response.json();
};
