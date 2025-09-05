import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../AuthContext';

// TODO: Replace with your actual Google OAuth client ID
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

export default function SocialLogin() {
  const { setUser, setToken } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
      const result = await AuthSession.startAsync({
        authUrl:
          `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${GOOGLE_CLIENT_ID}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=token` +
          `&scope=profile%20email`,
      });
      if (result.type === 'success') {
        // You would send result.params.access_token to your backend for verification and user creation/login
        Alert.alert('Google login success', JSON.stringify(result.params));
        // setUser(...), setToken(...)
      }
    } catch (err) {
      Alert.alert('Google login error', err?.message || String(err));
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // You would send credential.identityToken to your backend for verification and user creation/login
      Alert.alert('Apple login success', JSON.stringify(credential));
      // setUser(...), setToken(...)
    } catch (err) {
      if (err.code !== 'ERR_CANCELED') {
        Alert.alert('Apple login error', err?.message || String(err));
      }
    }
  };

  return (
    <View style={styles.socialRow}>
      <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleLogin}>
        <Text style={styles.socialText}>Continue with Google</Text>
      </TouchableOpacity>
      {Platform.OS === 'ios' && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={{ width: '100%', height: 44, marginTop: 12 }}
          onPress={handleAppleLogin}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  socialRow: { marginTop: 24 },
  socialBtn: {
    backgroundColor: '#fff',
    borderColor: '#4285F4',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  socialText: { color: '#4285F4', fontWeight: 'bold' },
});
