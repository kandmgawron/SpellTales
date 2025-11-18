import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import { createGlobalStyles } from './styles/GlobalStyles';
import * as Storage from './utils/storage';

export default function FAQScreen({ darkMode, userEmail, isGuest, isSubscribed, onAccountDeleted }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const globalStyles = createGlobalStyles(darkMode);

  const faqData = [
    {
      id: 1,
      question: "How does SpellTales work?",
      answer: "SpellTales uses AI to create personalized bedtime stories based on your chosen characters, settings, and keywords. Simply select your story elements and our AI generates a unique story tailored to your preferences and age rating."
    },
    {
      id: 2,
      question: "What are the different user types?",
      answer: "• Guest Users: Access to toddler-only stories with ads. No account required.\n• Free Users: All age ratings with ads. Can change age rating only.\n• Premium Users: All features, no ads, story saving, and word management."
    },
    {
      id: 3,
      question: "What age ratings are available?",
      answer: "• Toddlers (2-4 years): Very simple stories with short sentences and basic vocabulary\n• Children (5-8 years): Simple and playful stories\n• Young Teens (9-13 years): More complex adventures and themes\n• Teens (14+ years): Sophisticated stories with deeper themes"
    },
    {
      id: 4,
      question: "How are learning words used?",
      answer: "Learning words are automatically incorporated into your stories to help with spelling and vocabulary development. Only Premium users can manage custom word lists. Guest and Free users use pre-selected age-appropriate words."
    },
    {
      id: 5,
      question: "How is my data managed?",
      answer: "• Stories are automatically saved for all users but only Premium users can access saved stories\n• Personal information is encrypted and stored securely\n• We never share your data with third parties\n• You can delete your account and all associated data at any time"
    },
    {
      id: 6,
      question: "What about content safety?",
      answer: "All stories are filtered through advanced content safety systems to ensure age-appropriate, family-friendly content. Stories that don't meet our safety standards are blocked and alternative suggestions are provided."
    },
    {
      id: 7,
      question: "How do subscriptions work?",
      answer: "Premium subscriptions are £2.99/month and can be cancelled anytime. Benefits include unlimited ad-free stories, story saving and management, custom word management, and priority support."
    },
    {
      id: 8,
      question: "Can I use the app offline?",
      answer: "Story generation requires an internet connection, but Premium users can view previously saved stories offline. Free and Guest users need internet access for all features."
    },
    {
      id: 9,
      question: "How do I manage parental controls?",
      answer: "Age ratings can be changed by Free and Premium users with admin password access. Only Premium users can manage custom learning words and access saved stories for content review."
    },
    {
      id: 10,
      question: "What if I have technical issues?",
      answer: "Try restarting the app first. If issues persist, check your internet connection. Premium users can contact support through the app settings. Free users can report issues through the app store reviews."
    }
  ];

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Error', 'Please enter your password to confirm');
      return;
    }

    setDeleting(true);
    try {
      // 1. Verify password with Cognito
      const authResponse = await fetch(`https://cognito-idp.${process.env.EXPO_PUBLIC_COGNITO_REGION}.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
        },
        body: JSON.stringify({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: userEmail,
            PASSWORD: deletePassword
          }
        })
      });

      const authData = await authResponse.json();
      
      if (!authResponse.ok || !authData.AuthenticationResult) {
        Alert.alert('Error', 'Invalid password');
        setDeleting(false);
        return;
      }

      const accessToken = authData.AuthenticationResult.AccessToken;

      // 2. Delete all user data from DynamoDB via Lambda
      try {
        const deleteResponse = await fetch(`${process.env.EXPO_PUBLIC_LAMBDA_URL}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'deleteUserData',
            userEmail: userEmail
          })
        });
        
        if (!deleteResponse.ok) {
        }
      } catch (error) {
      }

      // 3. Delete from Cognito
      const cognitoDeleteResponse = await fetch(`https://cognito-idp.${process.env.EXPO_PUBLIC_COGNITO_REGION}.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.DeleteUser'
        },
        body: JSON.stringify({
          AccessToken: accessToken
        })
      });

      if (!cognitoDeleteResponse.ok) {
        throw new Error('Failed to delete Cognito user');
      }

      // 4. Clear local storage
      await Storage.deleteItemAsync('userToken');
      await Storage.deleteItemAsync('userEmail');
      await Storage.deleteItemAsync('profiles');
      await Storage.deleteItemAsync('savedStories');

      const successMessage = isSubscribed
        ? 'Your account and all data have been permanently deleted. Please cancel your subscription in your Apple ID settings.'
        : 'Your account and all data have been permanently deleted.';

      Alert.alert(
        'Account Deleted',
        successMessage,
        [{ text: 'OK', onPress: () => onAccountDeleted() }]
      );

    } catch (error) {
      Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
      setDeleting(false);
    }
  };

  const initiateDeleteAccount = () => {
    if (isGuest) {
      Alert.alert('Not Available', 'Guest users do not have accounts to delete.');
      return;
    }

    const message = isSubscribed 
      ? 'This will permanently delete your account, all profiles, saved stories, and custom words. This action cannot be undone.\n\nYou must cancel your subscription separately in your Apple ID settings.'
      : 'This will permanently delete your account, all profiles, saved stories, and custom words. This action cannot be undone.';

    Alert.alert(
      'Delete Account',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'destructive', onPress: () => setShowDeleteConfirm(true) }
      ]
    );
  };

  const styles = getStyles(darkMode);

  return (
    <ScrollView style={{flex: 1}}>
      <Text style={globalStyles.subtitle}>Everything you need to know about SpellTales</Text>

      <View style={globalStyles.section}>
        {faqData.map((item) => (
          <View key={item.id} style={styles.faqItem}>
            <TouchableOpacity
              style={styles.questionContainer}
              onPress={() => toggleSection(item.id)}
            >
              <Text style={styles.questionText}>{item.question}</Text>
              <Text style={styles.expandIcon}>
                {expandedSection === item.id ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            
            {expandedSection === item.id && (
              <View style={styles.answerContainer}>
                <Text style={styles.answerText}>{item.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Still have questions?</Text>
        <Text style={styles.contactText}>
          Premium users can contact support through the app. Free and Guest users can leave feedback in App Store reviews.
        </Text>
      </View>

      {!isGuest && (
        <>
          <View style={{ height: 100 }} />
          <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>⚠️ Danger Zone</Text>
          
          {!showDeleteConfirm ? (
            <TouchableOpacity
              style={globalStyles.dangerButton}
              onPress={initiateDeleteAccount}
            >
              <Text style={globalStyles.dangerButtonText}>Delete Account</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.deleteConfirmContainer}>
              <Text style={styles.deleteWarning}>
                Enter your password to confirm account deletion:
              </Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor={darkMode ? '#888' : '#999'}
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry
                autoCapitalize="none"
              />
              <View style={styles.deleteButtonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[globalStyles.dangerButton, {flex: 1}, deleting && styles.disabledButton]}
                  onPress={handleDeleteAccount}
                  disabled={deleting}
                >
                  <Text style={globalStyles.dangerButtonText}>
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        </>
      )}
    </ScrollView>
  );
}

const getStyles = (darkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: darkMode ? '#ccc' : '#666',
  },
  faqSection: {
    backgroundColor: darkMode ? '#333' : '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#444' : '#e0e0e0',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: darkMode ? '#fff' : '#000',
    flex: 1,
    marginRight: 10,
  },
  expandIcon: {
    fontSize: 12,
    color: darkMode ? '#ccc' : '#666',
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: darkMode ? '#444' : '#f5f5f5',
  },
  answerText: {
    fontSize: 14,
    color: darkMode ? '#fff' : '#000',
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: darkMode ? '#333' : '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkMode ? '#fff' : '#000',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: darkMode ? '#ccc' : '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  dangerZone: {
    backgroundColor: darkMode ? '#333' : '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  deleteConfirmContainer: {
    gap: 10,
  },
  deleteWarning: {
    fontSize: 14,
    color: darkMode ? '#fff' : '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  passwordInput: {
    backgroundColor: darkMode ? '#555' : '#f5f5f5',
    color: darkMode ? '#fff' : '#000',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: darkMode ? '#666' : '#ddd',
  },
  deleteButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: darkMode ? '#555' : '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: darkMode ? '#fff' : '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
