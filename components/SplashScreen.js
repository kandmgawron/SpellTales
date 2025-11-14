import React from 'react';
import { View, Image, Dimensions } from 'react-native';
import { createGlobalStyles } from '../styles/GlobalStyles';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const globalStyles = createGlobalStyles(false);
  
  return (
    <View style={[globalStyles.splashContainer, { width, height }]}>
      <Image 
        source={require('../assets/splash_logo.png')} 
        style={[globalStyles.splashLogo, { width, height }]}
        resizeMode="cover"
      />
    </View>
  );
}
