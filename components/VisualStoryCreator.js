import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

const characters = [
  { id: 'dinosaur', name: 'Dinosaur', emoji: '🦕' },
  { id: 'princess', name: 'Princess', emoji: '👸' },
  { id: 'astronaut', name: 'Astronaut', emoji: '👨‍🚀' },
  { id: 'prince', name: 'Prince', emoji: '🤴' },
  { id: 'alien', name: 'Alien', emoji: '👽' },
  { id: 'lion', name: 'Lion', emoji: '🦁' },
  { id: 'cat', name: 'Cat', emoji: '🐱' },
  { id: 'dog', name: 'Dog', emoji: '🐶' },
  { id: 'robot', name: 'Robot', emoji: '🤖' },
  { id: 'wizard', name: 'Wizard', emoji: '🧙‍♂️' },
  { id: 'fairy', name: 'Fairy', emoji: '🧚‍♀️' },
  { id: 'pirate', name: 'Pirate', emoji: '🏴‍☠️' },
];

const keywords = [
  { id: 'castle', name: 'Castle', emoji: '🏰' },
  { id: 'dungeon', name: 'Dungeon', emoji: '🏚️' },
  { id: 'food', name: 'Food', emoji: '🍎' },
  { id: 'games', name: 'Games', emoji: '🎮' },
  { id: 'outside', name: 'Outside', emoji: '🌳' },
  { id: 'sunshine', name: 'Sunshine', emoji: '☀️' },
  { id: 'snow', name: 'Snow', emoji: '❄️' },
  { id: 'beach', name: 'Beach', emoji: '🏖️' },
  { id: 'forest', name: 'Forest', emoji: '🌲' },
  { id: 'space', name: 'Space', emoji: '🚀' },
  { id: 'treasure', name: 'Treasure', emoji: '💎' },
  { id: 'magic', name: 'Magic', emoji: '✨' },
];

export default function VisualStoryCreator({ onCreateStory, onBack, darkMode }) {
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState(null);

  const handleCharacterSelect = (character) => {
    if (selectedCharacters.find(c => c.id === character.id)) {
      setSelectedCharacters(selectedCharacters.filter(c => c.id !== character.id));
    } else if (selectedCharacters.length < 2) {
      setSelectedCharacters([...selectedCharacters, character]);
    }
  };

  const handleKeywordSelect = (keyword) => {
    setSelectedKeyword(selectedKeyword?.id === keyword.id ? null : keyword);
  };

  const handleRandomStory = () => {
    // Randomly select 2 different characters
    const shuffledCharacters = [...characters].sort(() => Math.random() - 0.5);
    const randomCharacters = shuffledCharacters.slice(0, 2);
    
    // Randomly select 1 keyword
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    // Set selections and generate story directly
    setSelectedCharacters(randomCharacters);
    setSelectedKeyword(randomKeyword);
    
    // Call generateStory with the selections
    onCreateStory(randomCharacters[0].name, randomCharacters[1].name, randomKeyword.name);
  };

  const handleCreateStory = () => {
    if (selectedCharacters.length === 2 && selectedKeyword) {
      onCreateStory(selectedCharacters[0].name, selectedCharacters[1].name, selectedKeyword.name);
    }
  };

  const canCreate = selectedCharacters.length === 2 && selectedKeyword;
  const styles = getStyles(darkMode);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>🏠 Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Your Story</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose 2 Characters</Text>
        <Text style={styles.sectionSubtitle}>
          Selected: {selectedCharacters.length}/2
        </Text>
        <View style={styles.grid}>
          {characters.map(character => (
            <TouchableOpacity
              key={character.id}
              style={[
                styles.option,
                selectedCharacters.find(c => c.id === character.id) && styles.selectedOption
              ]}
              onPress={() => handleCharacterSelect(character)}
            >
              <Text style={styles.emoji}>{character.emoji}</Text>
              <Text style={styles.optionText}>{character.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose 1 Setting</Text>
        <Text style={styles.sectionSubtitle}>
          Selected: {selectedKeyword ? '1/1' : '0/1'}
        </Text>
        <View style={styles.grid}>
          {keywords.map(keyword => (
            <TouchableOpacity
              key={keyword.id}
              style={[
                styles.option,
                selectedKeyword?.id === keyword.id && styles.selectedOption
              ]}
              onPress={() => handleKeywordSelect(keyword)}
            >
              <Text style={styles.emoji}>{keyword.emoji}</Text>
              <Text style={styles.optionText}>{keyword.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.randomBtn}
          onPress={handleRandomStory}
        >
          <Text style={styles.randomBtnText}>
            🎲 Still no ideas? Surprise Me!
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}
          onPress={handleCreateStory}
          disabled={!canCreate}
        >
          <Text style={styles.createBtnText}>
            {canCreate ? '✨ Make My Story!' : 'Select 2 Characters & 1 Setting'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getStyles = (darkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? '#000' : '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backBtn: {
    backgroundColor: darkMode ? '#444' : '#e0e0e0',
    padding: 8,
    borderRadius: 5,
    marginRight: 15,
  },
  backText: {
    color: darkMode ? '#fff' : '#000',
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#333',
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: darkMode ? '#ccc' : '#666',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    backgroundColor: darkMode ? '#333' : '#f8f9fa',
    borderWidth: 2,
    borderColor: darkMode ? '#555' : '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '30%',
    minHeight: 100,
    justifyContent: 'center',
  },
  selectedOption: {
    borderColor: '#4CAF50',
    backgroundColor: darkMode ? '#1a4a1a' : '#e8f5e8',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#333',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    gap: 10,
  },
  randomBtn: {
    backgroundColor: '#9C27B0',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  randomBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  createBtn: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  createBtnDisabled: {
    backgroundColor: '#999',
  },
  createBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
