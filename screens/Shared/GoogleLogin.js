import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = "http://192.168.1.39:3000/api";

// Register for Google OAuth client ID
// Visit: https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = "562957089179-v0glkbdo2sc169prvf84hhrdi0p2rouj.apps.googleusercontent.com";

WebBrowser.maybeCompleteAuthSession();

const GoogleLogin = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Use proxy: true for Expo Go
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
    redirectUri: `https://auth.expo.io/@${Constants.expoConfig?.owner || 'donn_baldoza'}/ChairUp`,
    scopes: ['profile', 'email'],
    proxy: true
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      setIsLoading(true);
      const { authentication } = response;
      handleGoogleLogin(authentication.accessToken);
    } else if (response?.type === 'error') {
      Alert.alert('Authentication error', response.error?.message || 'An error occurred during sign in');
      setIsLoading(false);
    }
  }, [response]);

  const handleGoogleLogin = async (accessToken) => {
    try {
      console.log('Access token obtained:', accessToken);
      
      // Get user data from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const userData = await userInfoResponse.json();
      console.log('User data received:', userData);
      
      // Send to your backend
      const response = await axios.post(`${API_URL}/auth/google`, {
        email: userData.email,
        name: userData.name,
        profileImage: userData.picture
      });
      
      // Handle login success
      const { token, user } = response.data;
      
      // Store token securely
      await SecureStore.setItemAsync('userToken', token);
      
      // Store user data
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      
      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Login Error', 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.googleButton}
      onPress={() => {
        setIsLoading(true);
        promptAsync();
      }}
      disabled={!request || isLoading}
    >
      {isLoading ? (
        <Text style={styles.googleText}>Connecting...</Text>
      ) : (
        <>
          <Image 
            source={{ uri: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" }} 
            style={styles.googleIcon} 
          />
          <Text style={styles.googleText}>Sign in with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '80%',
  },
  googleIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  googleText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '500',
  }
});

export default GoogleLogin;