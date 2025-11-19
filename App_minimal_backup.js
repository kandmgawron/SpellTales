import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';

export default function App() {
  const [story, setStory] = useState('');
  const [character1, setCharacter1] = useState('');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>SpellTales</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Character 1"
          value={character1}
          onChangeText={setCharacter1}
        />
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Generate Story</Text>
        </TouchableOpacity>
        
        {story ? (
          <View style={styles.storyContainer}>
            <Text style={styles.story}>{story}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  storyContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
  },
  story: {
    fontSize: 16,
    lineHeight: 24,
  },
});
