// App.js
import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MainNavigator from './Navigation/MainNavigator';
import AuthGlobal, { AuthContext } from './Context/Store/AuthGlobal';
import ProductProvider from './Context/Store/ProductGlobal';

const Stack = createStackNavigator();

// Create a separate Navigator component to access the AuthContext
const AppNavigator = () => {
  const { stateUser, dispatch } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const bootstrapAsync = async () => {
      let token = null;
      try {
        token = await AsyncStorage.getItem('userToken');
      } catch (e) {
        console.log('Failed to get token', e);
      }
      setUserToken(token);
      if (token) {
        // Update the auth context if we have a token
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          dispatch({
            type: 'SET_CURRENT_USER',
            payload: {
              isAuthenticated: true,
              user: parsedUserData
            }
          });
        }
      }
      setIsLoading(false);
    };

    bootstrapAsync();
  }, [dispatch]);

  if (isLoading) {
    return null; // or a loading screen
  }

  return (
    <Stack.Navigator>
      {!stateUser.isAuthenticated ? (
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'ChairUp - Login' }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ title: 'ChairUp - Register' }}
          />
        </>
      ) : (
        <Stack.Screen 
          name="Main" 
          component={MainNavigator} 
          options={{ 
            headerShown: false
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthGlobal>
      <ProductProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ProductProvider>
    </AuthGlobal>
  );
}