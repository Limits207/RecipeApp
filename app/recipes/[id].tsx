
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../../constants/types';

const styles = StyleSheet.create({
  slideshowWrap: {
    width: '100%',
    aspectRatio: 1.2,
    backgroundColor: '#e0d7c6',
    position: 'relative',
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slideshowImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    backgroundColor: '#e6e3de',
  },
  arrowBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 24,
    padding: 2,
  },
  slideIndicator: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 12,
  },
  slideIndicatorText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1.2,
    backgroundColor: '#e0d7c6',
    position: 'relative',
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
  }
});

export default function RecipeDetail() {
  type ArrowProps = {
    direction: 'left' | 'right';
    onPress: () => void;
    disabled?: boolean;
  };
  const Arrow = ({ direction, onPress, disabled }: ArrowProps) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.arrowBtn, direction === 'left' ? { left: 12 } : { right: 12 }, disabled && { opacity: 0.3 }]}> 
      <Ionicons name={direction === 'left' ? 'chevron-back' : 'chevron-forward'} size={36} color="#fff" />
    </TouchableOpacity>
  );
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    axios.get(`${API_ENDPOINTS.recipes}/${id}`)
      .then(res => setRecipe(res.data))
      .catch(() => setError('Failed to load recipe'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { setSlideIdx(0); }, [recipe?.images]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#ffb347" />;
  if (error) return <Text style={{ color: '#e57373', margin: 20, fontSize: 16 }}>{error}</Text>;
  if (!recipe) return null;

  const images = Array.isArray(recipe.images) ? recipe.images : [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f4f4f7' }} contentContainerStyle={{ padding: 0 }}>
      <View style={styles.slideshowWrap}>
        {images.length > 0 ? (
          <>
            <Image
              source={{ uri: `http://192.168.50.210:8081${images[slideIdx]}` }}
              style={styles.slideshowImage}
              resizeMode="cover"
            />
            <Arrow direction="left" onPress={() => setSlideIdx(i => Math.max(0, i - 1))} disabled={slideIdx === 0} />
            <Arrow direction="right" onPress={() => setSlideIdx(i => Math.min(images.length - 1, i + 1))} disabled={slideIdx === images.length - 1} />
            <View style={styles.slideIndicator}>
              <Text style={styles.slideIndicatorText}>{slideIdx + 1} / {images.length}</Text>
            </View>
          </>
        ) : (
          <View style={styles.imageWrap}>
            <Text style={{ color: '#8d7754', fontStyle: 'italic', fontSize: 16, padding: 24 }}>No images uploaded.</Text>
          </View>
        )}
        <Ionicons name="arrow-back" size={32} color="#fff" style={styles.backIcon} onPress={() => router.back()} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.creator}>{typeof recipe.createdBy === 'object' && recipe.createdBy?.email ? `By ${recipe.createdBy.email}` : typeof recipe.createdBy === 'string' ? `By ${recipe.createdBy}` : ''}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={20} color="#8d7754" />
          <Text style={styles.metaText}>{recipe.cookTime ? `${recipe.cookTime} min` : 'N/A'}</Text>
        </View>
        {recipe.ethnicity ? (
          <Text style={[styles.metaText, { marginBottom: 8 }]}>Ethnicity: {recipe.ethnicity}</Text>
        ) : null}
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredients && typeof recipe.ingredients === 'string' && (recipe.ingredients as string).trim() ? (
          (recipe.ingredients as string).split(',').map((ing: string, i: number) => (
            <Text key={i} style={styles.ingredient}>• {ing.trim()}</Text>
          ))
        ) : (
          <Text style={styles.ingredient}>No ingredients listed.</Text>
        )}
        {/* Description section removed as requested */}
      </View>
    </ScrollView>
  );
}



