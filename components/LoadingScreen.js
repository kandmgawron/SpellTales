import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions, ImageBackground } from 'react-native';

const { width, height } = Dimensions.get('window');

const LoadingScreen = ({ message = "Creating your story..." }) => {
  return (
    <ImageBackground 
      source={require('../assets/splash_logo.png')} 
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <ActivityIndicator size="large" color="#6B73FF" />
      <Text style={styles.message}>{message}</Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    zIndex: 9999,
  },
  backgroundImage: {
    opacity: 0.1,
    resizeMode: 'cover',
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    color: '#4A5568',
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default LoadingScreen;
