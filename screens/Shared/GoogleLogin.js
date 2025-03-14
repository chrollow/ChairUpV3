import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = "http://192.168.1.39:3000/api";

// Register for Google OAuth client ID
const GOOGLE_CLIENT_ID = "562957089179-v0glkbdo2sc169prvf84hhrdi0p2rouj.apps.googleusercontent.com";

// This is critical for WebBrowser authentication
WebBrowser.maybeCompleteAuthSession();

const GoogleLogin = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configuration specific for Expo Go on physical devices
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
    responseType: "id_token",
    // Use the Expo proxy service explicitly for development
    redirectUri: `https://auth.expo.io/@donn_baldoza/chairup`,
    scopes: ['profile', 'email'],
    useProxy: true,
  });

  // Log for debugging
  useEffect(() => {
    if (request) {
      console.log("Auth request ready with redirect:", request.redirectUri);
    } else {
      console.log("Auth request not ready yet");
    }
    
    if (response) {
      console.log("Full response:", JSON.stringify(response));
    }
  }, [request, response]);

  useEffect(() => {
    console.log('Constants.linkingUri:', Constants.linkingUri);
    console.log('Constants.experienceUrl:', Constants.experienceUrl);
    console.log('Current redirectUri:', request?.redirectUri);
  }, [request]);

  // Handle the authentication response
  useEffect(() => {
    if (response?.type === 'success') {
      console.log("Auth success, handling login...");
      setIsLoading(true);
      
      // For id_token response type
      if (response.params?.id_token) {
        handleIdTokenAuth(response.params.id_token);
      } 
      // For token response type
      else if (response.authentication?.accessToken) {
        handleAccessTokenAuth(response.authentication.accessToken);
      } 
      else {
        console.error("No token found in response");
        setIsLoading(false);
        Alert.alert("Login Error", "No authentication token received");
      }
    } else if (response?.type === 'error') {
      console.error("Auth error:", response.error);
      setIsLoading(false);
      Alert.alert("Authentication Error", 
        `Google sign-in failed: ${response.error?.description || response.error?.message || 'Unknown error'}`);
    }
  }, [response]);

  // Handle authentication with ID token
  const handleIdTokenAuth = async (idToken) => {
    try {
      console.log("Handling ID token auth");
      
      // Send to your backend
      const apiResponse = await axios.post(`${API_URL}/auth/google`, {
        idToken: idToken
      });
      
      // Save auth data
      await SecureStore.setItemAsync('userToken', apiResponse.data.token);
      await SecureStore.setItemAsync('userData', JSON.stringify(apiResponse.data.user));
      
      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(apiResponse.data.user);
      }
    } catch (error) {
      console.error('Google ID token auth error:', error);
      Alert.alert('Login Error', 'Could not complete authentication. Please try again.');
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authentication with access token
  const handleAccessTokenAuth = async (accessToken) => {
    try {
      console.log('Token received, fetching user info');
      
      // Get user info with the access token
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const userData = await userInfoResponse.json();
      console.log('Google user data received:', userData.email);
      
      if (!userData.email) {
        throw new Error('Email not received from Google');
      }
      
      // Send to backend
      const apiResponse = await axios.post(`${API_URL}/auth/google`, {
        email: userData.email,
        name: userData.name,
        profileImage: userData.picture
      });
      
      // Save auth data
      await SecureStore.setItemAsync('userToken', apiResponse.data.token);
      await SecureStore.setItemAsync('userData', JSON.stringify(apiResponse.data.user));
      
      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(apiResponse.data.user);
      }
    } catch (error) {
      console.error('Google auth error:', error);
      Alert.alert('Login Error', 'Could not complete authentication. Please try again.');
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.googleButton}
      onPress={() => {
        setIsLoading(true);
        setError(null);
        try {
          console.log("Starting Google authentication...");
          promptAsync();
        } catch (error) {
          console.error('Error starting auth:', error);
          setIsLoading(false);
          Alert.alert('Authentication Error', 'Could not start Google login');
        }
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