// screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Button, 
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import FormContainer from './Shared/FormContainer';
import Input from './Shared/Input';
import GoogleLogin from './Shared/GoogleLogin';
import { AuthContext } from '../Context/Store/AuthGlobal';
import { loginUser } from '../Context/Actions/Auth.actions';

const LoginScreen = ({ navigation }) => {
  const { dispatch } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const user = {
      email,
      password,
    };

    if (email === "" || password === "") {
      setError("Please fill in your credentials");
    } else {
      // Remove the error message if previously shown
      setError("");
      
      // loginUser now returns a boolean success value
      const success = await loginUser(user, dispatch);
      
      if (!success) {
        setError("Invalid credentials");
      }
      // No need to navigate - App.js will handle the navigation based on authentication state
    }
  };

  const handleGoogleLoginSuccess = (userData) => {
    dispatch({
      type: 'SET_CURRENT_USER',
      payload: {
        isAuthenticated: true,
        user: userData
      }
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/chair-logo.png')} 
          style={styles.logo}
        />
        <Text style={styles.title}>ChairUp</Text>
        <Text style={styles.subtitle}>Premium Chair Marketplace</Text>
      </View>
      <FormContainer>
        <Input
          placeholder="Email"
          name="email"
          id="email"
          value={email}
          onChangeText={(text) => setEmail(text.toLowerCase())}
        />
        <Input
          placeholder="Password"
          name="password"
          id="password"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
        <View style={styles.buttonGroup}>
          <Button 
            title="Login" 
            onPress={() => handleSubmit()} 
            color="#4a6da7" 
          />
        </View>
        
        <View style={styles.orContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.divider} />
        </View>
        
        <GoogleLogin onLoginSuccess={handleGoogleLoginSuccess} />
        
        <View style={styles.registerContainer}>
          <Text style={styles.middleText}>Don't have an account yet? </Text>
          <Button 
            title="Register" 
            onPress={() => navigation.navigate("Register")}
            color="#4a6da7" 
          />
        </View>
      </FormContainer>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  buttonGroup: {
    marginBottom: 10,
    width: '80%',
  },
  registerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  middleText: {
    marginBottom: 10,
    alignSelf: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    width: '80%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    paddingHorizontal: 10,
    color: '#666',
  }
});

export default LoginScreen;