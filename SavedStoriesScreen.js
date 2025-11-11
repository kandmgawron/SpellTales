import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet, Modal, TextInput } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function SavedStoriesScreen({ darkMode, userEmail, currentProfile, onReloadStory }) {
  const [savedStories, setSavedStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    loadSavedStories();
  }, []);

  const requestPassword = (action) => {
    setPendingAction(action);
    setShowPasswordModal(true);
    setPassword('');
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
          ClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
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
      // Try to load from cloud first
      const response = await fetch(`${process.env.EXPO_PUBLIC_LAMBDA_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_user_stories',
          userEmail: userEmail
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.stories) {
          const formattedStories = result.stories.map(story => ({
            content: story.story_content,
            timestamp: new Date(story.timestamp).getTime(),
            genre: story.genre,
            character1: story.character1,
            character2: story.character2,
            keyword1: story.keyword1,
            ageRating: story.age_rating,
            storyId: story.story_id,
            status: story.status || 'success'
          }));
          setSavedStories(formattedStories);
          return;
        }
      }
    } catch (error) {
      console.log('Cloud load failed, trying local storage');
    }

    // Fallback to SecureStore
    try {
      const stories = await SecureStore.getItemAsync('savedStories');
      if (stories) {
        setSavedStories(JSON.parse(stories));
      }
    } catch (error) {
      console.error('Error loading saved stories:', error);
    }
  };

  const deleteStoryAction = async (index) => {
    try {
      const story = savedStories[index];
      
      // Try to delete from cloud first
      if (story.storyId) {
        try {
          await fetch(`${process.env.EXPO_PUBLIC_LAMBDA_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete_story',
              storyId: story.storyId,
              userEmail: userEmail
            })
          });
        } catch (cloudError) {
          console.log('Cloud delete failed, deleting locally only');
        }
      }

      // Update local state and SecureStore
      const updatedStories = savedStories.filter((_, i) => i !== index);
      setSavedStories(updatedStories);
      await SecureStore.setItemAsync('savedStories', JSON.stringify(updatedStories));
      Alert.alert('Success', 'Story deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete story');
    }
  };

  const deleteStory = (index) => {
    Alert.alert(
      'Delete Story',
      'Are you sure you want to delete this story?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => requestPassword(() => deleteStoryAction(index))
        }
      ]
    );
  };

  const canReloadStory = (story) => {
    if (!currentProfile) return true;
    const ageOrder = ['children', 'teens', 'young_teens', 'adults'];
    const currentIndex = ageOrder.indexOf(currentProfile.ageRating);
    const storyIndex = ageOrder.indexOf(story.ageRating);
    return storyIndex <= currentIndex;
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Stories</Text>
        <Text style={styles.subtitle}>
          {currentProfile 
            ? `Stories for: ${currentProfile.name}` 
            : 'Global saved stories (no profile selected)'}
        </Text>
      </View>

      {savedStories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No saved stories yet</Text>
          <Text style={styles.emptySubtext}>Stories you save will appear here</Text>
        </View>
      ) : (
        <View style={styles.storiesSection}>
          <Text style={styles.sectionTitle}>Your Stories ({savedStories.length}):</Text>
          <View style={styles.cardsContainer}>
            {savedStories.map((story, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.storyCard}
                onPress={() => setSelectedStory(selectedStory === index ? null : index)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.charactersRow}>
                    <Text style={styles.characterEmoji}>{getCharacterEmoji(story.character1)}</Text>
                    <Text style={styles.characterEmoji}>{getCharacterEmoji(story.character2)}</Text>
                    <Text style={styles.cardTitle}>
                      {story.character1} & {story.character2}
                    </Text>
                  </View>
                  <Text style={styles.statusIcon}>{getStatusIcon(story)}</Text>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.tagsRow}>
                    <View style={styles.genreTag}>
                      <Text style={styles.genreTagText}>{story.genre}</Text>
                    </View>
                    <View style={styles.keywordTag}>
                      <Text style={styles.keywordTagText}>{story.keyword1}</Text>
                    </View>
                    <View style={styles.ageTag}>
                      <Text style={styles.ageTagText}>{story.ageRating}</Text>
                    </View>
                  </View>
                </View>

                {selectedStory === index && (
                  <View style={styles.expandedContent}>
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataText}>
                        📅 {formatDate(story.timestamp).split(' ')[0]}
                      </Text>
                      <Text style={styles.metadataText}>
                        ⏱️ {getReadingTime(story.content)}
                      </Text>
                      <Text style={styles.metadataText}>
                        📝 {story.content.split(' ').length} words
                      </Text>
                    </View>
                    
                    <ScrollView style={styles.fullStoryContainer} nestedScrollEnabled>
                      <Text style={styles.fullStoryText}>{story.content}</Text>
                    </ScrollView>
                    
                    <View style={styles.actionButtons}>
                      {canReloadStory(story) ? (
                        <TouchableOpacity
                          style={styles.reloadBtn}
                          onPress={() => reloadStory(story)}
                        >
                          <Text style={styles.reloadBtnText}>📖 View Full Story</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.disabledBtn}>
                          <Text style={styles.disabledBtnText}>🔒 Age Restricted</Text>
                        </View>
                      )}
                      
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => {
                          Alert.alert(
                            'Delete Story',
                            'Are you sure you want to delete this story? This action cannot be undone.',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { 
                                text: 'Delete', 
                                style: 'destructive',
                                onPress: () => deleteStory(index)
                              }
                            ]
                          );
                        }}
                      >
                        <Text style={styles.deleteBtnText}>🗑️ Delete Story</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

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
  );
}

