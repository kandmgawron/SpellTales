import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ImageBackground } from 'react-native';
import { useFonts, Chewy_400Regular } from '@expo-google-fonts/chewy';

const COGNITO_CONFIG = {
  region: process.env.EXPO_PUBLIC_COGNITO_REGION,
  userPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID,
  clientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID
};

export default function AuthScreen({ onAuthSuccess, darkMode }) {
  let [fontsLoaded] = useFonts({
    Chewy_400Regular,
  });

  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const cognitoRequest = async (action, params) => {
    const response = await fetch(`https://cognito-idp.${COGNITO_CONFIG.region}.amazonaws.com/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': `AWSCognitoIdentityProviderService.${action}`
      },
      body: JSON.stringify(params)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.__type || 'Authentication error');
    }
    return data;
  };

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await cognitoRequest('InitiateAuth', {
        ClientId: COGNITO_CONFIG.clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      });

      if (result.AuthenticationResult) {
        onAuthSuccess(result.AuthenticationResult, email);
      }
    } catch (error) {
      Alert.alert('Sign In Error', error.message);
    }
    setLoading(false);
  };

  const signUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await cognitoRequest('SignUp', {
        ClientId: COGNITO_CONFIG.clientId,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: 'email', Value: email }]
      });
      
      setMode('verify');
      Alert.alert('Success', 'Account created! Check your email for verification code.');
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
    }
    setLoading(false);
  };

  const verifyEmail = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter verification code');
      return;
    }

    setLoading(true);
    try {
      await cognitoRequest('ConfirmSignUp', {
        ClientId: COGNITO_CONFIG.clientId,
        Username: email,
        ConfirmationCode: code
      });
      
      // Auto-login after verification
      const loginResponse = await cognitoRequest('InitiateAuth', {
        ClientId: COGNITO_CONFIG.clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      });

      if (loginResponse.AuthenticationResult) {
        // Show subscription modal first, then login
        setMode('subscription');
      }
    } catch (error) {
      Alert.alert('Verification Error', error.message);
    }
    setLoading(false);
  };

  const handleSubscriptionComplete = async () => {
    // Auto-login after subscription flow
    try {
      const loginResponse = await cognitoRequest('InitiateAuth', {
        ClientId: COGNITO_CONFIG.clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      });

      if (loginResponse.AuthenticationResult) {
        onAuthSuccess(email, loginResponse.AuthenticationResult.AccessToken);
      }
    } catch (error) {
      Alert.alert('Login Error', 'Please try signing in manually.');
      setMode('signin');
    }
  };

  const skipSubscription = () => {
    handleSubscriptionComplete();
  };

  const forgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await cognitoRequest('ForgotPassword', {
        ClientId: COGNITO_CONFIG.clientId,
        Username: email
      });
      
      setMode('reset');
      Alert.alert('Success', 'Reset code sent to your email');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (!code || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await cognitoRequest('ConfirmForgotPassword', {
        ClientId: COGNITO_CONFIG.clientId,
        Username: email,
        ConfirmationCode: code,
        Password: password
      });
      
      Alert.alert('Success', 'Password reset successfully! You can now sign in.');
      setMode('signin');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  const styles = getStyles(darkMode);

  const renderSignIn = () => (
    <View>
      <Text style={styles.title}>Log In</Text>
      
      <View style={styles.userTypeInfo}>
        <Text style={styles.userTypeTitle}>Account Types:</Text>
        <Text style={styles.userTypeDesc}>
          👤 <Text style={styles.guestText}>Guest</Text> - Toddler-only stories with adverts. No word management.
        </Text>
        <Text style={styles.userTypeDesc}>
          🆓 <Text style={styles.freeText}>Free Account</Text> - All age ratings and spelling words with adverts.
        </Text>
        <Text style={styles.userTypeDesc}>
          ⭐ <Text style={styles.premiumText}>Premium</Text> - All features and no ads.
        </Text>
      </View>
      
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={darkMode ? '#888' : '#666'}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={darkMode ? '#888' : '#666'}
        secureTextEntry
      />
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={signIn}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging In...' : 'Log In'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={() => setMode('signup')}>
        <Text style={styles.toggleText}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.forgotButton} onPress={() => setMode('forgot')}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.guestButton} onPress={() => onAuthSuccess('guest@bedtimestories.app', null, true)}>
        <Text style={styles.guestText}>Continue as Guest</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSignUp = () => (
    <View>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={darkMode ? '#888' : '#666'}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password (8+ chars, uppercase, lowercase, number)"
        placeholderTextColor={darkMode ? '#888' : '#666'}
        secureTextEntry
      />
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={signUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={() => setMode('signin')}>
        <Text style={styles.toggleText}>Back to Log In</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVerify = () => (
    <View>
      <Text style={styles.title}>Verify Email</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder="Verification Code"
        placeholderTextColor={darkMode ? '#888' : '#666'}
        keyboardType="numeric"
      />
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={verifyEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSubscription = () => (
    <View>
      <Text style={styles.title}>🎉 Welcome to SpellTales!</Text>
      <Text style={styles.subtitle}>Your account is ready. Choose your experience:</Text>
      
      <View style={styles.subscriptionOptions}>
        <TouchableOpacity 
          style={styles.premiumOption}
          onPress={handleSubscriptionComplete}
        >
          <Text style={styles.premiumTitle}>⭐ Start Premium Trial</Text>
          <Text style={styles.premiumDesc}>
            • Unlimited ad-free stories{'\n'}
            • All age ratings{'\n'}
            • Custom word management{'\n'}
            • Story saving & history
          </Text>
          <Text style={styles.premiumPrice}>$4.99/month after trial</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.freeOption}
          onPress={skipSubscription}
        >
          <Text style={styles.freeTitle}>🆓 Continue Free</Text>
          <Text style={styles.freeDesc}>
            All features with ads. Upgrade anytime.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderForgot = () => (
    <View>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={darkMode ? '#888' : '#666'}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={forgotPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending...' : 'Send Reset Code'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={() => setMode('signin')}>
        <Text style={styles.toggleText}>Back to Log In</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReset = () => (
    <View>
      <Text style={styles.title}>Enter New Password</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder="Reset Code"
        placeholderTextColor={darkMode ? '#888' : '#666'}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="New Password"
        placeholderTextColor={darkMode ? '#888' : '#666'}
        secureTextEntry
      />
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={resetPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground 
      source={darkMode ? require('./assets/splash_logo.png') : require('./assets/splash-light.png')} 
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <ScrollView style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={[styles.title, fontsLoaded && { fontFamily: 'Chewy_400Regular' }]}>SpellTales</Text>
          {mode === 'signin' && renderSignIn()}
          {mode === 'signup' && renderSignUp()}
          {mode === 'verify' && renderVerify()}
          {mode === 'subscription' && renderSubscription()}
          {mode === 'forgot' && renderForgot()}
          {mode === 'reset' && renderReset()}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const getStyles = (darkMode) => StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: darkMode ? 0.2 : 0.5,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#000',
    textAlign: 'center',
    marginBottom: 30,
  },
  authContainer: {
    backgroundColor: darkMode ? '#333' : 'white',
    margin: 20,
    marginTop: 60,
    marginBottom: 40,
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: '80%',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: darkMode ? '#444' : '#fff',
    color: darkMode ? '#fff' : '#000',
    padding: 15,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: darkMode ? '#555' : '#ddd',
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#6666ff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  toggleText: {
    color: 'white',
    fontSize: 14,
  },
  forgotButton: {
    backgroundColor: '#ff6666',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  forgotText: {
    color: 'white',
    fontSize: 14,
  },
  guestButton: {
    backgroundColor: '#888',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: darkMode ? '#666' : '#aaa',
  },
  guestText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userTypeInfo: {
    backgroundColor: darkMode ? '#222' : '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: darkMode ? '#444' : '#e0e0e0',
  },
  userTypeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  userTypeDesc: {
    fontSize: 12,
    color: darkMode ? '#ccc' : '#666',
    lineHeight: 16,
    marginBottom: 4,
  },
  guestText: {
    color: '#DDA0DD',
    fontWeight: 'bold',
  },
  freeText: {
    color: '#90EE90',
    fontWeight: 'bold',
  },
  premiumText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  subscriptionOptions: {
    marginTop: 20,
  },
  premiumOption: {
    backgroundColor: '#FFD700',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  premiumDesc: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  premiumPrice: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  freeOption: {
    backgroundColor: darkMode ? '#4A5568' : '#E2E8F0',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: darkMode ? '#6B7280' : '#CBD5E0',
  },
  freeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: darkMode ? '#E2E8F0' : '#2D3748',
    marginBottom: 5,
  },
  freeDesc: {
    fontSize: 14,
    color: darkMode ? '#A0AEC0' : '#4A5568',
  },
  subtitle: {
    fontSize: 16,
    color: darkMode ? '#A0AEC0' : '#4A5568',
    marginBottom: 10,
    textAlign: 'center',
  },
});
