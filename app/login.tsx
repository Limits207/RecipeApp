import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import SocialLogin from './SocialLogin';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setToken, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setSubmitting(true);
    try {
      const res = await axios.post('http://192.168.50.210:3000/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Login failed', err?.response?.data?.message || 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={submitting || loading}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/register')} style={{ marginTop: 16 }}>
        <Text style={{ color: '#ff7f50' }}>Don't have an account? Register</Text>
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
