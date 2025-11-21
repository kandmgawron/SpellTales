import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet, Modal, TextInput, Platform } from 'react-native';
import * as Storage from './utils/storage';
import Markdown from 'react-native-markdown-display';
import { CONFIG } from './config';
import { createGlobalStyles } from './styles/GlobalStyles';
import { checkBiometricSupport } from './utils/biometricAuth';
import { confirmDialog } from './utils/confirmDialog';
export default function SavedStoriesScreen({ darkMode, userEmail, currentProfile, globalAgeRating, onReloadStory, isOffline }) {
  const globalStyles = createGlobalStyles(darkMode);
  const [savedStories, setSavedStories] = useState([]);
  const [allStories, setAllStories] = useState([]);
  const [profileFilter, setProfileFilter] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [skipNextLoad, setSkipNextLoad] = useState(false);
  // Age rating hierarchy - higher numbers can access lower numbers
  const ageRatingHierarchy = {
    'toddlers': 1,
    'children': 2,
    'young-teens': 3,
    'teens': 4
  };
  const canAccessStory = (storyAgeRating, profileAgeRating) => {
    const storyLevel = ageRatingHierarchy[storyAgeRating] || 1;
    const profileLevel = ageRatingHierarchy[profileAgeRating] || 1;
    return profileLevel >= storyLevel;
  };
  useEffect(() => {
    loadSavedStories();
    checkBiometrics();
  }, []);
  useEffect(() => {
    if (skipNextLoad) {
      setSkipNextLoad(false);
      return;
    }
    loadSavedStories();
  }, [currentProfile]);
  const checkBiometrics = async () => {
    const available = await checkBiometricSupport();
    setBiometricAvailable(available);
  };
  const requestPassword = (action) => {
    setPendingAction(() => action);
    setShowPasswordModal(true);
    setPassword('');
  };
  const verifyWithBiometrics = async () => {
    const authenticated = await authenticateWithBiometrics('Verify your identity');
    if (authenticated && pendingAction) {
      setShowPasswordModal(false);
      pendingAction();
      setPendingAction(null);
      setPassword('');
    }
  };
  const verifyPassword = async () => {
    try {
      const response = await fetch(`https://cognito-idp.eu-west-2.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
        },
        body: JSON.stringify({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: CONFIG.COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: userEmail,
            PASSWORD: password
          }
        })
      });
      if (response.ok) {
        setShowPasswordModal(false);
        if (pendingAction) {
          pendingAction();
        }
        setPendingAction(null);
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
  const loadSavedStories = async () => {
    try {
      // Load local stories first (offline-first approach)
      const localStoriesJson = await Storage.getItemAsync('savedStories');
      let localStories = localStoriesJson ? JSON.parse(localStoriesJson) : [];
      
      // Migration: Clear old stories with mismatched ID format
      const hasOldFormat = localStories.some(s => s.id && !s.id.startsWith('story_'));
      if (hasOldFormat) {
        localStories = [];
        await Storage.setItemAsync('savedStories', JSON.stringify([]));
      }
      
      // Set local stories immediately (offline-first)
      setAllStories(localStories);
      // Filter for current profile from local data
      if (currentProfile) {
        const filtered = localStories.filter(story => story.profileId === currentProfile.id);
        setSavedStories(filtered);
      } else {
        const filtered = profileFilter 
          ? localStories.filter(story => story.profileId === profileFilter)
          : localStories;
        setSavedStories(filtered);
      }
      // Try to sync with cloud in background (if online) - but don't override local deletions
      if (!isOffline && userEmail) {
        try {
          const response = await fetch(`${CONFIG.API_BASE_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'get_user_stories',
              userEmail: userEmail
            })
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              const cloudStories = (result.stories || []).map(story => ({
                content: story.story_content,
                timestamp: new Date(story.timestamp).getTime(),
                genre: story.genre,
                character1: story.character1,
                character2: story.character2,
                keyword1: story.keyword1,
                ageRating: story.age_rating,
                id: story.story_id, // Use id consistently
                status: story.status || 'success',
                profileId: story.profile_id || null,
                profileName: story.profile_name || 'Global'
              }));
              // Only add new stories from cloud that aren't in local storage
              const localStoryIds = new Set(localStories.map(s => s.id));
              const newCloudStories = cloudStories.filter(s => !localStoryIds.has(s.id));
              if (newCloudStories.length > 0) {
                const mergedStories = [...localStories, ...newCloudStories]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setAllStories(mergedStories);
                await Storage.setItemAsync('savedStories', JSON.stringify(mergedStories));
                // Re-filter for current profile
                if (currentProfile) {
                  const filtered = mergedStories.filter(story => story.profileId === currentProfile.id);
                  setSavedStories(filtered);
                } else {
                  const filtered = profileFilter 
                    ? mergedStories.filter(story => story.profileId === profileFilter)
                    : mergedStories;
                  setSavedStories(filtered);
                }
              }
            }
          }
        } catch (error) {
          // Silent fail for background sync
        }
      }
    } catch (error) {
      setSavedStories([]);
    }
  };
  const deleteStoryAction = async (index) => {
    try {
      const story = savedStories[index];
      const cloudId = story.storyId || story.id;
      // Delete from local storage first (offline-first approach)
      const updatedStories = savedStories.filter((_, i) => i !== index);
      setSavedStories(updatedStories);
      await Storage.setItemAsync('savedStories', JSON.stringify(updatedStories));
      setSkipNextLoad(true);
      // Try to delete from cloud
      if (cloudId && userEmail && !isOffline) {
        try {
          const response = await fetch(`${CONFIG.API_BASE_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete_story',
              storyId: cloudId,
              userEmail: userEmail
            })
          });
          if (response.ok) {
            const result = await response.json();
            if (!result.success) {
            }
          }
        } catch (cloudError) {
        }
      }
      Alert.alert('Success', 'Story deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete story');
    }
  };
  const deleteStory = async (index) => {
    if (isOffline) {
      Alert.alert('Offline', 'Story deletion requires internet connection');
      return;
    }
    const confirmed = await confirmDialog('Are you sure you want to delete this story?');
    if (confirmed) {
      requestPassword(() => deleteStoryAction(index));
    }
  };
  const deleteAllStoriesAction = async () => {
    try {
      // Clear local storage first
      await Storage.setItemAsync('savedStories', JSON.stringify([]));
      setSavedStories([]);
      // Clear from cloud
      if (userEmail) {
        try {
          const response = await fetch(`${CONFIG.API_BASE_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'clear_user_stories',
              userEmail: userEmail
            })
          });
          const result = await response.json();
          if (!result.success) {
            Alert.alert('Warning', 'Local stories cleared but cloud sync may have failed');
          }
        } catch (cloudError) {
          Alert.alert('Warning', 'Local stories cleared but cloud sync failed');
        }
      }
      Alert.alert('Success', 'All stories deleted successfully');
    } catch (error) {
      Alert.alert('Error', `Failed to delete all stories: ${error.message}`);
    }
  };
  const deleteAllStories = async () => {
    if (isOffline) {
      Alert.alert('Offline', 'Story deletion requires internet connection');
      return;
    }
    if (savedStories.length === 0) {
      Alert.alert('No Stories', 'There are no stories to delete');
      return;
    }
    const confirmed = await confirmDialog(`Are you sure you want to delete all ${savedStories.length} stories? This cannot be undone.`);
    if (confirmed) {
      requestPassword(deleteAllStoriesAction);
    }
  };
  const canReloadStory = (story) => {
    // Determine which age rating to use
    const ageRatingToCheck = currentProfile ? currentProfile.ageRating : globalAgeRating;
    // Use the same age rating hierarchy as defined above
    return canAccessStory(story.ageRating, ageRatingToCheck);
  };
  const reloadStory = (story) => {
    if (onReloadStory) {
      onReloadStory(story.content);
    }
  };
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString();
  };
  const truncateStory = (story, maxLength = 150) => {
    return story.length > maxLength ? story.substring(0, maxLength) + '...' : story;
  };
  const getCharacterEmoji = (character) => {
    const emojiMap = {
      'cat': '🐱', 'dog': '🐶', 'princess': '👸', 'dragon': '🐉', 'astronaut': '👨‍🚀',
      'pirate': '🏴‍☠️', 'fairy': '🧚', 'robot': '🤖', 'dinosaur': '🦕', 'unicorn': '🦄',
      'bear': '🐻', 'rabbit': '🐰', 'lion': '🦁', 'elephant': '🐘', 'monkey': '🐵'
    };
    return emojiMap[character.toLowerCase()] || '👤';
  };
  const getReadingTime = (content) => {
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200); // Average reading speed
    return `${minutes} min read`;
  };
  const getStatusIcon = (story) => {
    if (story.status === 'failed') {
      return story.failureType === 'guardrail_block' ? '🚫' : '❌';
    }
    return '✅';
  };
  const styles = getStyles(darkMode);
  return (
    <ScrollView style={{flex: 1}}>
      <Text style={globalStyles.subtitle}>
        {currentProfile 
          ? `Stories for: ${currentProfile.name}` 
          : 'All Stories (All Profiles)'}
      </Text>
      {!currentProfile && allStories.length > 0 && (
        <View style={globalStyles.filterContainer}>
          <Text style={globalStyles.filterLabel}>Filter by profile:</Text>
            <TouchableOpacity 
              style={[globalStyles.filterBtn, !profileFilter && globalStyles.filterBtnActive]}
              onPress={() => {
                setProfileFilter(null);
                setSavedStories(allStories);
              }}
            >
              <Text style={globalStyles.filterBtnText}>All</Text>
            </TouchableOpacity>
            {[...new Set(allStories.map(s => s.profileId).filter(Boolean))].map(profId => {
              const story = allStories.find(s => s.profileId === profId);
              return (
                <TouchableOpacity 
                  key={profId}
                  style={[globalStyles.filterBtn, profileFilter === profId && globalStyles.filterBtnActive]}
                  onPress={() => {
                    setProfileFilter(profId);
                    setSavedStories(allStories.filter(s => s.profileId === profId));
                  }}
                >
                  <Text style={globalStyles.filterBtnText}>{story?.profileName || 'Unknown'}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity 
              style={[globalStyles.filterBtn, profileFilter === 'global' && globalStyles.filterBtnActive]}
              onPress={() => {
                setProfileFilter('global');
                setSavedStories(allStories.filter(s => !s.profileId));
              }}
            >
              <Text style={globalStyles.filterBtnText}>Global</Text>
            </TouchableOpacity>
        </View>
      )}
      {savedStories.length === 0 ? (
        <View style={globalStyles.section}>
          <Text style={globalStyles.cardTitle}>No saved stories yet</Text>
          <Text style={globalStyles.description}>Stories you save will appear here</Text>
        </View>
      ) : (
        <View style={globalStyles.section}>
          <Text style={globalStyles.cardTitle}>Your Stories ({savedStories.length}):</Text>
          <View style={styles.cardsContainer}>
            {savedStories.map((story, index) => (
              <TouchableOpacity 
                key={index} 
                style={globalStyles.card}
                onPress={() => setSelectedStory(selectedStory === index ? null : index)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.charactersRow}>
                    <Text style={styles.characterEmoji}>{getCharacterEmoji(story.character1)}</Text>
                    <Text style={styles.characterEmoji}>{getCharacterEmoji(story.character2)}</Text>
                    <Text style={globalStyles.cardTitle}>
                      {story.character1} & {story.character2}
                    </Text>
                  </View>
                  <Text style={styles.statusIcon}>{getStatusIcon(story)}</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.tagsRow}>
                    <View style={styles.genreTag}>
                      <Text style={styles.tagText}>{story.genre}</Text>
                    </View>
                    <View style={styles.keywordTag}>
                      <Text style={styles.tagText}>{story.keyword1}</Text>
                    </View>
                    <View style={styles.ageTag}>
                      <Text style={styles.tagText}>{story.ageRating}</Text>
                    </View>
                    {!currentProfile && (
                      <View style={globalStyles.profileTag}>
                        <Text style={globalStyles.profileTagText}>👤 {story.profileName || 'Global'}</Text>
                      </View>
                    )}
                  </View>
                </View>
                {selectedStory === index && (
                  <View style={styles.expandedContent}>
                    <Markdown style={{
                      body: { color: darkMode ? '#fff' : '#333', fontSize: 14, lineHeight: 20 },
                      paragraph: { marginBottom: 8 },
                      strong: { fontWeight: 'bold' },
                      em: { fontStyle: 'italic' }
                    }}>
                      {story.content.split(' ').slice(0, 50).join(' ') + '...'}
                    </Markdown>
                    <View style={styles.metadataRow}>
                      <Text style={globalStyles.bodyText}>{formatDate(story.timestamp)}</Text>
                      <Text style={globalStyles.bodyText}>{getReadingTime(story.content)}</Text>
                    </View>
                    <View style={styles.actionButtons}>
                      {canReloadStory(story) ? (
                        <TouchableOpacity
                          style={globalStyles.primaryButton}
                          onPress={() => reloadStory(story)}
                        >
                          <Text style={globalStyles.buttonText}>📖 View Full Story</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={[globalStyles.primaryButton, globalStyles.buttonDisabled]}>
                          <Text style={globalStyles.buttonText}>🔒 Age Restricted</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={globalStyles.dangerButton}
                        onPress={() => deleteStory(index)}
                      >
                        <Text style={globalStyles.dangerButtonText}>🗑️ Delete Story</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      {savedStories.length > 0 && (
        <TouchableOpacity 
          style={globalStyles.dangerButton}
          onPress={deleteAllStories}
        >
          <Text style={globalStyles.dangerButtonText}>🗑️ Delete All Stories</Text>
        </TouchableOpacity>
      )}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Enter Your Login Password</Text>
            <TextInput
              style={globalStyles.textInput}
              placeholder="Enter password"
              placeholderTextColor={darkMode ? '#999' : '#666'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoFocus={true}
            />
            <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
              <TouchableOpacity 
                style={[globalStyles.outlineButton, {flex: 1}]}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={globalStyles.outlineButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[globalStyles.primaryButton, {flex: 1}]}
                onPress={verifyPassword}
              >
                <Text style={globalStyles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
            {biometricAvailable && (
              <TouchableOpacity 
                style={[globalStyles.linkButton, {marginTop: 10}]}
                onPress={verifyWithBiometrics}
              >
                <Text style={globalStyles.linkButtonText}>🔐 Use Face ID / Touch ID</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
const getStyles = (darkMode) => StyleSheet.create({
  // Only component-specific layout styles
  cardsContainer: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  charactersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  characterEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  statusIcon: {
    fontSize: 20,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: '#6B73FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  keywordTag: {
    backgroundColor: darkMode ? '#4A5568' : '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ageTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: darkMode ? '#4A5568' : '#E2E8F0',
    padding: 16,
    backgroundColor: darkMode ? '#374151' : '#F7FAFC',
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
});
