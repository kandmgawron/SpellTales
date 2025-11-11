import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Share, Alert } from 'react-native';
import Markdown from 'react-native-markdown-display';

export default function StoryDisplayScreen({ 
  story, 
  onClose, 
  darkMode, 
  fontSize = 16 
}) {
  const [currentFontSize, setCurrentFontSize] = useState(fontSize);

  const handleShare = async () => {
    try {
      await Share.share({
        message: story,
        title: 'My Bedtime Story',
      });
    } catch (error) {
      console.error('Error sharing story:', error);
    }
  };

  const markdownStyles = {
    body: {
      color: darkMode ? '#fff' : '#333',
      fontSize: currentFontSize,
      lineHeight: currentFontSize * 1.5,
    },
    heading1: {
      color: darkMode ? '#fff' : '#333',
      fontSize: currentFontSize + 8,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    heading2: {
      color: darkMode ? '#fff' : '#333',
      fontSize: currentFontSize + 4,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    paragraph: {
      color: darkMode ? '#fff' : '#333',
      fontSize: currentFontSize,
      lineHeight: currentFontSize * 1.5,
      marginBottom: 12,
    },
    strong: {
      fontWeight: 'bold',
    },
    em: {
      fontStyle: 'italic',
    },
  };

  const styles = getStyles(darkMode);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={onClose}>
          <Text style={styles.headerBtnText}>✕ Close</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
            <Text style={styles.headerBtnText}>📤 Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.fontControls}>
        <TouchableOpacity 
          style={styles.fontBtn}
          onPress={() => setCurrentFontSize(Math.max(12, currentFontSize - 2))}
        >
          <Text style={styles.fontBtnText}>A-</Text>
        </TouchableOpacity>
        <Text style={styles.fontSizeText}>{currentFontSize}px</Text>
        <TouchableOpacity 
          style={styles.fontBtn}
          onPress={() => setCurrentFontSize(Math.min(24, currentFontSize + 2))}
        >
          <Text style={styles.fontBtnText}>A+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.storyContainer}>
        <Markdown style={markdownStyles}>
          {story}
        </Markdown>
      </ScrollView>
    </View>
  );
}

const getStyles = (darkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? '#000' : '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#333' : '#e0e0e0',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerBtn: {
    backgroundColor: darkMode ? '#444' : '#e0e0e0',
    padding: 10,
    borderRadius: 8,
  },
  headerBtnText: {
    color: darkMode ? '#fff' : '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    backgroundColor: darkMode ? '#333' : '#f0f0f0',
    marginHorizontal: 20,
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
    flex: 1,
    padding: 20,
    backgroundColor: darkMode ? '#111' : '#f8f9fa',
    margin: 20,
    borderRadius: 10,
  },
});
