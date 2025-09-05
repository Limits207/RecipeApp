import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useAuth } from '../AuthContext';

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [cookTime, setCookTime] = useState('');
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
      setImages(result.assets.map(asset => asset.uri));
    }
  };

  const handleUpload = async () => {
    if (!title || !ingredients || !cookTime || images.length === 0) {
      setError('Please provide a title, ingredients, cook time, and at least one image.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('ingredients', ingredients);
      formData.append('cookTime', cookTime);
      images.forEach((uri, idx) => {
        formData.append('images', {
          uri,
          name: `photo${idx + 1}.jpg`,
          type: 'image/jpeg',
        } as any);
      });
  const res = await axios.post('http://192.168.50.210:8081/recipes', formData, {
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add a New Recipe</Text>
      <TextInput
        style={styles.input}
        placeholder="Recipe Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Ingredients (comma separated)"
        value={ingredients}
        onChangeText={setIngredients}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Cook Time (e.g. 30 min)"
        value={cookTime}
        onChangeText={setCookTime}
      />
      <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
        {images.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
            {images.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.image} />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.imageText}>Pick images</Text>
        )}
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={uploading ? 'Uploading...' : 'Upload'} onPress={handleUpload} disabled={uploading} />
      {uploading && <ActivityIndicator style={{ marginTop: 16 }} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f4f4f7', // soft off-white/gray
    alignItems: 'center',
    justifyContent: 'center',
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
  imagePicker: {
    width: 180,
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#b8a88e', // muted accent
    backgroundColor: '#f9f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
