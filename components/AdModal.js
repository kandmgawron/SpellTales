import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AdService } from '../services/AdService';
import { createGlobalStyles } from '../styles/GlobalStyles';

export default function AdModal({ visible, onAdComplete, onClose, darkMode }) {
  const [adState, setAdState] = useState('loading'); // loading, ready, watching, error
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const globalStyles = createGlobalStyles(darkMode);

  useEffect(() => {
    if (visible) {
      setAdState('loading');
      setCountdown(5);
      checkAdStatus();
    }
  }, [visible]);

  useEffect(() => {
    if (adState === 'watching' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [adState, countdown]);

  const checkAdStatus = async () => {
    if (AdService.isAdReady()) {
      setAdState('ready');
    } else {
      setAdState('loading');
      await AdService.loadAd();
      setAdState('ready');
    }
  };

  const handleShowAd = async () => {
    setAdState('watching');
    setCountdown(5);
    
    const success = await AdService.showAd({
      onRewarded: (reward) => {
        onAdComplete();
      },
      onError: (error) => {
        setAdState('error');
        setErrorMessage('Failed to show ad. Please try again.');
      },
    });

    if (!success) {
      setAdState('error');
      setErrorMessage('Ad not ready. Please try again.');
    }
  };

  const styles = getStyles(darkMode);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {adState === 'loading' && (
            <>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.text}>Loading ad...</Text>
            </>
          )}
          
          {adState === 'ready' && (
            <>
              <Text style={styles.title}>📺 Watch Ad for Free Story</Text>
              <Text style={styles.description}>
                Watch a short video ad to unlock your story generation!
              </Text>
              <TouchableOpacity style={globalStyles.primaryButton} onPress={handleShowAd}>
                <Text style={globalStyles.buttonText}>📺 Watch Ad</Text>
              </TouchableOpacity>
            </>
          )}
          
          {adState === 'watching' && (
            <>
              <Text style={styles.title}>📺 Watching Ad...</Text>
              <Text style={styles.countdown}>{countdown}</Text>
              <Text style={styles.description}>
                Please wait while the ad plays
              </Text>
              <ActivityIndicator size="large" color="#4CAF50" />
            </>
          )}
          
          {adState === 'error' && (
            <>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              <TouchableOpacity style={globalStyles.primaryButton} onPress={checkAdStatus}>
                <Text style={globalStyles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (darkMode) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: darkMode ? '#333' : '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    color: darkMode ? '#fff' : '#333',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    color: darkMode ? '#ccc' : '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    color: darkMode ? '#fff' : '#333',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  countdown: {
    color: darkMode ? '#fff' : '#333',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  errorText: {
    color: '#ff6666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    padding: 5,
  },
  closeText: {
    color: darkMode ? '#fff' : '#333',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
