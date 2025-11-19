import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { createGlobalStyles } from '../styles/GlobalStyles';

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
  { id: 'knight', name: 'Knight', emoji: '⚔️' },
  { id: 'mermaid', name: 'Mermaid', emoji: '🧜' },
  { id: 'superhero', name: 'Superhero', emoji: '🦸' },
  { id: 'dragon', name: 'Dragon', emoji: '🐉' },
  { id: 'unicorn', name: 'Unicorn', emoji: '🦄' },
  { id: 'bear', name: 'Bear', emoji: '🐻' },
  { id: 'monkey', name: 'Monkey', emoji: '🐵' },
  { id: 'penguin', name: 'Penguin', emoji: '🐧' },
  { id: 'fox', name: 'Fox', emoji: '🦊' },
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
  { id: 'adventure', name: 'Adventure', emoji: '🗺️' },
  { id: 'friendship', name: 'Friendship', emoji: '🤝' },
  { id: 'music', name: 'Music', emoji: '🎵' },
  { id: 'rainbow', name: 'Rainbow', emoji: '🌈' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊' },
  { id: 'mountain', name: 'Mountain', emoji: '⛰️' },
  { id: 'stars', name: 'Stars', emoji: '⭐' },
  { id: 'flowers', name: 'Flowers', emoji: '🌸' },
  { id: 'mystery', name: 'Mystery', emoji: '🔍' },
  { id: 'party', name: 'Party', emoji: '🎉' },
  { id: 'school', name: 'School', emoji: '🏫' },
  { id: 'sports', name: 'Sports', emoji: '⚽' },
];

