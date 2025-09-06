// Central API config for the app

import { Platform } from 'react-native';


// Always use LAN IP for development to support Expo Go
export const API_BASE_URL = 'http://192.168.50.210:8081';

export const API_ENDPOINTS = {
  recipes: `${API_BASE_URL}/recipes`,
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  me: `${API_BASE_URL}/auth/me`,
};
