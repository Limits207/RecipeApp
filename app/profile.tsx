
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../AuthContext';


export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#8d7754" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
      </View>
      {user ? (
        <>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/settings' as any)}>
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>Log Out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.value}>No user info available.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f4f4f7',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    marginTop: 24,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5a4b3c',
  },
  label: {
    fontSize: 18,
    color: '#8d7754',
    fontWeight: '600',
    marginTop: 12,
  },
  value: {
    fontSize: 18,
    color: '#3e2723',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#bfa16a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#b85c5c',
    marginTop: 10,
  },
});