export default function VisualStoryCreator({ onCreateStory, onBack, darkMode, ageRating = 'children' }) {
  const getGenresForAge = (rating) => {
    const baseGenres = [{ id: 'random', name: 'Random', emoji: '🎲' }];
    
    if (rating === 'toddlers') {
      return baseGenres.concat([
        { id: 'adventure', name: 'Adventure', emoji: '🗺️' },
        { id: 'friendship', name: 'Friendship', emoji: '🤝' },
        { id: 'animals', name: 'Animals', emoji: '🐾' },
        { id: 'silly', name: 'Silly & Fun', emoji: '😄' },
        { id: 'bedtime', name: 'Bedtime', emoji: '🌙' },
        { id: 'family', name: 'Family', emoji: '👨‍👩‍👧‍👦' },
        { id: 'nature', name: 'Nature', emoji: '🌳' },
        { id: 'colours', name: 'Colours', emoji: '🎨' },
        { id: 'shapes', name: 'Shapes', emoji: '🔷' },
        { id: 'music', name: 'Music', emoji: '🎵' },
        { id: 'counting', name: 'Counting', emoji: '🔢' },
      ]);
    } else if (rating === 'children') {
      return baseGenres.concat([
        { id: 'adventure', name: 'Adventure', emoji: '🗺️' },
        { id: 'fairy-tale', name: 'Fairy Tale', emoji: '🧚' },
        { id: 'mystery', name: 'Mystery', emoji: '🔍' },
        { id: 'friendship', name: 'Friendship', emoji: '🤝' },
        { id: 'magic', name: 'Magic', emoji: '✨' },
        { id: 'animals', name: 'Animals', emoji: '🐾' },
        { id: 'silly', name: 'Silly & Fun', emoji: '😄' },
        { id: 'space', name: 'Space', emoji: '🚀' },
        { id: 'pirates', name: 'Pirates', emoji: '🏴‍☠️' },
        { id: 'dragons', name: 'Dragons', emoji: '🐉' },
        { id: 'underwater', name: 'Underwater', emoji: '🌊' },
      ]);
    } else if (rating === 'young_teens') {
      return baseGenres.concat([
        { id: 'adventure', name: 'Adventure', emoji: '🗺️' },
        { id: 'mystery', name: 'Mystery', emoji: '🔍' },
        { id: 'fantasy', name: 'Fantasy', emoji: '🐉' },
        { id: 'friendship', name: 'Friendship', emoji: '🤝' },
        { id: 'magic', name: 'Magic', emoji: '✨' },
        { id: 'space', name: 'Space', emoji: '🚀' },
        { id: 'time-travel', name: 'Time Travel', emoji: '⏰' },
        { id: 'superhero', name: 'Superhero', emoji: '🦸' },
        { id: 'sports', name: 'Sports', emoji: '⚽' },
        { id: 'school', name: 'School', emoji: '🏫' },
        { id: 'survival', name: 'Survival', emoji: '🏕️' },
      ]);
    } else { // teens
      return baseGenres.concat([
        { id: 'adventure', name: 'Adventure', emoji: '🗺️' },
        { id: 'mystery', name: 'Mystery', emoji: '🔍' },
        { id: 'fantasy', name: 'Fantasy', emoji: '🐉' },
        { id: 'romance', name: 'Romance', emoji: '💕' },
        { id: 'coming-of-age', name: 'Coming of Age', emoji: '🌱' },
        { id: 'friendship', name: 'Friendship', emoji: '🤝' },
        { id: 'identity', name: 'Identity', emoji: '🪞' },
        { id: 'independence', name: 'Independence', emoji: '🗽' },
        { id: 'relationships', name: 'Relationships', emoji: '💬' },
        { id: 'dystopian', name: 'Dystopian', emoji: '🏙️' },
        { id: 'thriller', name: 'Thriller', emoji: '😱' },
      ]);
    }
  };

  const genres = getGenresForAge(ageRating);
  const [selectedGenre, setSelectedGenre] = useState('random');
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);

  const handleCharacterSelect = (character) => {
    if (selectedCharacters.find(c => c.id === character.id)) {
      setSelectedCharacters(selectedCharacters.filter(c => c.id !== character.id));
    } else if (selectedCharacters.length < 2) {
      setSelectedCharacters([...selectedCharacters, character]);
    }
  };

  const handleKeywordSelect = (keyword) => {
    if (selectedKeywords.find(k => k.id === keyword.id)) {
      setSelectedKeywords(selectedKeywords.filter(k => k.id !== keyword.id));
    } else if (selectedKeywords.length < 3) {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  const handleRandomStory = () => {
    // Randomly select genre
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    
    // Randomly select 2 different characters
    const shuffledCharacters = [...characters].sort(() => Math.random() - 0.5);
    const randomCharacters = shuffledCharacters.slice(0, 2);
    
    // Randomly select 1 keyword
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    // Set selections and generate story directly
    setSelectedGenre(randomGenre.id);
    setSelectedCharacters(randomCharacters);
    setSelectedKeywords([randomKeyword]);
    
    // Call generateStory with the selections
    onCreateStory(randomGenre.id, randomCharacters[0].name, randomCharacters[1].name, randomKeyword.name, '', '');
  };

  const handleCreateStory = () => {
    if (selectedCharacters.length === 2 && selectedKeywords.length > 0) {
      onCreateStory(
        selectedGenre,
        selectedCharacters[0].name, 
        selectedCharacters[1].name, 
        selectedKeywords[0]?.name || '',
        selectedKeywords[1]?.name || '',
        selectedKeywords[2]?.name || ''
      );
    }
  };

  const canCreate = selectedCharacters.length === 2 && selectedKeywords.length > 0;
  const styles = getStyles(darkMode);
  const globalStyles = createGlobalStyles(darkMode);

  return (
    <ScrollView style={{flex: 1}}>
      <View style={globalStyles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Genre</Text>
          <View style={styles.grid}>
            {genres.map(genre => (
              <TouchableOpacity
                key={genre.id}
                style={[
                  globalStyles.iconButton,
                  styles.visualOption,
                  selectedGenre === genre.id && globalStyles.iconButtonSelected
                ]}
                onPress={() => setSelectedGenre(genre.id)}
              >
                <Text style={styles.emoji}>{genre.emoji}</Text>
                <Text style={globalStyles.iconButtonText}>{genre.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
                  globalStyles.iconButton,
                  styles.visualOption,
                  selectedCharacters.find(c => c.id === character.id) && globalStyles.iconButtonSelected
                ]}
                onPress={() => handleCharacterSelect(character)}
              >
                <Text style={styles.emoji}>{character.emoji}</Text>
                <Text style={globalStyles.iconButtonText}>{character.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose up to 3 Keywords</Text>
          <Text style={styles.sectionSubtitle}>
            Selected: {selectedKeywords.length}/3
          </Text>
          <View style={styles.grid}>
            {keywords.map(keyword => (
              <TouchableOpacity
                key={keyword.id}
                style={[
                  globalStyles.iconButton,
                  styles.visualOption,
                  selectedKeywords.find(k => k.id === keyword.id) && globalStyles.iconButtonSelected
                ]}
                onPress={() => handleKeywordSelect(keyword)}
              >
                <Text style={styles.emoji}>{keyword.emoji}</Text>
                <Text style={globalStyles.iconButtonText}>{keyword.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={globalStyles.outlineButton}
            onPress={handleRandomStory}
          >
            <Text style={globalStyles.outlineButtonText}>
              🎲 Surprise Me!
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.primaryButton, !canCreate && globalStyles.buttonDisabled]}
            onPress={handleCreateStory}
            disabled={!canCreate}
          >
            <Text style={[globalStyles.buttonText, {textAlign: 'center'}]}>
              {canCreate ? '✨ Make My Story!' : 'Select 2 Characters & 1 Setting'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (darkMode) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#333',
    marginLeft: 15,
  },
  section: {
    padding: 10,
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
    gap: 6,
  },
  visualOption: {
    width: '31.5%',
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    gap: 0,
  },
});
