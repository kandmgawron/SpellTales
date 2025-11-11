import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function UpgradeModal({ visible, onClose, onSubscribe, darkMode }) {
  const styles = getStyles(darkMode);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>⭐ Upgrade to Premium</Text>
          
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Premium Benefits:</Text>
            <Text style={styles.benefit}>⭐ Unlimited stories with no ads</Text>
            <Text style={styles.benefit}>📚 All age ratings (Toddlers to Teens)</Text>
            <Text style={styles.benefit}>📝 Custom learning words management</Text>
            <Text style={styles.benefit}>🎨 Advanced story customization</Text>
            <Text style={styles.benefit}>💾 Story history and favorites</Text>
          </View>

          <View style={styles.pricingContainer}>
            <Text style={styles.priceTitle}>Premium Monthly</Text>
            <Text style={styles.price}>$4.99/month</Text>
            <Text style={styles.priceDesc}>Cancel anytime</Text>
          </View>

          <TouchableOpacity style={styles.subscribeBtn} onPress={onSubscribe}>
            <Text style={styles.subscribeBtnText}>⭐ Subscribe Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>⏰ Maybe Later</Text>
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
    borderRadius: 15,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 20,
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
    marginBottom: 20,
    marginTop: 10,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 25,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#333',
    marginBottom: 10,
  },
  benefit: {
    fontSize: 16,
    color: darkMode ? '#ccc' : '#666',
    marginBottom: 8,
    paddingLeft: 10,
  },
  pricingContainer: {
    alignItems: 'center',
    marginBottom: 25,
    padding: 20,
    backgroundColor: darkMode ? '#444' : '#f8f9fa',
    borderRadius: 10,
    width: '100%',
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#333',
    marginBottom: 5,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  priceDesc: {
    fontSize: 14,
    color: darkMode ? '#ccc' : '#666',
  },
  subscribeBtn: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  subscribeBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelBtn: {
    padding: 10,
  },
  cancelBtnText: {
    color: darkMode ? '#ccc' : '#666',
    fontSize: 16,
  },
});
