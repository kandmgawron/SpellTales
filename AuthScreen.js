import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ImageBackground } from 'react-native';
import { useFonts, Chewy_400Regular } from '@expo-google-fonts/chewy';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito';
import { createGlobalStyles } from './styles/GlobalStyles';
import { checkBiometricSupport, authenticateWithBiometrics, getBiometricCredentials, saveBiometricCredentials, isBiometricEnabled } from './utils/biometricAuth';

export default function AuthScreen({ onAuthSuccess, onGuestMode, darkMode = true, initialMode = 'welcome' }) {
  let [fontsLoaded] = useFonts({
    Chewy_400Regular,
    Nunito_600SemiBold,
  });

  const globalStyles = createGlobalStyles(darkMode);
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const available = await checkBiometricSupport();
    const enabled = await isBiometricEnabled();
    setBiometricAvailable(available);
    setBiometricEnabled(enabled);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`https://cognito-idp.${process.env.EXPO_PUBLIC_COGNITO_REGION}.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
        },
        body: JSON.stringify({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password
          }
        })
      });

      const data = await response.json();
      
      if (response.ok && data.AuthenticationResult) {
        // Offer to save credentials for biometric login
        if (biometricAvailable && !biometricEnabled) {
          Alert.alert(
            'Enable Biometric Login?',
            'Would you like to use Face ID/Touch ID for faster login next time?',
            [
              { text: 'No Thanks', style: 'cancel' },
              { 
                text: 'Enable', 
                onPress: async () => {
                  await saveBiometricCredentials(email, password);
                  setBiometricEnabled(true);
                }
              }
            ]
          );
        }
        onAuthSuccess(data.AuthenticationResult, email, false);
      } else {
        Alert.alert('Error', data.message || 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      const authenticated = await authenticateWithBiometrics('Sign in to SpellTales');
      
      if (authenticated) {
        const credentials = await getBiometricCredentials();
        if (credentials) {
          // Use stored credentials to sign in
          const response = await fetch(`https://cognito-idp.${process.env.EXPO_PUBLIC_COGNITO_REGION}.amazonaws.com/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-amz-json-1.1',
              'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
            },
            body: JSON.stringify({
              AuthFlow: 'USER_PASSWORD_AUTH',
              ClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
              AuthParameters: {
                USERNAME: credentials.email,
                PASSWORD: credentials.password
              }
            })
          });

          const data = await response.json();
          
          if (response.ok && data.AuthenticationResult) {
            onAuthSuccess(data.AuthenticationResult, credentials.email, false);
          } else {
            Alert.alert('Error', 'Stored credentials are invalid. Please sign in again.');
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`https://cognito-idp.${process.env.EXPO_PUBLIC_COGNITO_REGION}.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.SignUp'
        },
        body: JSON.stringify({
          ClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
          Username: email,
          Password: password,
          UserAttributes: [
            {
              Name: 'email',
              Value: email
            }
          ]
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          'Success', 
          'Account created! Please check your email for a verification code.',
          [{ text: 'OK', onPress: () => setMode('verify') }]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter verification code');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`https://cognito-idp.${process.env.EXPO_PUBLIC_COGNITO_REGION}.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.ConfirmSignUp'
        },
        body: JSON.stringify({
          ClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
          Username: email,
          ConfirmationCode: verificationCode
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          'Success', 
          'Email verified! You can now sign in.',
          [{ text: 'OK', onPress: () => setMode('signin') }]
        );
      } else {
        Alert.alert('Error', data.message || 'Invalid verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`https://cognito-idp.${process.env.EXPO_PUBLIC_COGNITO_REGION}.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.ForgotPassword'
        },
        body: JSON.stringify({
          ClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
          Username: email
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          'Success', 
          'Password reset code sent to your email.',
          [{ text: 'OK', onPress: () => setMode('resetPassword') }]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to send reset code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!verificationCode || !newPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`https://cognito-idp.${process.env.EXPO_PUBLIC_COGNITO_REGION}.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.ConfirmForgotPassword'
        },
        body: JSON.stringify({
          ClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
          Username: email,
          ConfirmationCode: verificationCode,
          Password: newPassword
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          'Success', 
          'Password reset successfully! You can now sign in.',
          [{ text: 'OK', onPress: () => setMode('signin') }]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to reset password');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderWelcome = () => (
    <View style={globalStyles.welcomeContainer}>
      <Text style={[globalStyles.authTitle, fontsLoaded && { fontFamily: 'Nunito_600SemiBold' }]}>
        SpellTales
      </Text>
      <Text style={globalStyles.authSubtitle}>Magical Stories for Learning</Text>
      
      <View style={globalStyles.descriptionContainer}>
        <Text style={globalStyles.descriptionText}>✨ Personalised and custom bedtime stories tailored to your child's age</Text>
        <Text style={globalStyles.descriptionText}>📚 Integrate spelling words into engaging adventures</Text>
        <Text style={globalStyles.descriptionText}>👨‍👩‍👧‍👦 Create profiles for different children with age-appropriate content</Text>
        <Text style={globalStyles.descriptionText}>💾 Save and replay your favourite stories anytime</Text>
      </View>
      
      <View style={globalStyles.buttonContainer}>
        <TouchableOpacity 
          style={globalStyles.primaryButton}
          onPress={() => setMode('signin')}
        >
          <Text style={globalStyles.buttonText}>Log In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={globalStyles.outlineButton}
          onPress={() => setMode('signup')}
        >
          <Text style={globalStyles.outlineButtonText}>Sign Up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={globalStyles.linkButton}
          onPress={onGuestMode}
        >
          <Text style={globalStyles.linkButtonText}>Continue as guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSignIn = () => (
    <View style={globalStyles.authFormContainer}>
      <View style={{width: '100%', alignItems: 'flex-start', marginBottom: 20}}>
        <TouchableOpacity style={globalStyles.homeButton} onPress={() => setMode('welcome')}>
          <Text style={globalStyles.homeButtonText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[globalStyles.authTitle, fontsLoaded && { fontFamily: 'Nunito_600SemiBold' }]}>
        Welcome Back
      </Text>
      
      <TextInput
        style={globalStyles.textInputAuth}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={globalStyles.textInputAuth}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[globalStyles.primaryButton, loading && globalStyles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>
          {loading ? 'Signing In...' : 'Log In'}
        </Text>
      </TouchableOpacity>
      
      {biometricAvailable && biometricEnabled && (
        <TouchableOpacity 
          style={[globalStyles.outlineButton, loading && globalStyles.buttonDisabled]}
          onPress={handleBiometricLogin}
          disabled={loading}
        >
          <Text style={globalStyles.outlineButtonText}>🔐 Use Face ID / Touch ID</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={globalStyles.outlineButton}
        onPress={handleForgotPassword}
      >
        <Text style={globalStyles.outlineButtonText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSignUp = () => (
    <View style={globalStyles.authFormContainer}>
      <View style={{width: '100%', alignItems: 'flex-start', marginBottom: 20}}>
        <TouchableOpacity style={globalStyles.homeButton} onPress={() => setMode('welcome')}>
          <Text style={globalStyles.homeButtonText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[globalStyles.authTitle, fontsLoaded && { fontFamily: 'Nunito_600SemiBold' }]}>
        Create Account
      </Text>
      
      <TextInput
        style={globalStyles.textInputAuth}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={globalStyles.textInputAuth}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[globalStyles.primaryButton, loading && globalStyles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderVerify = () => (
    <View style={globalStyles.authFormContainer}>
      <View style={{width: '100%', alignItems: 'flex-start', marginBottom: 20}}>
        <TouchableOpacity style={globalStyles.homeButton} onPress={() => setMode('welcome')}>
          <Text style={globalStyles.homeButtonText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={globalStyles.heading}>
        Verify Email
      </Text>
      
      <Text style={globalStyles.welcomeText}>
        Enter the verification code sent to {email}
      </Text>
      
      <TextInput
        style={globalStyles.authInput}
        value={verificationCode}
        onChangeText={setVerificationCode}
        placeholder="Verification Code"
        placeholderTextColor="#888"
        keyboardType="number-pad"
        autoCapitalize="none"
      />
      
      <TouchableOpacity 
        style={[globalStyles.primaryButton, loading && globalStyles.buttonDisabled]}
        onPress={handleVerifyCode}
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderResetPassword = () => (
    <View style={globalStyles.authFormContainer}>
      <View style={{width: '100%', alignItems: 'flex-start', marginBottom: 20}}>
        <TouchableOpacity style={globalStyles.homeButton} onPress={() => setMode('welcome')}>
          <Text style={globalStyles.homeButtonText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={globalStyles.heading}>
        Reset Password
      </Text>
      
      <Text style={globalStyles.welcomeText}>
        Enter the code sent to {email} and your new password
      </Text>
      
      <TextInput
        style={globalStyles.authInput}
        value={verificationCode}
        onChangeText={setVerificationCode}
        placeholder="Verification Code"
        placeholderTextColor="#888"
        keyboardType="number-pad"
        autoCapitalize="none"
      />
      
      <TextInput
        style={globalStyles.authInput}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New Password"
        placeholderTextColor="#888"
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[globalStyles.primaryButton, loading && globalStyles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground 
      source={darkMode ? require('./assets/splash_logo.png') : require('./assets/splash-light.png')} 
      style={globalStyles.authBackgroundImage}
      imageStyle={globalStyles.backgroundImageStyle}
    >
      <ScrollView style={globalStyles.screenContainer}>
        <View style={globalStyles.authInnerContainer}>
          {mode === 'welcome' && renderWelcome()}
          {mode === 'signin' && renderSignIn()}
          {mode === 'signup' && renderSignUp()}
          {mode === 'verify' && renderVerify()}
          {mode === 'resetPassword' && renderResetPassword()}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