const getStyles = (darkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? '#1A202C' : '#F7FAFC',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkMode ? '#E2E8F0' : '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: darkMode ? '#A0AEC0' : '#4A5568',
  },
  emptyState: {
    backgroundColor: darkMode ? '#2D3748' : '#FFFFFF',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: darkMode ? '#E2E8F0' : '#2D3748',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: darkMode ? '#A0AEC0' : '#4A5568',
  },
  storiesSection: {
    backgroundColor: darkMode ? '#2D3748' : '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkMode ? '#E2E8F0' : '#2D3748',
    marginBottom: 16,
  },
  cardsContainer: {
    // Cards will inherit the container width
  },
  storyCard: {
    backgroundColor: darkMode ? '#374151' : '#F7FAFC',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: darkMode ? '#4A5568' : '#E2E8F0',
    overflow: 'hidden',
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: darkMode ? '#E2E8F0' : '#2D3748',
    flex: 1,
  },
  statusIcon: {
    fontSize: 16,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  storyPreview: {
    fontSize: 14,
    color: darkMode ? '#A0AEC0' : '#4A5568',
    lineHeight: 20,
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 12,
    color: darkMode ? '#9CA3AF' : '#6B7280',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genreTag: {
    backgroundColor: '#6B73FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreTagText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  keywordTag: {
    backgroundColor: darkMode ? '#4A5568' : '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  keywordTagText: {
    fontSize: 10,
    color: darkMode ? '#E2E8F0' : '#4A5568',
    fontWeight: '500',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: darkMode ? '#4A5568' : '#E2E8F0',
    padding: 16,
    backgroundColor: darkMode ? '#374151' : '#F7FAFC',
  },
  fullStoryContainer: {
    maxHeight: 200,
    marginBottom: 12,
  },
  fullStoryText: {
    fontSize: 14,
    color: darkMode ? '#E2E8F0' : '#2D3748',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  reloadBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reloadBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  ageTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ageTagText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  disabledBtn: {
    backgroundColor: '#9CA3AF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  disabledBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#E53E3E',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  passwordSection: {
    backgroundColor: darkMode ? '#2D3748' : '#FFFFFF',
    padding: 20,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: darkMode ? '#E2E8F0' : '#2D3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: darkMode ? '#4A5568' : '#CBD5E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: darkMode ? '#E2E8F0' : '#2D3748',
    backgroundColor: darkMode ? '#374151' : '#F7FAFC',
    marginBottom: 15,
  },
  submitBtn: {
    backgroundColor: '#6B73FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
