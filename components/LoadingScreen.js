import React from 'react';
import { View, Text, ActivityIndicator, Dimensions, ImageBackground } from 'react-native';
import { createGlobalStyles } from '../styles/GlobalStyles';

const { width, height } = Dimensions.get('window');

const LoadingScreen = ({ message = "Creating your story..." }) => {
  const globalStyles = createGlobalStyles(false);
  
  return (
    <ImageBackground 
      source={require('../assets/splash_logo.png')} 
      style={[globalStyles.loadingContainer, { width, height }]}
      imageStyle={globalStyles.loadingBackgroundImage}
    >
      <ActivityIndicator size="large" color="#6B73FF" />
      <Text style={globalStyles.loadingMessage}>{message}</Text>
    </ImageBackground>
  );
};

export default LoadingScreen;
