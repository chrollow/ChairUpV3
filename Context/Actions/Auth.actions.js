import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const SET_CURRENT_USER = "SET_CURRENT_USER";

export const loginUser = (user, dispatch) => {
  // For demo purposes we'll use AsyncStorage directly
  // In production, you'd call your API here
  if (user.email && user.password) {
    try {
      // Store token and user data
      AsyncStorage.setItem('userToken', 'dummy-auth-token');
      AsyncStorage.setItem('userData', JSON.stringify({
        email: user.email,
        name: 'Demo User' // In a real app, this would come from your API response
      }));
      
      // Update context
      dispatch({
        type: SET_CURRENT_USER,
        payload: {
          isAuthenticated: true,
          user: {
            email: user.email,
            name: 'Demo User'
          }
        }
      });
    } catch (error) {
      Alert.alert("Error", "Login failed. Please try again.");
    }
  } else {
    Alert.alert("Error", "Please provide your credentials");
  }
};

export const logoutUser = (dispatch) => {
  AsyncStorage.removeItem("userToken");
  AsyncStorage.removeItem("userData");
  dispatch({
    type: SET_CURRENT_USER,
    payload: {
      isAuthenticated: false,
      user: {}
    }
  });
};