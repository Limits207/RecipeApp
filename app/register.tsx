import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';
import SocialLogin from './SocialLogin';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    setSubmitting(true);
    try {
  await axios.post(API_ENDPOINTS.register, { email, password });
      Alert.alert('Success', 'Account created! Please log in.');
      router.replace('/login');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || '';
      if (errorMsg.toLowerCase().includes('email') && errorMsg.toLowerCase().includes('already')) {
        Alert.alert('Account exists', 'An account with that email already exists.');
      } else {
        Alert.alert('Registration failed', errorMsg || 'Unknown error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/login')} style={{ marginTop: 16 }}>
        <Text style={{ color: '#ff7f50' }}>Already have an account? Login</Text>
      </TouchableOpacity>
      <SocialLogin />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f4f4f7' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: '#5a4b3c', alignSelf: 'center' },
  input: { borderWidth: 1, borderColor: '#d1cfc9', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#f9f9fa', color: '#3e2723' },
  button: { backgroundColor: '#8d7754', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
