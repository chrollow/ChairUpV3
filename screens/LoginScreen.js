import React, { useState, useContext, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Button,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import FormContainer from './Shared/FormContainer';
import Input from './Shared/Input';
import { AuthContext } from '../Context/Store/AuthGlobal';
import { loginUser } from '../Context/Actions/Auth.actions';

const LoginScreen = ({ navigation }) => {
  const context = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const user = {
      email,
      password,
    };

    if (email === "" || password === "") {
      setError("Please fill in your credentials");
    } else {
      loginUser(user, context.dispatch);
    }
  };

  useEffect(() => {
    if (context.stateUser.isAuthenticated === true) {
      navigation.navigate("Home");
    }
  }, [context.stateUser.isAuthenticated]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/chair-logo.png')} 
          style={styles.logo}
          // If you don't have the image yet, uncomment this line:
          // style={[styles.logo, {backgroundColor: '#ddd'}]}
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
    width: '80%',
    marginVertical: 10,
  },
  registerContainer: {
    width: '80%',
    marginTop: 20,
  },
  middleText: {
    marginBottom: 10,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  }
});

export default LoginScreen;