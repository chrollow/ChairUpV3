import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const SET_CURRENT_USER = "SET_CURRENT_USER";

export const loginUser = async (user, dispatch) => {
  if (user.email && user.password) {
    try {
      // Get the registered users from storage
      const usersJson = await AsyncStorage.getItem('registeredUsers');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // Find the user by email
      const foundUser = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
      
      if (foundUser && foundUser.password === user.password) {
        // Valid credentials - store token and user data
        await AsyncStorage.setItem('userToken', 'auth-token-' + foundUser.email);
        await AsyncStorage.setItem('userData', JSON.stringify({
          email: foundUser.email,
          name: foundUser.name,
          phone: foundUser.phone,
          profileImage: foundUser.profileImage
        }));
        
        // Update context
        dispatch({
          type: SET_CURRENT_USER,
          payload: {
            isAuthenticated: true,
            user: {
              email: foundUser.email,
              name: foundUser.name
            }
          }
        });
        
        return true;
      } else {
        Alert.alert("Error", "Invalid email or password");
        return false;
      }
    } catch (error) {
      Alert.alert("Error", "Login failed. Please try again.");
      return false;
    }
  } else {
    Alert.alert("Error", "Please provide your credentials");
    return false;
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