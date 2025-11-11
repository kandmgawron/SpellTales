import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Modal, AppState, ImageBackground } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFonts, Chewy_400Regular } from '@expo-google-fonts/chewy';
import Markdown from 'react-native-markdown-display';
import AuthScreen from './AuthScreen';
import ManageWordsScreen from './ManageWordsScreen';
import AgeRatingScreen from './AgeRatingScreen';
import SavedStoriesScreen from './SavedStoriesScreen';
import SupportScreen from './SupportScreen';
import FAQScreen from './FAQScreen';
import AdModal from './components/AdModal';
import SubscriptionModal from './components/SubscriptionModal';
import UpgradeModal from './components/UpgradeModal';
import MenuDropdown from './components/MenuDropdown';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import ErrorBoundary from './components/ErrorBoundary';
import CustomSplashScreen from './components/SplashScreen';
import ProfileScreen from './ProfileScreen';
import StoryDisplayScreen from './components/StoryDisplayScreen';
import VisualStoryCreator from './components/VisualStoryCreator';
import { generateStoryAPI } from './config';
import { rateLimiter } from './utils/rateLimiter';
import { validateInput } from './utils/security';
import { SubscriptionService } from './services/SubscriptionService';
import { AdService } from './services/AdService';

export default function App() {
  let [fontsLoaded] = useFonts({
    Chewy_400Regular,
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('stories'); // 'stories', 'words', 'age-rating', 'saved-stories', 'support', 'faq', 'visual', 'story-display', 'profiles'
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  
  // Story screen state
  const [story, setStory] = useState('');
  const [genre, setGenre] = useState('random');
  const [character1, setCharacter1] = useState('');
  const [character2, setCharacter2] = useState('');
  const [keyword1, setKeyword1] = useState('');
  const [keyword2, setKeyword2] = useState('');
  const [keyword3, setKeyword3] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [retryData, setRetryData] = useState(null);
  const [currentAgeRating, setCurrentAgeRating] = useState('children');
  const [fontSize, setFontSize] = useState(16);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getGenresForAge = (ageRating) => {
    const baseGenres = [{ label: 'Random Genre', value: 'random' }];
    
    if (ageRating === 'toddlers') {
      return baseGenres.concat([
        { label: 'Adventure', value: 'adventure' },
        { label: 'Friendship', value: 'friendship' },
        { label: 'Animals', value: 'animals' },
        { label: 'Silly & Fun', value: 'silly' },
        { label: 'Bedtime', value: 'bedtime' },
        { label: 'Family', value: 'family' },
      ]);
    } else if (ageRating === 'children') {
      return baseGenres.concat([
        { label: 'Adventure', value: 'adventure' },
        { label: 'Fairy Tale', value: 'fairy-tale' },
        { label: 'Mystery', value: 'mystery' },
        { label: 'Friendship', value: 'friendship' },
        { label: 'Magic', value: 'magic' },
        { label: 'Animals', value: 'animals' },
        { label: 'Silly & Fun', value: 'silly' },
        { label: 'Space', value: 'space' },
      ]);
    } else if (ageRating === 'young_teens') {
      return baseGenres.concat([
        { label: 'Adventure', value: 'adventure' },
        { label: 'Mystery', value: 'mystery' },
        { label: 'Fantasy', value: 'fantasy' },
        { label: 'Friendship', value: 'friendship' },
        { label: 'Magic', value: 'magic' },
        { label: 'Space', value: 'space' },
        { label: 'Time Travel', value: 'time-travel' },
        { label: 'Superhero', value: 'superhero' },
      ]);
    } else { // teens
      return baseGenres.concat([
        { label: 'Adventure', value: 'adventure' },
        { label: 'Mystery', value: 'mystery' },
        { label: 'Fantasy', value: 'fantasy' },
        { label: 'Romance', value: 'romance' },
        { label: 'Coming of Age', value: 'coming-of-age' },
        { label: 'Friendship', value: 'friendship' },
        { label: 'Identity', value: 'identity' },
        { label: 'Independence', value: 'independence' },
        { label: 'Relationships', value: 'relationships' },
      ]);
    }
  };

  const [userWords, setUserWords] = useState([]);

  // Get current age rating (from profile or global)
  const loadUserWords = async () => {
    if (!userEmail || isGuestMode) {
      console.log('loadUserWords: No userEmail or guest mode, returning empty array');
      return [];
    }
    
    console.log('loadUserWords: Loading words for', userEmail);
    
    try {
      const response = await fetch(process.env.EXPO_PUBLIC_LAMBDA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_user_words',
          userEmail: userEmail
        })
      });

      const result = await response.json();
      console.log('loadUserWords: API response', result);
      
      if (result.success && result.words) {
        console.log('loadUserWords: Returning words', result.words);
        setUserWords(result.words); // Update state for other uses
        return result.words;
      } else {
        console.log('loadUserWords: No words found, returning empty array');
        setUserWords([]);
        return [];
      }
    } catch (error) {
      console.log('Error loading user words:', error);
      setUserWords([]);
      return [];
    }
  };

  const getCurrentAgeRating = () => {
    return currentProfile ? currentProfile.ageRating : currentAgeRating;
  };

  const genres = getGenresForAge(getCurrentAgeRating());

  useEffect(() => {
    checkAuthState();
    loadAgeRating();
    loadProfiles();
    
    // Initialize ad service
    AdService.initialize().catch(error => {
      console.error('Failed to initialize ads:', error);
    });

    // Show splash screen for 2 seconds
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground - refresh subscription status
        if (userEmail) {
          checkSubscriptionStatus();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const loadAgeRating = async () => {
    try {
      const rating = await SecureStore.getItemAsync('ageRating');
      if (rating) {
        setCurrentAgeRating(rating);
      }
    } catch (error) {
      console.error('Error loading age rating:', error);
    }
  };

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const email = await SecureStore.getItemAsync('userEmail');
      if (token && email) {
        setIsAuthenticated(true);
        setUserEmail(email);
        setAccessToken(token);
        loadLastStory();
        // Check subscription after email is set
        const status = await SubscriptionService.checkSubscriptionStatus(email);
        setSubscriptionStatus(status);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!userEmail) {
      setSubscriptionStatus({ isSubscribed: false, subscriptionType: 'free' });
      return;
    }
    
    // Guest users are always free users (should see ads)
    if (isGuestMode) {
      setSubscriptionStatus({ isSubscribed: false, subscriptionType: 'free' });
      return;
    }
    
    try {
      const status = await SubscriptionService.checkSubscriptionStatus(userEmail);
      setSubscriptionStatus(status);
    } catch (error) {
      // Default to free tier on error
      setSubscriptionStatus({ isSubscribed: false, subscriptionType: 'free' });
    }
  };

  const handleAuthSuccess = async (authResult, email, isGuest = false) => {
    try {
      // Clear previous user's story
      setStory('');
      setCurrentScreen('stories');
      
      if (isGuest) {
        setIsGuestMode(true);
        setIsAuthenticated(true);
        setUserEmail('Guest User');
        setAccessToken('guest-token');
        setSubscriptionStatus({ isSubscribed: false, subscriptionType: 'guest' });
        return;
      }
      
      const token = authResult.AccessToken;
      await SecureStore.setItemAsync('accessToken', token);
      await SecureStore.setItemAsync('userEmail', email);
      
      // Set user data first
      setUserEmail(email);
      setAccessToken(token);
      setIsGuestMode(false);
      setIsAuthenticated(true);
      
      // Then immediately check subscription status
      const status = await SubscriptionService.checkSubscriptionStatus(email);
      setSubscriptionStatus(status);
      
      loadLastStory();
      loadUserWords();
    } catch (error) {
      // Silent fail for auth success
    }
  };

  const signOut = async () => {
    try {
      if (!isGuestMode) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('userEmail');
      }
      setIsAuthenticated(false);
      setUserEmail('');
      setAccessToken('');
      setIsGuestMode(false);
      setStory('');
    } catch (error) {
      // Silent fail for auth check
    }
  };

  const generateStory = async () => {
    // Call the unified story creation function
    await createStory(character1, character2, keyword1, keyword2, keyword3);
  };

  const generateStoryInternal = async () => {
    // Rate limiting check
    if (!rateLimiter.canMakeRequest(userEmail, 5, 60000)) {
      Alert.alert('Error', 'Too many requests. Please wait a minute before generating another story.');
      return;
    }

    setIsGenerating(true);
    try {
      const storyData = {
        genre,
        character1: character1.trim(),
        character2: character2.trim(),
        keyword1: keyword1.trim(),
        keyword2: keyword2.trim(),
        keyword3: keyword3.trim(),
        userProfile: {
          email: userEmail,
          accessToken: accessToken
        },
        userEmail: userEmail,
        // Use toddler age rating for guest users
        ageRating: isGuestMode ? 'toddlers' : getCurrentAgeRating(),
        spellingWords: isGuestMode ? [] : (userWords.length > 0 ? userWords : [])
      };
      
      const response = await generateStoryAPI(storyData);
      const storyText = response.story || response.body || JSON.parse(response.body || '{}').story;
      
      if (storyText) {
        setStory(storyText);
        setCurrentScreen('story-display');
        // Only save shorter stories to avoid SecureStore size limits
        if (storyText.length < 1800) {
          await SecureStore.setItemAsync('lastStory', storyText);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate story. Please try again.');
    }
    setIsGenerating(false);
  };

  const handleWatchAd = () => {
    setShowSubscriptionModal(false);
    setShowAdModal(true);
  };

  const handleAdComplete = () => {
    setShowAdModal(false);
    generateStoryWithData(character1, character2, keyword1, keyword2, keyword3);
  };

  const handleUpgradeSubscribe = async () => {
    setShowUpgradeModal(false);
    await checkSubscriptionStatus();
    if (subscriptionStatus?.isSubscribed) {
      generateStoryInternal();
    }
  };

  const handleSubscribe = async () => {
    setShowSubscriptionModal(false);
    await checkSubscriptionStatus();
    if (subscriptionStatus?.isSubscribed) {
      generateStoryWithData(character1, character2, keyword1, keyword2, keyword3);
    }
  };

  const handleVisualStoryGenerate = (character1, character2, keyword1) => {
    // Map keyword to appropriate genre for better loading message
    const keywordToGenre = {
      'Forest': 'adventure',
      'Castle': 'fairy-tale', 
      'Ocean': 'adventure',
      'Space': 'space',
      'Treasure': 'adventure',
      'Magic': 'magic'
    };
    
    // Set genre based on keyword for better loading message
    const mappedGenre = keywordToGenre[keyword1] || 'adventure';
    setGenre(mappedGenre);
    
    // Call the unified story creation function directly
    createStory(character1, character2, keyword1);
  };

  const createStory = async (character1, character2, keyword1, keyword2 = '', keyword3 = '') => {
    // Input validation
    if (!character1.trim() || !character2.trim()) {
      Alert.alert('Error', 'Please enter both character names');
      return;
    }

    // Validate inputs
    if (!validateInput(character1, 50)) {
      Alert.alert('Error', `Invalid character 1: "${character1}"`);
      return;
    }

    if (!validateInput(character2, 50)) {
      Alert.alert('Error', `Invalid character 2: "${character2}"`);
      return;
    }

    // Check subscription status (including guest users who should see ads)
    if (!subscriptionStatus || !subscriptionStatus.isSubscribed) {
      // Store the story data for after ad/subscription
      setCharacter1(character1);
      setCharacter2(character2);
      setKeyword1(keyword1);
      setKeyword2(keyword2);
      setKeyword3(keyword3);
      setShowSubscriptionModal(true);
      return;
    }

    // Generate story directly for premium users
    await generateStoryWithData(character1, character2, keyword1, keyword2, keyword3);
  };

  const generateStoryWithData = async (char1, char2, key1, key2, key3) => {
    // Rate limiting check
    if (!rateLimiter.canMakeRequest(userEmail, 5, 60000)) {
      Alert.alert('Error', 'Too many requests. Please wait a minute before generating another story.');
      return;
    }

    // Load user words before generating story
    const currentUserWords = await loadUserWords();

    setIsGenerating(true);
    setGenerationError(null);
    setRetryData({ char1, char2, key1, key2, key3 });
    
    const storyMetadata = {
      timestamp: Date.now(),
      character1: char1.trim(),
      character2: char2.trim(),
      keyword1: key1.trim(),
      keyword2: key2?.trim() || '',
      keyword3: key3?.trim() || '',
      genre: genre,
      ageRating: isGuestMode ? 'toddlers' : getCurrentAgeRating()
    };
    
    try {
      const storyData = {
        genre,
        character1: char1.trim(),
        character2: char2.trim(),
        keyword1: key1.trim(),
        keyword2: key2.trim(),
        keyword3: key3.trim(),
        userProfile: {
          email: userEmail,
          accessToken: accessToken
        },
        userEmail: userEmail,
        ageRating: isGuestMode ? 'toddlers' : getCurrentAgeRating(),
        spellingWords: (() => {
          if (isGuestMode) {
            console.log('Story generation: Guest mode - no spelling words');
            return [];
          }
          console.log('Story generation: currentUserWords =', currentUserWords);
          const words = currentUserWords.length > 0 ? currentUserWords : [];
          console.log('Story generation: using words =', words);
          return words;
        })()
      };
      
      const response = await generateStoryAPI(storyData);
      const storyText = response.story || response.body || JSON.parse(response.body || '{}').story;
      
      // Check if the response contains a guardrail block message
      const isGuardrailResponse = storyText?.includes('inappropriate content') || 
                                 storyText?.includes('blocked by content filters') ||
                                 storyText?.includes('try again with different words');
      
      if (storyText && !isGuardrailResponse) {
        // Save successful story with metadata
        await saveStoryAutomatically({
          ...storyMetadata,
          content: storyText,
          status: 'success'
        });
        
        setStory(storyText);
        setCurrentScreen('story-display');
        setRetryData(null);
      } else if (isGuardrailResponse) {
        // Save guardrail block as failed story
        await saveStoryAutomatically({
          ...storyMetadata,
          content: 'Story generation was blocked by content filters. Please try different characters or keywords.',
          status: 'failed',
          error: 'Guardrail content filter block',
          failureType: 'guardrail_block'
        });
        
        setGenerationError('Story generation was blocked by content filters. Please try different characters or keywords.');
      } else {
        throw new Error('No story content received');
      }
    } catch (error) {
      console.error('Story generation error:', error);
      
      // Save failed attempt with metadata
      const isGuardrailBlock = error.message?.includes('inappropriate') || 
                              error.message?.includes('blocked') || 
                              error.message?.includes('guardrail') ||
                              error.message?.includes('content filter') ||
                              storyText?.includes('inappropriate content') ||
                              storyText?.includes('blocked by content filters');
      
      const failureMessage = isGuardrailBlock
        ? 'Story generation was blocked by content filters. Please try different characters or keywords.'
        : 'Story generation failed due to a technical error.';
      
      await saveStoryAutomatically({
        ...storyMetadata,
        content: failureMessage,
        status: 'failed',
        error: error.message,
        failureType: isGuardrailBlock ? 'guardrail_block' : 'technical_error'
      });
      
      setGenerationError(failureMessage);
    }
    setIsGenerating(false);
  };

  const saveStoryAutomatically = async (storyData) => {
    try {
      const existingStories = await SecureStore.getItemAsync('savedStories');
      const stories = existingStories ? JSON.parse(existingStories) : [];
      
      stories.unshift(storyData); // Add to beginning of array
      
      // Keep only last 50 stories to prevent storage issues
      if (stories.length > 50) {
        stories.splice(50);
      }
      
      await SecureStore.setItemAsync('savedStories', JSON.stringify(stories));
    } catch (error) {
      console.error('Error saving story:', error);
    }
  };

  const retryStoryGeneration = () => {
    if (retryData) {
      generateStoryWithData(retryData.char1, retryData.char2, retryData.key1, retryData.key2, retryData.key3);
    }
  };

  const clearError = () => {
    setGenerationError(null);
    setRetryData(null);
  };

  const handleAgeRatingChange = (newRating) => {
    if (currentProfile) {
      // Update the current profile's age rating
      const updatedProfile = { ...currentProfile, ageRating: newRating };
      const updatedProfiles = profiles.map(p => 
        p.id === currentProfile.id ? updatedProfile : p
      );
      saveProfiles(updatedProfiles);
      saveCurrentProfile(updatedProfile);
    } else {
      // Update global age rating
      setCurrentAgeRating(newRating);
    }
  };

  const handleMenuWords = () => {
    setCurrentScreen('words');
  };
  
  const handleMenuAge = () => {
    requestPassword(() => setCurrentScreen('age-rating'));
  };
  
  const handleMenuSavedStories = () => {
    setCurrentScreen('saved-stories');
  };
  const handleMenuSupport = () => setCurrentScreen('support');
  const handleMenuFAQ = () => setCurrentScreen('faq');
  const handleMenuDarkMode = () => setDarkMode(!darkMode);
  const loadProfiles = async () => {
    try {
      const savedProfiles = await SecureStore.getItemAsync('childProfiles');
      const savedCurrentProfile = await SecureStore.getItemAsync('currentProfile');
      
      if (savedProfiles) {
        const profilesData = JSON.parse(savedProfiles);
        setProfiles(profilesData);
        
        if (savedCurrentProfile) {
          const currentProfileData = JSON.parse(savedCurrentProfile);
          const foundProfile = profilesData.find(p => p.id === currentProfileData.id);
          if (foundProfile) {
            setCurrentProfile(foundProfile);
          }
        }
      }
    } catch (error) {
      console.log('Error loading profiles:', error);
    }
  };

  const saveProfiles = async (newProfiles) => {
    try {
      await SecureStore.setItemAsync('childProfiles', JSON.stringify(newProfiles));
      setProfiles(newProfiles);
    } catch (error) {
      console.log('Error saving profiles:', error);
    }
  };

  const saveCurrentProfile = async (profile) => {
    try {
      if (profile) {
        await SecureStore.setItemAsync('currentProfile', JSON.stringify(profile));
      } else {
        await SecureStore.deleteItemAsync('currentProfile');
      }
      setCurrentProfile(profile);
    } catch (error) {
      console.log('Error saving current profile:', error);
    }
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');

  const requestPassword = (action) => {
    setShowPasswordModal(true);
    setPassword('');
    // Store the action to execute after password verification
    window.pendingAction = action;
  };

  const verifyPassword = async () => {
    try {
      // Use Cognito to verify the current user's password
      const response = await fetch(`https://cognito-idp.eu-west-2.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
        },
        body: JSON.stringify({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: userEmail,
            PASSWORD: password
          }
        })
      });

      if (response.ok) {
        setShowPasswordModal(false);
        if (window.pendingAction) {
          window.pendingAction();
          window.pendingAction = null;
        }
        setPassword('');
      } else {
        Alert.alert('Error', 'Incorrect password');
        setPassword('');
      }
    } catch (error) {
      Alert.alert('Error', 'Password verification failed');
      setPassword('');
    }
  };

  const handleMenuProfiles = () => {
    requestPassword(() => setCurrentScreen('profiles'));
  };

  const handleMenuSignOut = async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('userEmail');
      await SecureStore.deleteItemAsync('childProfiles');
      await SecureStore.deleteItemAsync('currentProfile');
    } catch (error) {
      console.log('Error clearing stored credentials:', error);
    }
    setIsAuthenticated(false);
    setUserEmail('');
    setAccessToken('');
    setIsGuestMode(false);
    setProfiles([]);
    setCurrentProfile(null);
    setStory(''); // Clear current story
    setCurrentScreen('stories'); // Return to home
  };

  const shouldShowReset = () => {
    return character1.trim() || character2.trim() || keyword1.trim() || genre !== 'random';
  };

  const handleGoHome = () => {
    setStory('');
    setGenre('random');
    setCurrentScreen('stories');
  };

  const resetStory = () => {
    setStory('');
    setCharacter1('');
    setCharacter2('');
    setKeyword1('');
    setKeyword2('');
    setKeyword3('');
    setGenre('random');
    SecureStore.deleteItemAsync('lastStory').catch(() => {});
  };

  const loadLastStory = async () => {
    try {
      const lastStory = await SecureStore.getItemAsync('lastStory');
      if (lastStory) setStory(lastStory);
    } catch (error) {
      // No saved story found
    }
  };

  // Show splash screen while loading
  if (isLoading || !fontsLoaded) {
    return (
      <ErrorBoundary>
        <CustomSplashScreen />
      </ErrorBoundary>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <AuthScreen onAuthSuccess={handleAuthSuccess} darkMode={darkMode} />
      </ErrorBoundary>
    );
  }

  const styles = getStyles(darkMode);

  // Show loading screen during story generation
  if (isGenerating) {
    const getLoadingMessage = (genre) => {
      const messages = {
        adventure: '🗺️ Crafting your thrilling adventure...',
        romance: '💕 Weaving your romantic tale...',
        mystery: '🔍 Solving your mysterious story...',
        fantasy: '🧙‍♂️ Conjuring your fantasy world...',
        'fairy-tale': '🏰 Creating your fairy tale...',
        friendship: '👫 Building your friendship story...',
        magic: '✨ Casting your magical story...',
        animals: '🐾 Bringing your animal friends to life...',
        space: '🚀 Launching your space adventure...',
        funny: '😄 Cooking up your hilarious tale...',
        'school-life': '🎒 Writing your school story...',
        superhero: '🦸‍♂️ Assembling your superhero saga...',
        'time-travel': '⏰ Traveling through your story...',
        'coming-of-age': '🌱 Growing your coming-of-age story...',
        identity: '🪞 Discovering your identity tale...',
        independence: '🗽 Crafting your independence journey...',
        relationships: '💫 Building your relationship story...',
        random: '🎲 Spinning up a surprise story...'
      };
      return messages[genre] || '✨ Creating your magical story...';
    };
    
    return <LoadingScreen message={getLoadingMessage(genre)} />;
  }

  // Show error screen if generation failed
  if (generationError) {
    return (
      <ErrorScreen 
        message={generationError}
        onRetry={retryStoryGeneration}
        onBack={clearError}
      />
    );
  }

  if (currentScreen === 'story-display') {
    return (
      <ErrorBoundary>
        <StoryDisplayScreen 
          story={story}
          onClose={() => setCurrentScreen('stories')}
          darkMode={darkMode}
          fontSize={fontSize}
        />
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'visual') {
    return (
      <>
        <ErrorBoundary>
          <VisualStoryCreator 
            onCreateStory={handleVisualStoryGenerate}
            onBack={() => setCurrentScreen('stories')}
            darkMode={darkMode}
          />
        </ErrorBoundary>
        
        <UpgradeModal 
          visible={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onSubscribe={handleUpgradeSubscribe}
          darkMode={darkMode}
        />
        
        <SubscriptionModal 
          visible={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={handleSubscribe}
          onWatchAd={handleWatchAd}
          darkMode={darkMode}
        />
        
        <AdModal 
          visible={showAdModal}
          onAdComplete={handleAdComplete}
          onClose={() => setShowAdModal(false)}
          darkMode={darkMode}
        />
      </>
    );
  }

  if (currentScreen === 'words') {
    return (
      <ErrorBoundary>
        <ImageBackground 
          source={darkMode ? require('./assets/splash_logo.png') : require('./assets/splash-light.png')} 
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.navBtn}
            onPress={handleGoHome}
          >
            <Text style={styles.btnText}>🏠 Home</Text>
          </TouchableOpacity>
          {!subscriptionStatus?.isSubscribed && (
            <TouchableOpacity 
              style={[styles.statusFlag, isGuestMode ? styles.guestFlag : styles.freeFlag]}
              onPress={() => setShowUpgradeModal(true)}
            >
              <Text style={styles.statusText}>
                {isGuestMode ? 'Guest - Upgrade for more?' : 'Free - Upgrade for more?'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.darkModeBtn}
            onPress={() => setDarkMode(!darkMode)}
          >
            <Text style={styles.btnText}>{darkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
        <ManageWordsScreen 
          userEmail={userEmail} 
          accessToken={accessToken} 
          darkMode={darkMode}
          currentProfile={currentProfile}
        />
      </View>
        </ImageBackground>
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'age-rating') {
    return (
      <ErrorBoundary>
        <ImageBackground 
          source={darkMode ? require('./assets/splash_logo.png') : require('./assets/splash-light.png')} 
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.navBtn}
              onPress={handleGoHome}
            >
              <Text style={styles.btnText}>🏠 Home</Text>
            </TouchableOpacity>
          </View>
          <AgeRatingScreen 
            darkMode={darkMode} 
            userEmail={userEmail}
            accessToken={accessToken}
            onAgeRatingChange={handleAgeRatingChange}
            currentProfile={currentProfile}
          />
        </View>
        </ImageBackground>
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'saved-stories') {
    return (
      <ErrorBoundary>
        <ImageBackground 
          source={darkMode ? require('./assets/splash_logo.png') : require('./assets/splash-light.png')} 
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.navBtn}
              onPress={handleGoHome}
            >
              <Text style={styles.btnText}>🏠 Home</Text>
            </TouchableOpacity>
          </View>
          <SavedStoriesScreen 
            darkMode={darkMode} 
            userEmail={userEmail} 
            currentProfile={currentProfile}
            onReloadStory={(storyContent) => {
              setStory(storyContent);
              setCurrentScreen('story-display');
            }}
          />
        </View>
        </ImageBackground>
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'support') {
    return (
      <ErrorBoundary>
        <ImageBackground 
          source={darkMode ? require('./assets/splash_logo.png') : require('./assets/splash-light.png')} 
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.navBtn}
              onPress={handleGoHome}
            >
              <Text style={styles.btnText}>🏠 Home</Text>
            </TouchableOpacity>
          </View>
          <SupportScreen darkMode={darkMode} userEmail={userEmail} />
        </View>
        </ImageBackground>
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'faq') {
    return (
      <ErrorBoundary>
        <ImageBackground 
          source={darkMode ? require('./assets/splash_logo.png') : require('./assets/splash-light.png')} 
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.navBtn}
              onPress={handleGoHome}
            >
              <Text style={styles.btnText}>🏠 Home</Text>
            </TouchableOpacity>
          </View>
          <FAQScreen darkMode={darkMode} />
        </View>
        </ImageBackground>
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'profiles') {
    return (
      <ErrorBoundary>
        <ImageBackground 
          source={darkMode ? require('./assets/splash_logo.png') : require('./assets/splash-light.png')} 
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <ProfileScreen 
            darkMode={darkMode}
            profiles={profiles}
            onProfilesChange={saveProfiles}
            onBack={() => setCurrentScreen('stories')}
            userEmail={userEmail}
          />
        </ImageBackground>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ImageBackground 
        source={darkMode ? require('./assets/splash_logo.png') : require('./assets/splash-light.png')} 
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerButtons}>
          {subscriptionStatus?.isSubscribed ? (
            <View style={[styles.statusFlag, styles.premiumFlag]}>
              <Text style={styles.statusText}>⭐ Premium</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.statusFlag, isGuestMode ? styles.guestFlag : styles.freeFlag]}
              onPress={() => setShowUpgradeModal(true)}
            >
              <Text style={styles.statusText}>
                {isGuestMode ? 'Guest - Upgrade for more?' : 'Free - Upgrade for more?'}
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.rightButtons}>
            <MenuDropdown
              darkMode={darkMode}
              currentProfile={currentProfile}
              profiles={profiles}
              onProfileChange={saveCurrentProfile}
              onProfilesPress={handleMenuProfiles}
              onWordsPress={handleMenuWords}
              onAgePress={handleMenuAge}
              onSavedStoriesPress={handleMenuSavedStories}
              onSupportPress={handleMenuSupport}
              onFAQPress={handleMenuFAQ}
              onDarkModeToggle={handleMenuDarkMode}
              onSignOut={handleMenuSignOut}
              onUpgrade={() => setShowUpgradeModal(true)}
              isSubscribed={subscriptionStatus?.isSubscribed}
              isGuest={isGuestMode}
            />
          </View>
        </View>
      </View>

      <Text style={styles.title}>SpellTales</Text>
      <Text style={styles.welcomeText}>Welcome, {userEmail}!</Text>
      
      
      <View style={styles.formSection}>
        <Text style={styles.label}>Genre:</Text>
        <TouchableOpacity 
          style={styles.dropdown}
          onPress={() => setShowGenreDropdown(true)}
        >
          <Text style={styles.dropdownText}>
            {genres.find(g => g.value === genre)?.label || 'Select Genre'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        <Modal
          visible={showGenreDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowGenreDropdown(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            onPress={() => setShowGenreDropdown(false)}
          >
            <View style={styles.dropdownModal}>
              <ScrollView>
                {genres.map(g => (
                  <TouchableOpacity
                    key={g.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setGenre(g.value);
                      setShowGenreDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{g.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        <TextInput
          style={styles.input}
          value={character1}
          onChangeText={setCharacter1}
          placeholder="First character (e.g., princess)"
          placeholderTextColor={darkMode ? '#888' : '#666'}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          value={character2}
          onChangeText={setCharacter2}
          placeholder="Second character (e.g., dragon)"
          placeholderTextColor={darkMode ? '#888' : '#666'}
          autoCapitalize="words"
        />

        <View style={styles.keywordSection}>
          <Text style={styles.sectionTitle}>Optional Story Elements</Text>
          
          <TextInput
            style={styles.input}
            value={keyword1}
            onChangeText={setKeyword1}
            placeholder="Keyword 1 (e.g., castle)"
            placeholderTextColor={darkMode ? '#888' : '#666'}
            autoCapitalize="words"
          />
          
          <TextInput
            style={styles.input}
            value={keyword2}
            onChangeText={setKeyword2}
            placeholder="Keyword 2 (e.g., treasure)"
            placeholderTextColor={darkMode ? '#888' : '#666'}
            autoCapitalize="words"
          />
          
          <TextInput
            style={styles.input}
            value={keyword3}
            onChangeText={setKeyword3}
            placeholder="Keyword 3 (e.g., rainbow)"
            placeholderTextColor={darkMode ? '#888' : '#666'}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.generateBtn, isGenerating && styles.btnDisabled]}
            onPress={generateStory}
            disabled={isGenerating}
          >
            <Text style={styles.generateBtnText}>
              {isGenerating ? '⏳ Making Your Story...' : '✨ Make My Story!'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.visualBtn}
            onPress={() => setCurrentScreen('visual')}
          >
            <Text style={styles.visualBtnText}>🎨 Help Me Create!</Text>
          </TouchableOpacity>

          {shouldShowReset() && (
            <TouchableOpacity 
              style={styles.resetBtn}
              onPress={resetStory}
            >
              <Text style={styles.resetBtnText}>🔄 Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <AdModal 
        visible={showAdModal}
        onAdComplete={handleAdComplete}
        onClose={() => setShowAdModal(false)}
        darkMode={darkMode}
      />
      
      <UpgradeModal 
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSubscribe={handleUpgradeSubscribe}
        darkMode={darkMode}
      />
      
      <SubscriptionModal 
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
        onWatchAd={handleWatchAd}
        darkMode={darkMode}
      />

      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModal}>
            <Text style={styles.passwordTitle}>Enter Your Login Password</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor={darkMode ? '#999' : '#666'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoFocus={true}
            />
            <View style={styles.passwordButtons}>
              <TouchableOpacity 
                style={[styles.passwordBtn, styles.cancelBtn]}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.passwordBtn, styles.confirmBtn]}
                onPress={verifyPassword}
              >
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
        </ScrollView>
      </ImageBackground>
    </ErrorBoundary>
  );
}

const getMarkdownStyles = (darkMode, fontSize = 16) => ({
  body: {
    color: darkMode ? '#fff' : '#333',
    fontSize: fontSize,
    lineHeight: fontSize * 1.5,
  },
  heading1: {
    color: darkMode ? '#fff' : '#333',
    fontSize: fontSize + 8,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  heading2: {
    color: darkMode ? '#fff' : '#333',
    fontSize: fontSize + 4,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    color: darkMode ? '#fff' : '#333',
    fontSize: fontSize,
    lineHeight: fontSize * 1.5,
    marginBottom: 12,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
});

const getStyles = (darkMode) => StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: darkMode ? 0.2 : 0.5,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navBtn: {
    backgroundColor: darkMode ? '#444' : '#e0e0e0',
    padding: 8,
    borderRadius: 5,
    marginLeft: 8,
  },
  darkModeBtn: {
    backgroundColor: darkMode ? '#333' : '#f0f0f0',
    padding: 8,
    borderRadius: 5,
    marginLeft: 8,
  },
  premiumBtn: {
    backgroundColor: '#FFD700',
    padding: 8,
    borderRadius: 5,
  },
  premiumText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
  signOutBtn: {
    backgroundColor: '#ff6666',
    padding: 8,
    borderRadius: 5,
    marginLeft: 8,
  },
  loginBtn: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    marginLeft: 8,
  },
  statusFlag: {
    padding: 8,
    borderRadius: 5,
  },
  premiumFlag: {
    backgroundColor: '#FFD700',
  },
  freeFlag: {
    backgroundColor: '#90EE90',
  },
  guestFlag: {
    backgroundColor: '#DDA0DD',
  },
  statusText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnText: {
    color: darkMode ? '#fff' : '#000',
    fontSize: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Chewy_400Regular',
    color: darkMode ? '#fff' : '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: darkMode ? '#ccc' : '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  userTypeInfo: {
    backgroundColor: darkMode ? '#222' : '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: darkMode ? '#444' : '#e0e0e0',
  },
  userTypeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#333',
    marginBottom: 5,
  },
  userTypeDesc: {
    fontSize: 13,
    color: darkMode ? '#ccc' : '#666',
    lineHeight: 18,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    color: darkMode ? '#fff' : '#000',
    fontSize: 16,
    marginBottom: 5,
  },
  pickerContainer: {
    backgroundColor: darkMode ? '#333' : '#fff',
    borderWidth: 1,
    borderColor: darkMode ? '#555' : '#ddd',
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    color: darkMode ? '#fff' : '#000',
  },
  dropdown: {
    backgroundColor: darkMode ? '#333' : '#fff',
    borderWidth: 1,
    borderColor: darkMode ? '#555' : '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: darkMode ? '#fff' : '#000',
    fontSize: 16,
  },
  dropdownArrow: {
    color: darkMode ? '#fff' : '#000',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: darkMode ? '#333' : '#fff',
    borderRadius: 10,
    margin: 20,
    maxHeight: 300,
    minWidth: 250,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#555' : '#eee',
  },
  dropdownItemText: {
    color: darkMode ? '#fff' : '#000',
    fontSize: 16,
  },
  input: {
    backgroundColor: darkMode ? '#333' : '#fff',
    color: darkMode ? '#fff' : '#000',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: darkMode ? '#555' : '#ddd',
    fontSize: 16,
    marginBottom: 15,
  },
  keywordSection: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#000',
    marginBottom: 15,
  },
  generateBtn: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
    width: '100%',
  },
  visualBtn: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
    width: '100%',
  },
  visualBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetBtn: {
    backgroundColor: '#ff6666',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff6666',
    width: '100%',
  },
  resetBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  btnDisabled: {
    backgroundColor: '#666',
    borderColor: '#666',
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  storySection: {
    marginTop: 20,
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    backgroundColor: darkMode ? '#333' : '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    gap: 10,
  },
  fontBtn: {
    backgroundColor: darkMode ? '#555' : '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  fontBtnText: {
    color: darkMode ? '#fff' : '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fontSizeText: {
    color: darkMode ? '#fff' : '#333',
    fontSize: 14,
  },
  storyContainer: {
    backgroundColor: darkMode ? '#333' : '#f8f9fa',
    padding: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: darkMode ? '#555' : '#ddd',
  },
  storyText: {
    color: darkMode ? '#fff' : '#000',
    fontSize: 16,
    lineHeight: 24,
  },
  passwordModal: {
    backgroundColor: darkMode ? '#333' : '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    minWidth: 300,
  },
  passwordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#000',
    textAlign: 'center',
    marginBottom: 15,
  },
  passwordInput: {
    backgroundColor: darkMode ? '#444' : '#f5f5f5',
    color: darkMode ? '#fff' : '#000',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: darkMode ? '#555' : '#ddd',
    marginBottom: 15,
    fontSize: 16,
  },
  passwordButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  passwordBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: darkMode ? '#555' : '#ddd',
  },
  confirmBtn: {
    backgroundColor: '#4CAF50',
  },
  cancelBtnText: {
    color: darkMode ? '#fff' : '#000',
    fontWeight: 'bold',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
