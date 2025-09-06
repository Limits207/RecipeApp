import React, { useState } from 'react';
// Hide the default Expo Router header
export const unstable_screenOptions = { headerShown: false };
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, ScrollView, Dimensions } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [cookHours, setCookHours] = useState(0);
  const [cookMinutes, setCookMinutes] = useState(0);
  const [ethnicity, setEthnicity] = useState('');
  const ethnicities = [
    '', 'American', 'Chinese', 'French', 'Greek', 'Indian', 'Italian', 'Japanese', 'Korean', 'Mexican', 'Middle Eastern', 'Thai', 'Vietnamese', 'Mediterranean', 'Spanish', 'African', 'Caribbean', 'Latin American', 'Other'
  ];
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { token } = useAuth();

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled && result.assets) {
      // Append new images, avoid duplicates
      setImages(prev => {
        const newUris = result.assets.map(asset => asset.uri);
        return Array.from(new Set([...prev, ...newUris]));
      });
    }
  };

  const handleUpload = async () => {
    const cookTime = `${cookHours > 0 ? cookHours + ' hr ' : ''}${cookMinutes > 0 ? cookMinutes + ' min' : ''}`.trim();
    if (!title || !ingredients || (!cookHours && !cookMinutes) || !ethnicity || images.length === 0) {
      setError('Please provide a title, ingredients, cook time, ethnicity, and at least one image.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
    formData.append('title', title);
    formData.append('ingredients', ingredients);
    formData.append('cookTime', cookTime);
    formData.append('ethnicity', ethnicity);
      images.forEach((uri, idx) => {
        formData.append('images', {
          uri,
          name: `photo${idx + 1}.jpg`,
          type: 'image/jpeg',
        } as any);
      });
  const res = await axios.post(API_ENDPOINTS.recipes, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      setUploading(false);
      router.replace('/');
    } catch (err) {
      setUploading(false);
      setError('Upload failed.');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1, backgroundColor: '#f4f4f7' }]}> 
      {/* Custom Back Button at the top */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 54 : 32, paddingBottom: 8, paddingHorizontal: 4 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.08)', marginRight: 8 }}>
          <Ionicons name="arrow-back" size={28} color="#8d7754" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#8d7754' }}>Upload</Text>
      </View>
      <View style={{
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        marginTop: 8,
        marginBottom: 24,
        shadowColor: '#bfa16a',
        shadowOpacity: 0.10,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
        width: '100%',
        alignSelf: 'center',
        maxWidth: 480,
      }}>
        <Text style={[styles.title, { marginTop: 0, marginBottom: 18, textAlign: 'center' }]}>Add a New Recipe</Text>
        <TextInput
          style={[styles.input, { marginBottom: 16 }]}
          placeholder="Recipe Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { marginBottom: 16, minHeight: 96, textAlignVertical: 'top' }]}
          placeholder="Ingredients (comma separated)"
          value={ingredients}
          onChangeText={setIngredients}
          multiline
        />
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 4, color: '#8d7754', fontWeight: '600' }}>Ethnicity</Text>
          <View style={{ borderWidth: 1, borderColor: '#d1cfc9', borderRadius: 10, backgroundColor: '#f9f9fa', overflow: 'hidden', minHeight: 56, justifyContent: 'center' }}>
            <Picker
              selectedValue={ethnicity}
              onValueChange={setEthnicity}
              style={{ height: 56, width: '100%' }}
              itemStyle={{ fontSize: 18, minWidth: 200, paddingHorizontal: 8, height: 56 }}
              mode="dropdown"
            >
              {ethnicities.map(e => (
                <Picker.Item key={e} label={e === '' ? 'Select ethnicity...' : e} value={e} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ marginBottom: 4, color: '#8d7754', fontWeight: '600' }}>Hours</Text>
            <View style={{ borderWidth: 1, borderColor: '#d1cfc9', borderRadius: 10, backgroundColor: '#f9f9fa', overflow: 'hidden', minHeight: 56, justifyContent: 'center' }}>
              <Picker
                selectedValue={cookHours}
                onValueChange={setCookHours}
                style={{ height: 56, width: '100%' }}
                itemStyle={{ fontSize: 18, minWidth: 80, paddingHorizontal: 8, height: 56 }}
                mode="dropdown"
              >
                {[...Array(13).keys()].map(h => (
                  <Picker.Item key={h} label={h.toString()} value={h} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ marginBottom: 4, color: '#8d7754', fontWeight: '600' }}>Minutes</Text>
            <View style={{ borderWidth: 1, borderColor: '#d1cfc9', borderRadius: 10, backgroundColor: '#f9f9fa', overflow: 'hidden', minHeight: 56, justifyContent: 'center' }}>
              <Picker
                selectedValue={cookMinutes}
                onValueChange={setCookMinutes}
                style={{ height: 56, width: '100%' }}
                itemStyle={{ fontSize: 18, minWidth: 80, paddingHorizontal: 8, height: 56 }}
                mode="dropdown"
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                  <Picker.Item key={m} label={m.toString()} value={m} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'center', width: '100%', marginBottom: 10 }}>
          <TouchableOpacity style={[styles.pickImagesBtn, { minWidth: 160, borderRadius: 12, backgroundColor: '#e7e2d9', shadowColor: '#bfa16a', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }]} onPress={pickImages}>
            <Text style={[styles.pickImagesText, { fontSize: 17 }]}>Pick images</Text>
          </TouchableOpacity>
        </View>
        {images.length > 0 && (
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            width: '100%',
            marginBottom: 18,
          }}>
            {images.map((uri, idx) => (
              <View
                key={idx}
                style={{
                  width: '30%',
                  aspectRatio: 1,
                  minHeight: 90,
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  marginBottom: 12,
                  marginRight: (idx + 1) % 3 === 0 ? 0 : '5%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 3,
                  elevation: 2,
                  position: 'relative',
                }}
              >
                <Image source={{ uri }} style={styles.squareThumb} />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => setImages(images.filter((_, i) => i !== idx))}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.removeBtnText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={{
            backgroundColor: uploading ? '#bfa16a' : '#2196f3',
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            marginTop: 8,
            shadowColor: '#2196f3',
            shadowOpacity: 0.12,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
          onPress={handleUpload}
          disabled={uploading}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }}>{uploading ? 'Uploading...' : 'UPLOAD'}</Text>
        </TouchableOpacity>
        {uploading && <ActivityIndicator style={{ marginTop: 16 }} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1 removed to allow ScrollView to scroll naturally
    padding: 24,
    backgroundColor: '#f4f4f7', // soft off-white/gray
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#5a4b3c', // muted brown
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1cfc9', // soft border
    marginBottom: 18,
    fontSize: 18,
    backgroundColor: '#f9f9fa', // very light gray
    color: '#3e2723',
  },
  pickImagesBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#e7e2d9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    // alignSelf removed to allow centering
  },
  pickImagesText: {
    color: '#8d7754',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageList: {
    width: '100%',
    marginBottom: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  squareItemWrap: {
    // 24px padding on each side, 2 * 12px gap between 3 columns
    width: (Dimensions.get('window').width - 48 - 24) / 3,
    aspectRatio: 1,
    minHeight: 110,
    flexShrink: 0,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
  marginRight: 12,
  // Remove right margin for last item in row
  // This will be handled inline in the render
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  squareThumb: {
    width: 96,
    height: 96,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbWrap: {
    position: 'relative',
    width: 64,
    height: 64,
    marginRight: 8,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#b8a88e',
    backgroundColor: '#f9f9fa',
  },
  thumb: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  imageText: {
    color: '#a6a6a6', // softer gray
    fontSize: 16,
  },
  error: {
    color: '#b85c5c', // muted red
    marginBottom: 12,
    fontSize: 16,
  },
});
