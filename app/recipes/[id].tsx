import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

type Recipe = {
  _id: string;
  title: string;
  images: string[];
  createdBy?: { email?: string } | string;
  cookTime?: number;
  ingredients?: string[];
  description?: string;
};

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    axios.get(`http://192.168.50.210:8081/recipes/${id}`)
      .then(res => setRecipe(res.data))
      .catch(() => setError('Failed to load recipe'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#ffb347" />;
  if (error) return <Text style={{ color: '#e57373', margin: 20, fontSize: 16 }}>{error}</Text>;
  if (!recipe) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f4f4f7' }} contentContainerStyle={{ padding: 0 }}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: recipe.images?.[0] ? `http://192.168.50.210:8081${recipe.images[0]}` : undefined }}
          style={styles.image}
          resizeMode="cover"
        />
        <Ionicons name="arrow-back" size={32} color="#fff" style={styles.backIcon} onPress={() => router.back()} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.creator}>{typeof recipe.createdBy === 'object' && recipe.createdBy?.email ? `By ${recipe.createdBy.email}` : typeof recipe.createdBy === 'string' ? `By ${recipe.createdBy}` : ''}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={20} color="#8d7754" />
          <Text style={styles.metaText}>{recipe.cookTime ? `${recipe.cookTime} min` : 'N/A'}</Text>
        </View>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
          recipe.ingredients.map((ing, i) => (
            <Text key={i} style={styles.ingredient}>• {ing}</Text>
          ))
        ) : (
          <Text style={styles.ingredient}>No ingredients listed.</Text>
        )}
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{recipe.description || 'No description provided.'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  imageWrap: {
    width: '100%',
    aspectRatio: 1.2,
    backgroundColor: '#e0d7c6',
    position: 'relative',
    marginBottom: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backIcon: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 24 : 44,
    left: 18,
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderRadius: 20,
    padding: 4,
    zIndex: 10,
  },
  content: {
    padding: 24,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    minHeight: 300,
    shadowColor: '#b8a88e',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5a4b3c',
    marginBottom: 4,
  },
  creator: {
    fontSize: 15,
    color: '#8d7754',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  metaText: {
    fontSize: 15,
    color: '#8d7754',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#8d7754',
    marginTop: 18,
    marginBottom: 6,
  },
  ingredient: {
    fontSize: 16,
    color: '#3e2723',
    marginBottom: 4,
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#3e2723',
    marginTop: 8,
    lineHeight: 22,
  },
});
