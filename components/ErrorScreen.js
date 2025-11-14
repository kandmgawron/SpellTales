import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createGlobalStyles } from '../styles/GlobalStyles';

const ErrorScreen = ({ message = "Something went wrong", onRetry, onBack }) => {
  const globalStyles = createGlobalStyles(false);
  
  return (
    <View style={globalStyles.errorScreenContainer}>
      <Text style={globalStyles.errorScreenTitle}>Oops!</Text>
      <Text style={globalStyles.errorScreenMessage}>{message}</Text>
      
      <TouchableOpacity style={globalStyles.primaryButton} onPress={onRetry}>
        <Text style={globalStyles.primaryButtonText}>Try Again</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={globalStyles.linkButton} onPress={onBack}>
        <Text style={globalStyles.linkButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ErrorScreen;
