import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AdService } from '../services/AdService';

export default function AdModal({ visible, onAdComplete, onClose, darkMode }) {
  const [adState, setAdState] = useState('loading'); // loading, ready, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (visible) {
      checkAdStatus();
    }
  }, [visible]);

  const checkAdStatus = () => {
    if (AdService.isAdReady()) {
      setAdState('ready');
    } else {
      setAdState('loading');
      AdService.loadAd();
    }
  };

  const handleShowAd = async () => {
    const success = await AdService.showAd({
      onRewarded: (reward) => {
        onAdComplete();
      },
      onError: (error) => {
        setAdState('error');
        setErrorMessage('Failed to show ad. Please try again.');
      },
      onClosed: () => {
        // Ad was closed without reward
      }
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
              <TouchableOpacity style={styles.button} onPress={handleShowAd}>
                <Text style={styles.buttonText}>📺 Watch Ad</Text>
              </TouchableOpacity>
            </>
          )}
          
          {adState === 'error' && (
            <>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              <TouchableOpacity style={styles.button} onPress={checkAdStatus}>
                <Text style={styles.buttonText}>Try Again</Text>
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
  errorText: {
    color: '#ff6666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
