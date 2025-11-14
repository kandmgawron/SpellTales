import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createGlobalStyles } from './styles/GlobalStyles';

export default function SupportScreen({ darkMode, userEmail }) {
  const globalStyles = createGlobalStyles(darkMode);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [includeStoryData, setIncludeStoryData] = useState(false);
  const [selectedStory, setSelectedStory] = useState('');
  const [savedStories, setSavedStories] = useState([]);
  const [showStoryDropdown, setShowStoryDropdown] = useState(false);

  useEffect(() => {
    loadSavedStories();
  }, []);

  const loadSavedStories = async () => {
    try {
      const stories = await SecureStore.getItemAsync('savedStories');
      if (stories) {
        const parsedStories = JSON.parse(stories);
        setSavedStories(parsedStories.slice(0, 10)); // Show last 10 stories
      }
    } catch (error) {
    }
  };

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message fields.');
      return;
    }

    setLoading(true);
    
    try {
      let emailBody = `From: ${userEmail}\n\nSubject: ${subject}\n\nMessage:\n${message}`;
      
      // Add story data if requested
      if (includeStoryData && selectedStory) {
        const story = savedStories.find((_, index) => index.toString() === selectedStory);
        if (story) {
          emailBody += `\n\n--- STORY GENERATION DATA ---\n`;
          emailBody += `Timestamp: ${new Date(story.timestamp).toLocaleString()}\n`;
          emailBody += `Characters: ${story.character1}, ${story.character2}\n`;
          emailBody += `Keywords: ${story.keyword1}${story.keyword2 ? ', ' + story.keyword2 : ''}${story.keyword3 ? ', ' + story.keyword3 : ''}\n`;
          emailBody += `Genre: ${story.genre}\n`;
          emailBody += `Age Rating: ${story.ageRating || 'Not specified'}\n`;
          emailBody += `Status: ${story.status}\n`;
          if (story.error) {
            emailBody += `Error: ${story.error}\n`;
          }
          emailBody += `Story Content: ${story.content.substring(0, 500)}${story.content.length > 500 ? '...' : ''}\n`;
        }
      }
      
      const emailUrl = `mailto:spelltales@katehollow.co.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
        Alert.alert('Success', 'Email app opened. Please send your message.');
        setSubject('');
        setMessage('');
        setIncludeStoryData(false);
        setSelectedStory('');
      } else {
        Alert.alert('Error', 'Unable to open email app. Please email us directly at spelltales@katehollow.co.uk');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open email app. Please email us directly at spelltales@katehollow.co.uk');
    }
    
    setLoading(false);
  };

  const styles = getStyles(darkMode);

  return (
    <ScrollView style={{flex: 1}}>
      <Text style={globalStyles.subtitle}>We're here to help! Send us your questions or feedback.</Text>

      <View style={globalStyles.section}>
        <View style={[globalStyles.card, {marginBottom: 20, padding: 12}]}>
          <Text style={globalStyles.bodyText}>Contacting as: {userEmail}</Text>
        </View>

        <View style={{marginBottom: 20}}>
          <Text style={[globalStyles.bodyText, {fontWeight: '600', marginBottom: 8}]}>Subject *</Text>
          <TextInput
            style={globalStyles.textInput}
            value={subject}
            onChangeText={setSubject}
            placeholder="Brief description of your issue or question"
            placeholderTextColor={darkMode ? '#9CA3AF' : '#6B7280'}
          />
        </View>

        <View style={{marginBottom: 20}}>
          <Text style={[globalStyles.bodyText, {fontWeight: '600', marginBottom: 8}]}>Message *</Text>
          <TextInput
            style={[globalStyles.textInput, {minHeight: 120, textAlignVertical: 'top'}]}
            value={message}
            onChangeText={setMessage}
            placeholder="Please provide details about your issue, question, or feedback. Include any error messages or steps you've tried."
            placeholderTextColor={darkMode ? '#9CA3AF' : '#6B7280'}
            multiline
            numberOfLines={6}
          />
        </View>

        <View style={{marginBottom: 20}}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setIncludeStoryData(!includeStoryData)}
          >
            <View style={[styles.checkbox, includeStoryData && styles.checkboxChecked]}>
              {includeStoryData && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={globalStyles.bodyText}>Include story generation data with error report</Text>
          </TouchableOpacity>

          {includeStoryData && (
            <View style={{marginTop: 10}}>
              <Text style={[globalStyles.bodyText, {fontWeight: '600', marginBottom: 8}]}>Select Story with Issue</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowStoryDropdown(!showStoryDropdown)}
              >
                <Text style={[globalStyles.bodyText, {flex: 1}]}>
                  {selectedStory ? 
                    `Story ${parseInt(selectedStory) + 1}: ${savedStories[selectedStory]?.character1} & ${savedStories[selectedStory]?.character2}` :
                    'Select a story...'
                  }
                </Text>
                <Text style={styles.dropdownArrow}>{showStoryDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showStoryDropdown && (
                <View style={styles.dropdownList}>
                  {savedStories.map((story, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedStory(index.toString());
                        setShowStoryDropdown(false);
                      }}
                    >
                      <Text style={globalStyles.bodyText}>
                        Story {index + 1}: {story.character1} & {story.character2}
                        {story.status === 'failed' && (story.failureType === 'guardrail_block' ? ' 🚫' : ' ⚠️')}
                      </Text>
                      <Text style={[globalStyles.bodyText, {fontSize: 12, opacity: 0.7}]}>
                        {new Date(story.timestamp).toLocaleDateString()}
                        {story.status === 'failed' && story.failureType === 'guardrail_block' && ' - Blocked by filters'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[globalStyles.primaryButton, loading && {opacity: 0.5}]} 
          onPress={handleSendEmail}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? '📧 Opening Email...' : '📧 Send Message'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getStyles = (darkMode) => StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: darkMode ? '#4A5568' : '#E2E8F0',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: darkMode ? '#4A5568' : '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: darkMode ? '#333333' : '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownArrow: {
    fontSize: 12,
    color: darkMode ? '#ccc' : '#666',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: darkMode ? '#4A5568' : '#E2E8F0',
    borderRadius: 8,
    backgroundColor: darkMode ? '#333333' : '#fff',
    marginTop: 5,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#4A5568' : '#E2E8F0',
  },
});
