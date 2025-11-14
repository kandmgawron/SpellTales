import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createGlobalStyles } from '../styles/GlobalStyles';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to crash reporting service in production
  }

  render() {
    const globalStyles = createGlobalStyles(false);
    
    if (this.state.hasError) {
      return (
        <View style={globalStyles.errorContainer}>
          <Text style={globalStyles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={globalStyles.errorMessage}>
            The app encountered an unexpected error. Please restart the app.
          </Text>
          <TouchableOpacity 
            style={globalStyles.primaryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={globalStyles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}


export default ErrorBoundary;
