import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Modal, AppState, ImageBackground } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Network from 'expo-network';
import { useFonts, Chewy_400Regular } from '@expo-google-fonts/chewy';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito';
import Markdown from 'react-native-markdown-display';
import { clearBiometricCredentials } from './utils/biometricAuth';
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
import { generateStoryAPI, LAMBDA_URL } from './config';
import { rateLimiter } from './utils/rateLimiter';
import { validateInput } from './utils/security';
import { SubscriptionService } from './services/SubscriptionService';
import { AdService } from './services/AdService';
import { createGlobalStyles } from './styles/GlobalStyles';

export default function App() {
  let [fontsLoaded] = useFonts({
    Chewy_400Regular,
    Nunito_600SemiBold,
  });

  const [darkMode, setDarkMode] = useState(true);
  const globalStyles = useMemo(() => createGlobalStyles(darkMode), [darkMode]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [currentScreen, setCurrentScreen] = useState('stories'); // 'stories', 'words', 'age-rating', 'saved-stories', 'support', 'faq', 'visual', 'story-display', 'profiles'
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profilesLoaded, setProfilesLoaded] = useState(false);
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
  const [initialAuthMode, setInitialAuthMode] = useState('welcome');
  const [isOffline, setIsOffline] = useState(false);

  // Helper to create user-specific SecureStore keys
  const getUserKey = (key) => {
    if (!userEmail || isGuestMode) return key; // Guest uses global keys
    // Sanitize email: replace @ and other invalid chars with underscore
    const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${sanitizedEmail}_${key}`;
  };

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
        { label: 'Nature', value: 'nature' },
        { label: 'Colours', value: 'colours' },
        { label: 'Shapes', value: 'shapes' },
        { label: 'Music', value: 'music' },
        { label: 'Counting', value: 'counting' },
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
        { label: 'Pirates', value: 'pirates' },
        { label: 'Dragons', value: 'dragons' },
        { label: 'Underwater', value: 'underwater' },
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
        { label: 'Sports', value: 'sports' },
        { label: 'School', value: 'school' },
        { label: 'Survival', value: 'survival' },
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
        { label: 'Dystopian', value: 'dystopian' },
        { label: 'Thriller', value: 'thriller' },
      ]);
    }
  };

  const [userWords, setUserWords] = useState([]);

  // Get current age rating (from profile or global)
  const loadUserWords = async () => {
    if (!userEmail || isGuestMode || !currentProfile?.id) {
      return [];
    }
    
    
    try {
      if (!LAMBDA_URL) {
        setUserWords([]);
        return [];
      }

      const response = await fetch(LAMBDA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_words',
          userEmail: userEmail,
          profileId: currentProfile.id
        })
      });

      if (!response.ok) {
        setUserWords([]);
        return [];
      }

      const result = await response.json();
      
      if (result.success && result.words) {
        setUserWords(result.words);
        return result.words;
      } else {
        setUserWords([]);
        return [];
      }
    } catch (error) {
      setUserWords([]);
      return [];
    }
  };

  const getCurrentAgeRating = () => {
    if (isGuestMode) return 'toddlers'; // Guest users fixed at toddler level
    return currentProfile ? currentProfile.ageRating : currentAgeRating;
  };

  const genres = getGenresForAge(getCurrentAgeRating());

  useEffect(() => {
    // Debug: Check if profiles exist at app start
    SecureStore.getItemAsync(getUserKey('childProfiles')).then(profiles => {
    });
    
    checkAuthState();
    loadAgeRating();
    loadProfiles();
    
    // Initialize ad service
    AdService.initialize().catch(error => {
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

  // Monitor network status
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setIsOffline(!networkState.isConnected);
      } catch (error) {
        setIsOffline(false); // Assume online if check fails
      }
    };
    
    checkNetwork();
    const interval = setInterval(checkNetwork, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Reload profiles when subscription status or guest mode changes
  useEffect(() => {
    // Load from DynamoDB only once per session (on app start)
    if (subscriptionStatus !== null && (userEmail || isGuestMode) && !profilesLoaded) {
      loadProfiles();
    }
  }, [subscriptionStatus, isGuestMode, userEmail]);

  const loadAgeRating = async () => {
    try {
      const rating = await SecureStore.getItemAsync('ageRating');
      if (rating) {
        setCurrentAgeRating(rating);
      }
    } catch (error) {
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
      // Clear previous user's data for privacy
      setStory('');
      setProfiles([]);
      setCurrentProfile(null);
      setCurrentScreen('stories');
      
      // Show upgrade modal for new signups
      const isNewSignup = initialAuthMode === 'signup';
      setInitialAuthMode('welcome');
      
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
      
      // Load user's profiles from DynamoDB after authentication
      loadProfiles();
      
      // Show upgrade modal for new signups
      if (isNewSignup) {
        setTimeout(() => setShowUpgradeModal(true), 500);
      }
    } catch (error) {
      // Silent fail for auth success
    }
  };

  const signOut = async () => {
    try {
      if (!isGuestMode) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('userEmail');
        await clearBiometricCredentials();
        // Don't delete profiles - they persist for when user logs back in
        // await SecureStore.deleteItemAsync(getUserKey('childProfiles'));
        // await SecureStore.deleteItemAsync(getUserKey('currentProfile'));
      }
      setIsAuthenticated(false);
      setUserEmail('');
      setAccessToken('');
      setIsGuestMode(false);
      setProfiles([]); // Clear from state but not from storage
      setCurrentProfile(null);
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

  const handleVisualStoryGenerate = (genre, character1, character2, keyword1, keyword2 = '', keyword3 = '') => {
    // Set the genre
    setGenre(genre);
    
    // Call the unified story creation function directly
    createStory(character1, character2, keyword1, keyword2, keyword3);
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

    setIsGenerating(true);
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
    );
    
    // Load user words before generating story
    const currentUserWords = await loadUserWords();
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
      ageRating: isGuestMode ? 'toddlers' : getCurrentAgeRating(),
      profileId: currentProfile?.id || null,
      profileName: currentProfile?.name || 'Global'
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
        profileId: currentProfile?.id || null,
        profileName: currentProfile?.name || 'Global',
        spellingWords: (() => {
          if (isGuestMode) {
            return [];
          }
          const words = currentUserWords.length > 0 ? currentUserWords : [];
          return words;
        })()
      };
      
      console.log('Calling generateStoryAPI with data:', JSON.stringify(storyData).substring(0, 200));
      
      // Race between API call and timeout
      const response = await Promise.race([
        generateStoryAPI(storyData),
        timeoutPromise
      ]);
      
      console.log('Response received:', typeof response, Object.keys(response || {}));
      const storyText = response.story || response.body || JSON.parse(response.body || '{}').story;
      console.log('Story text extracted, length:', storyText?.length);
      
      // Check if the response contains a guardrail block message
      const isGuardrailResponse = storyText?.includes('inappropriate content') || 
                                 storyText?.includes('blocked by content filters') ||
                                 storyText?.includes('try again with different words');
      
      if (storyText && !isGuardrailResponse) {
        console.log('Story valid, saving and displaying');
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
      
      // Check if it's a timeout error
      const isTimeout = error.message === 'Request timeout';
      
      // Save failed attempt with metadata
      const isGuardrailBlock = error.message?.includes('inappropriate') || 
                              error.message?.includes('blocked') || 
                              error.message?.includes('guardrail') ||
                              error.message?.includes('content filter') ||
                              storyText?.includes('inappropriate content') ||
                              storyText?.includes('blocked by content filters');
      
      const failureMessage = isTimeout
        ? 'Story generation timed out. Please check your internet connection and try again.'
        : isGuardrailBlock
        ? 'Story generation was blocked by content filters. Please try different characters or keywords.'
        : 'Story generation failed due to a technical error.';
      
      await saveStoryAutomatically({
        ...storyMetadata,
        content: failureMessage,
        status: 'failed',
        error: error.message,
        failureType: isTimeout ? 'timeout' : isGuardrailBlock ? 'guardrail_block' : 'technical_error'
      });
      
      setGenerationError(failureMessage);
    }
    setIsGenerating(false);
  };

  const saveStoryAutomatically = async (storyData) => {
    try {
      // Add profile information to story
      const storyWithProfile = {
        ...storyData,
        profileId: currentProfile?.id || null,
        profileName: currentProfile?.name || 'Global'
      };
      
      const existingStories = await SecureStore.getItemAsync('savedStories');
      const stories = existingStories ? JSON.parse(existingStories) : [];
      
      stories.unshift(storyWithProfile); // Add to beginning of array
      
      // Keep only last 50 stories to prevent storage issues
      if (stories.length > 50) {
        stories.splice(50);
      }
      
      await SecureStore.setItemAsync('savedStories', JSON.stringify(stories));
    } catch (error) {
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
    if (currentProfile) {
      // If there's an active profile, show age selection first
      Alert.alert(
        'Change Age Rating',
        `Select new age rating for ${currentProfile.name}:`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Toddlers (2-4)', onPress: () => requestPasswordForAgeChange('toddlers') },
          { text: 'Children (5-8)', onPress: () => requestPasswordForAgeChange('children') },
          { text: 'Young Teens (9-12)', onPress: () => requestPasswordForAgeChange('young_teens') },
          { text: 'Teens (13-17)', onPress: () => requestPasswordForAgeChange('teens') }
        ]
      );
    } else {
      // No active profile, go to global age rating screen
      requestPassword(() => setCurrentScreen('age-rating'));
    }
  };

  const requestPasswordForAgeChange = (newAgeRating) => {
    requestPassword(() => updateCurrentProfileAge(newAgeRating));
  };

  const updateCurrentProfileAge = (newAgeRating) => {
    const updatedProfiles = profiles.map(p => 
      p.id === currentProfile.id ? { ...p, ageRating: newAgeRating } : p
    );
    const updatedCurrentProfile = { ...currentProfile, ageRating: newAgeRating };
    
    saveProfiles(updatedProfiles);
    saveCurrentProfile(updatedCurrentProfile);
    Alert.alert('Success', 'Age rating updated successfully!');
  };
  
  const handleMenuSavedStories = () => {
    setCurrentScreen('saved-stories');
  };
  const handleMenuSupport = () => setCurrentScreen('support');
  const handleMenuFAQ = () => setCurrentScreen('faq');
  const handleMenuDarkMode = () => setDarkMode(!darkMode);
  const deleteProfileDataFromDynamoDB = async (profileId) => {
    if (!userEmail || isGuestMode) return true; // Skip for guests
    
    try {
      
      const response = await fetch(LAMBDA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_profile_data',
          userEmail: userEmail,
          profileId: profileId
        })
      });
      
      if (!response.ok) {
        return false;
      }
      
      const result = await response.json();
      
      if (!result.success) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const saveProfilesToDynamoDB = async (profiles) => {
    if (!userEmail || isGuestMode) {
      console.log('saveProfilesToDynamoDB: Skipped - no email or guest mode');
      return;
    }
    
    console.log('saveProfilesToDynamoDB: Starting save for', userEmail, 'with', profiles.length, 'profiles');
    
    try {
      if (!LAMBDA_URL) {
        console.log('saveProfilesToDynamoDB: No LAMBDA_URL');
        return;
      }

      const response = await fetch(LAMBDA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_user_profiles',
          userEmail: userEmail,
          profiles: profiles
        })
      });
      
      console.log('saveProfilesToDynamoDB: Response status', response.status);
      
      if (!response.ok) {
        console.log('saveProfilesToDynamoDB: Response not OK');
        return;
      }
      
      const result = await response.json();
      console.log('saveProfilesToDynamoDB: Result', result);
      
      if (!result.success) {
        console.log('saveProfilesToDynamoDB: Save failed', result.error);
      } else {
        console.log('saveProfilesToDynamoDB: Save successful');
      }
    } catch (error) {
      console.log('saveProfilesToDynamoDB: Error', error);
    }
  };

  const loadProfilesFromDynamoDB = async () => {
    if (!userEmail || isGuestMode) return [];
    
    try {
      const response = await fetch(LAMBDA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_user_profiles',
          userEmail: userEmail
        })
      });
      
      const result = await response.json();
      if (result.success && result.profiles) {
        return result.profiles;
      }
      return [];
    } catch (error) {
      return [];
    }
  };
  const loadProfiles = async () => {
    try {
      
      // Wait for subscription status to be loaded before making decisions
      if (subscriptionStatus === null) {
        return;
      }
      
      // Only show profiles for premium users
      if (isGuestMode || !userEmail || !subscriptionStatus.isSubscribed) {
        setProfiles([]);
        setCurrentProfile(null);
        return;
      }
      
      // Load from DynamoDB first (source of truth)
      try {
        const response = await fetch(LAMBDA_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_user_profiles',
            userEmail: userEmail
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.profiles) {
            // DynamoDB is source of truth - save to SecureStore for fast access
            await SecureStore.setItemAsync(getUserKey('childProfiles'), JSON.stringify(result.profiles));
            setProfiles(result.profiles);
            setProfilesLoaded(true);
            
            // Load current profile from SecureStore
            const savedCurrentProfile = await SecureStore.getItemAsync(getUserKey('currentProfile'));
            if (savedCurrentProfile) {
              const currentProfileData = JSON.parse(savedCurrentProfile);
              const foundProfile = result.profiles.find(p => p.id === currentProfileData.id);
              if (foundProfile) {
                setCurrentProfile(foundProfile);
              } else {
                setCurrentProfile(null);
                await SecureStore.deleteItemAsync(getUserKey('currentProfile'));
              }
            }
            return;
          }
        }
      } catch (dbError) {
        // DynamoDB failed, fall back to SecureStore
      }
      
      // Fallback: Load from SecureStore if DynamoDB fails
      const savedProfiles = await SecureStore.getItemAsync(getUserKey('childProfiles'));
      const savedCurrentProfile = await SecureStore.getItemAsync(getUserKey('currentProfile'));
      
      if (savedProfiles) {
        const profilesData = JSON.parse(savedProfiles);
        setProfiles(profilesData);
        setProfilesLoaded(true);
        
        if (savedCurrentProfile) {
          const currentProfileData = JSON.parse(savedCurrentProfile);
          const foundProfile = profilesData.find(p => p.id === currentProfileData.id);
          if (foundProfile) {
            setCurrentProfile(foundProfile);
          } else {
            setCurrentProfile(null);
            await SecureStore.deleteItemAsync(getUserKey('currentProfile'));
          }
        }
      } else {
        setCurrentProfile(null);
      }
    } catch (error) {
    }
  };

  const deleteProfile = async (profileId) => {
    try {
      // First try to delete from DynamoDB
      const dynamoSuccess = await deleteProfileDataFromDynamoDB(profileId);
      
      if (!dynamoSuccess) {
        Alert.alert(
          'Connection Error', 
          'Unable to delete profile data from server. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      // Delete from SecureStore
      const currentProfiles = profiles;
      const profileToDelete = currentProfiles.find(p => p.id === profileId);
      
      if (profileToDelete) {
        // Remove saved stories for this profile from SecureStore
        try {
          const savedStoriesKey = `savedStories_${userEmail}_${profileId}`;
          await SecureStore.deleteItemAsync(savedStoriesKey);
        } catch (error) {
        }
        
        // Remove words for this profile from SecureStore  
        try {
          const wordsKey = `userWords_${userEmail}_${profileId}`;
          await SecureStore.deleteItemAsync(wordsKey);
        } catch (error) {
        }
      }
      
      // Remove profile from profiles array
      const updatedProfiles = currentProfiles.filter(p => p.id !== profileId);
      
      // If deleting current profile, clear it
      if (currentProfile?.id === profileId) {
        setCurrentProfile(null);
        await SecureStore.deleteItemAsync(getUserKey('currentProfile'));
      }
      
      // Save updated profiles
      await saveProfiles(updatedProfiles);
      
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to delete profile. Please try again.');
      return false;
    }
  };

  const saveProfiles = async (newProfiles) => {
    console.log('saveProfiles: Called with', newProfiles.length, 'profiles');
    console.log('saveProfiles: isGuestMode=', isGuestMode, 'isSubscribed=', subscriptionStatus?.isSubscribed);
    
    try {
      setProfiles(newProfiles);
      
      // Only premium users save to SecureStore and DynamoDB
      if (isGuestMode || !subscriptionStatus?.isSubscribed) {
        console.log('saveProfiles: Skipping save - not premium');
        return;
      }
      
      console.log('saveProfiles: Saving to SecureStore');
      // Save to SecureStore for immediate access with user-specific key
      await SecureStore.setItemAsync(getUserKey('childProfiles'), JSON.stringify(newProfiles));
      
      console.log('saveProfiles: Calling saveProfilesToDynamoDB');
      // Save to DynamoDB for persistence across devices/sessions
      await saveProfilesToDynamoDB(newProfiles);
    } catch (error) {
      console.log('saveProfiles: Error', error);
    }
  };

  const saveCurrentProfile = async (profile) => {
    try {
      // Only premium users can save profiles
      if (isGuestMode || !subscriptionStatus?.isSubscribed) {
        setCurrentProfile(null);
        return;
      }
      
      if (profile) {
        await SecureStore.setItemAsync(getUserKey('currentProfile'), JSON.stringify(profile));
      } else {
        await SecureStore.deleteItemAsync(getUserKey('currentProfile'));
      }
      setCurrentProfile(profile);
    } catch (error) {
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
    setCurrentScreen('profiles');
  };

  const handleMenuSignOut = async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('userEmail');
      // Don't delete profiles - they persist for when user logs back in
      // await SecureStore.deleteItemAsync(getUserKey('childProfiles'));
      // await SecureStore.deleteItemAsync(getUserKey('currentProfile'));
    } catch (error) {
    }
    setIsAuthenticated(false);
    setUserEmail('');
    setAccessToken('');
    setIsGuestMode(false);
    setProfiles([]);
    setCurrentProfile(null);
    setProfilesLoaded(false);
    setStory('');
    setCurrentScreen('stories');
    setInitialAuthMode('welcome');
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

  const handleGuestMode = () => {
    setIsGuestMode(true);
    setIsAuthenticated(true);
    setUserEmail('');
    setAccessToken('');
    setSubscriptionStatus({ isSubscribed: false, subscriptionType: 'guest' });
    setProfiles([]);
    setCurrentProfile(null);
    setCurrentAgeRating('toddlers');
  };

  if (!isAuthenticated && !isGuestMode) {
    return (
      <ErrorBoundary>
        <AuthScreen 
          onAuthSuccess={handleAuthSuccess} 
          onGuestMode={handleGuestMode}
          darkMode={darkMode}
          initialMode={initialAuthMode}
        />
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
          isSubscribed={subscriptionStatus?.isSubscribed}
        />
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'visual') {
    return (
      <>
        <ErrorBoundary>
          <ImageBackground 
            source={darkMode ? require('./assets/splash_logo.png') : require('./assets/splash-light.png')} 
            style={globalStyles.backgroundImage}
            imageStyle={globalStyles.backgroundImageStyle}
          >
            <View style={globalStyles.screenContainer}>
              <TouchableOpacity style={[globalStyles.homeButton, {alignSelf: 'flex-start', marginBottom: 10}]} onPress={() => {
                setGenre('random');
                setCurrentScreen('stories');
              }}>
                <Text style={globalStyles.homeButtonText}>🏠 Home</Text>
              </TouchableOpacity>
              
              <Text style={globalStyles.heading}>Create Your Story</Text>
              <VisualStoryCreator 
                onCreateStory={handleVisualStoryGenerate}
                onBack={() => {
                  setGenre('random');
                  setCurrentScreen('stories');
                }}
                darkMode={darkMode}
                ageRating={getCurrentAgeRating()}
              />
            </View>
          </ImageBackground>
        </ErrorBoundary>
        
        <UpgradeModal 
          visible={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onSubscribe={handleUpgradeSubscribe}
          onSignUp={() => {
            setShowUpgradeModal(false);
            setIsAuthenticated(false);
            setIsGuestMode(false);
            setInitialAuthMode('signup');
            setCurrentScreen('auth');
          }}
          darkMode={darkMode}
          isGuestMode={isGuestMode}
        />
        
        <SubscriptionModal 
          visible={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={handleSubscribe}
          onWatchAd={handleWatchAd}
          onSignUp={() => {
            setShowSubscriptionModal(false);
            setIsAuthenticated(false);
            setIsGuestMode(false);
            setCurrentScreen('auth');
          }}
          darkMode={darkMode}
          isGuestMode={isGuestMode}
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
          style={globalStyles.backgroundImage}
          imageStyle={globalStyles.backgroundImageStyle}
        >
          <View style={globalStyles.screenContainer}>
        <View style={globalStyles.screenHeader}>
          <TouchableOpacity 
            style={styles.navBtn}
            onPress={handleGoHome}
          >
            <Text style={styles.btnText}>🏠 Home</Text>
          </TouchableOpacity>
          <Text style={globalStyles.heading}>Word Management</Text>
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
        </View>
        <ManageWordsScreen 
          userEmail={userEmail} 
          accessToken={accessToken} 
          darkMode={darkMode}
          currentProfile={currentProfile}
          isOffline={isOffline}
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
          style={globalStyles.backgroundImage}
          imageStyle={globalStyles.backgroundImageStyle}
        >
          <View style={globalStyles.screenContainer}>
          <View style={globalStyles.screenHeader}>
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
            isOffline={isOffline}
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
          style={globalStyles.backgroundImage}
          imageStyle={globalStyles.backgroundImageStyle}
        >
          <View style={globalStyles.screenContainer}>
          <View style={globalStyles.screenHeader}>
            <TouchableOpacity 
              style={styles.navBtn}
              onPress={handleGoHome}
            >
              <Text style={styles.btnText}>🏠 Home</Text>
            </TouchableOpacity>
            <Text style={globalStyles.heading}>Saved Stories</Text>
          </View>
          <SavedStoriesScreen 
            darkMode={darkMode} 
            userEmail={userEmail} 
            currentProfile={currentProfile}
            isOffline={isOffline}
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
          style={globalStyles.backgroundImage}
          imageStyle={globalStyles.backgroundImageStyle}
        >
          <View style={globalStyles.screenContainer}>
          <View style={globalStyles.screenHeader}>
            <TouchableOpacity 
              style={styles.navBtn}
              onPress={handleGoHome}
            >
              <Text style={styles.btnText}>🏠 Home</Text>
            </TouchableOpacity>
            <Text style={globalStyles.heading}>Support</Text>
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
          style={globalStyles.backgroundImage}
          imageStyle={globalStyles.backgroundImageStyle}
        >
          <View style={globalStyles.screenContainer}>
          <View style={globalStyles.screenHeader}>
            <TouchableOpacity 
              style={styles.navBtn}
              onPress={handleGoHome}
            >
              <Text style={styles.btnText}>🏠 Home</Text>
            </TouchableOpacity>
            <Text style={globalStyles.heading}>FAQ</Text>
          </View>
          <FAQScreen 
            darkMode={darkMode} 
            userEmail={userEmail}
            isGuest={isGuestMode}
            isSubscribed={subscriptionStatus?.isSubscribed}
            onAccountDeleted={() => {
              setIsAuthenticated(false);
              setIsGuestMode(false);
              setUserEmail('');
              setCurrentScreen('auth');
            }}
          />
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
          style={globalStyles.backgroundImage}
          imageStyle={globalStyles.backgroundImageStyle}
        >
          <ProfileScreen 
            darkMode={darkMode}
            profiles={profiles}
            onProfilesChange={saveProfiles}
            onDeleteProfile={deleteProfile}
            onBack={() => setCurrentScreen('stories')}
            userEmail={userEmail}
            isOffline={isOffline}
          />
        </ImageBackground>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ImageBackground 
        source={darkMode ? require('./assets/splash_logo.png') : require('./assets/splash-light.png')} 
        style={globalStyles.backgroundImage}
        imageStyle={globalStyles.backgroundImageStyle}
      >
        {isOffline && (
          <View style={globalStyles.offlineBanner}>
            <Text style={globalStyles.offlineBannerText}>📵 Offline Mode - Viewing cached data only</Text>
          </View>
        )}
        <ScrollView style={globalStyles.screenContainer}>
      <View style={styles.titleRow}>
        <View style={{flex: 1}} />
        <Text style={globalStyles.title}>SpellTales</Text>
        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <MenuDropdown
            darkMode={darkMode}
            currentProfile={currentProfile}
            profiles={profiles}
            currentAgeRating={getCurrentAgeRating()}
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
            onRequestPassword={requestPassword}
          />
        </View>
      </View>

      {isGuestMode ? (
        <View style={{alignItems: 'center', marginBottom: 10}}>
          <Text style={globalStyles.welcomeText}>Welcome, Guest!</Text>
          <TouchableOpacity onPress={() => {
            setIsGuestMode(false);
            setIsAuthenticated(false);
            setCurrentScreen('auth');
            // Set AuthScreen to signup mode - we'll need to pass this as a prop
          }}>
            <Text style={globalStyles.linkButtonText}>
              Why not create an account for more features?
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={globalStyles.welcomeText}>
          Welcome, {currentProfile ? currentProfile.name : userEmail}!
        </Text>
      )}
      
      <View style={[globalStyles.section, {paddingBottom: 10}]}>
        <TouchableOpacity 
          style={globalStyles.genreDropdown}
          onPress={() => setShowGenreDropdown(true)}
        >
          <Text style={globalStyles.dropdownText}>
            {genres.find(g => g.value === genre)?.label || 'Select Genre'}
          </Text>
          <Text style={globalStyles.dropdownArrow}>▼</Text>
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
          key={`character1-${darkMode}`}
          style={globalStyles.textInput}
          value={character1}
          onChangeText={setCharacter1}
          placeholder="First character (e.g., princess)"
          placeholderTextColor={darkMode ? '#888' : '#666'}
          autoCapitalize="words"
        />

        <TextInput
          key={`character2-${darkMode}`}
          style={globalStyles.textInput}
          value={character2}
          onChangeText={setCharacter2}
          placeholder="Second character (e.g., dragon)"
          placeholderTextColor={darkMode ? '#888' : '#666'}
          autoCapitalize="words"
        />

        <View style={styles.keywordSection}>
          <Text style={globalStyles.cardTitle}>Optional Story Elements</Text>
          
          <TextInput
            key={`keyword1-${darkMode}`}
            style={globalStyles.textInput}
            value={keyword1}
            onChangeText={setKeyword1}
            placeholder="Keyword 1 (e.g., castle)"
            placeholderTextColor={darkMode ? '#888' : '#666'}
            autoCapitalize="words"
          />
          
          <TextInput
            key={`keyword2-${darkMode}`}
            style={globalStyles.textInput}
            value={keyword2}
            onChangeText={setKeyword2}
            placeholder="Keyword 2 (e.g., treasure)"
            placeholderTextColor={darkMode ? '#888' : '#666'}
            autoCapitalize="words"
          />
          
          <TextInput
            key={`keyword3-${darkMode}`}
            style={globalStyles.textInput}
            value={keyword3}
            onChangeText={setKeyword3}
            placeholder="Keyword 3 (e.g., rainbow)"
            placeholderTextColor={darkMode ? '#888' : '#666'}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[globalStyles.primaryButton, (isGenerating || isOffline) && globalStyles.buttonDisabled]}
            onPress={isOffline ? () => Alert.alert('Offline', 'Story creation requires internet connection') : generateStory}
            disabled={isGenerating || isOffline}
          >
            <Text style={globalStyles.buttonText}>
              {isGenerating ? '⏳ Making Your Story...' : '✨ Make My Story!'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.outlineButton, isOffline && globalStyles.buttonDisabled]}
            onPress={() => isOffline ? Alert.alert('Offline', 'Story creation requires internet connection') : setCurrentScreen('visual')}
            disabled={isOffline}
          >
            <Text style={globalStyles.outlineButtonText}>🎨 Help Me Create!</Text>
          </TouchableOpacity>

          {shouldShowReset() && (
            <TouchableOpacity 
              style={globalStyles.linkButton}
              onPress={resetStory}
            >
              <Text style={globalStyles.linkButtonText}>Reset</Text>
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
        onSignUp={() => {
          setShowUpgradeModal(false);
          setIsAuthenticated(false);
          setIsGuestMode(false);
          setInitialAuthMode('signup');
          setCurrentScreen('auth');
        }}
        darkMode={darkMode}
        isGuestMode={isGuestMode}
      />
      
      <SubscriptionModal 
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
        onWatchAd={handleWatchAd}
        onSignUp={() => {
          setShowSubscriptionModal(false);
          setIsAuthenticated(false);
          setIsGuestMode(false);
          setCurrentScreen('auth');
        }}
        darkMode={darkMode}
        isGuestMode={isGuestMode}
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
        
        {/* Banner Ad Placeholder for Free/Guest Users */}
        {!subscriptionStatus?.isSubscribed && (
          <View style={styles.bannerAdPlaceholder}>
            <Text style={styles.bannerAdText}>📱 Ad Space - AdMob Banner</Text>
          </View>
        )}
        
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
  container: {
    flex: 1,
    backgroundColor: darkMode ? 'rgba(0,0,0,0.7)' : 'transparent',
    padding: 20,
    paddingTop: 60,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
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
  leftSpacer: {
    flex: 1,
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
    fontFamily: 'Nunito_600SemiBold',
    color: '#fff',
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
  keywordSection: {
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 10,
    gap: 0,
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
  bannerAdPlaceholder: {
    backgroundColor: darkMode ? '#333' : '#e0e0e0',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: darkMode ? '#555' : '#ccc',
    borderStyle: 'dashed',
  },
  bannerAdText: {
    color: darkMode ? '#999' : '#666',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
