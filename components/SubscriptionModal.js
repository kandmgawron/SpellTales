import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SubscriptionService } from '../services/SubscriptionService';
import { createGlobalStyles } from '../styles/GlobalStyles';

export default function SubscriptionModal({ visible, onClose, onSubscribe, onWatchAd, onSignUp, darkMode, isGuestMode }) {
  const plans = SubscriptionService.getSubscriptionPlans();
  const globalStyles = createGlobalStyles(darkMode);

  const handlePurchase = async (planId) => {
    if (isGuestMode && onSignUp) {
      onSignUp();
      return;
    }
    const result = await SubscriptionService.purchaseSubscription(planId);
    if (result.success) {
      onSubscribe();
    }
  };

  const styles = getStyles(darkMode);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>🌟 Go Premium</Text>
          <Text style={styles.subtitle}>Unlock unlimited stories with no ads!</Text>
          
          <ScrollView style={styles.plansList}>
            {plans.map(plan => (
              <View key={plan.id} style={styles.planCard}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>{plan.price}/month</Text>
                <Text style={styles.planDescription}>{plan.description}</Text>
                <TouchableOpacity 
                  style={globalStyles.primaryButton}
                  onPress={() => handlePurchase(plan.id)}
                >
                  <Text style={globalStyles.buttonText}>
                    {isGuestMode ? '📝 Sign Up to Subscribe' : '⭐ Subscribe Now'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.benefits}>
            <Text style={styles.benefitTitle}>Premium Benefits:</Text>
            <Text style={styles.benefit}>• Unlimited story generation</Text>
            <Text style={styles.benefit}>• User profiles for different children</Text>
            <Text style={styles.benefit}>• No advertisements</Text>
            <Text style={styles.benefit}>• Priority support</Text>
            <Text style={styles.benefit}>• New features first</Text>
          </View>
          
          <TouchableOpacity 
            style={globalStyles.outlineButton}
            onPress={onWatchAd}
          >
            <Text style={globalStyles.outlineButtonText}>📺 Watch Ad to Continue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={globalStyles.linkButton}
            onPress={() => SubscriptionService.restorePurchases()}
          >
            <Text style={globalStyles.linkButtonText}>Restore Purchases</Text>
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
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    padding: 5,
    zIndex: 1,
  },
  closeText: {
    color: darkMode ? '#fff' : '#333',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: darkMode ? '#ccc' : '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  plansList: {
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: darkMode ? '#444' : '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#333',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 5,
  },
  planDescription: {
    fontSize: 14,
    color: darkMode ? '#ccc' : '#666',
    marginBottom: 10,
  },
  benefits: {
    marginBottom: 20,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#333',
    marginBottom: 10,
  },
  benefit: {
    fontSize: 14,
    color: darkMode ? '#ccc' : '#666',
    marginBottom: 5,
  },
});
