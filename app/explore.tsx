
import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';
import { Recipe } from '../constants/types';

import { StyleProp, TextStyle } from 'react-native';

const SECTION_STYLES: { header: StyleProp<TextStyle>; updated: StyleProp<TextStyle> } = {
  header: { fontSize: 18, fontWeight: '700', color: '#444', marginLeft: 16, marginBottom: 8, marginTop: 18 },
  updated: { fontSize: 12, color: '#888', marginLeft: 8 },
};

type SectionProps = {
  title: string;
  data: any[];
  updated?: string;
  onLike: (id: string) => void;
  onUnlike: (id: string) => void;
  likedIds: string[];
};

function Section({ title, data, updated, onLike, onUnlike, likedIds }: SectionProps) {
  const router = useRouter();
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
        <Text style={SECTION_STYLES.header}>{title}</Text>
        {updated && <Text style={SECTION_STYLES.updated}>Updated {updated}</Text>}
      </View>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item._id || item.title}-${index}`}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item, index }) => (
          <View style={{ marginRight: 12 }}>
            <TouchableOpacity style={styles.card} onPress={() => item._id ? router.push(`/recipes/${item._id}`) : null}>
              <Image source={{ uri: item.images?.[0] ? `http://192.168.50.210:8081${item.images[0]}` : item.image }} style={styles.cardImage} />
              <View style={styles.cardOverlay}>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
            </TouchableOpacity>
            {typeof item.likes !== 'undefined' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, marginLeft: 4 }}>
                <TouchableOpacity
                  onPress={() => likedIds?.includes(item._id) ? onUnlike(item._id) : onLike(item._id)}
                  style={{ marginRight: 4 }}
                >
                  <Text style={{ fontSize: 18 }}>
                    {likedIds?.includes(item._id) ? '❤️' : '🤍'}
                  </Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 14, color: '#bfa16a', fontWeight: 'bold' }}>{item.likes || 0}</Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

export default function ExploreScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const { user, token } = useAuth();

  // Like/unlike handler using backend API, toggles like state
  const handleLike = async (id: string) => {
    if (!token) return;
    try {
      if (!likedIds.includes(id)) {
        // Like the recipe
        const res = await axios.post(`${API_ENDPOINTS.recipes}/${id}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipes(prev => prev.map(r => r._id === id ? { ...r, likes: (res.data.likes ?? (r.likes || 0) + 1) } : r));
        setLikedIds(prev => [...prev, id]);
      } else {
        // Unlike the recipe
        const res = await axios.post(`${API_ENDPOINTS.recipes}/${id}/unlike`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipes(prev => prev.map(r => r._id === id ? { ...r, likes: (res.data.likes ?? Math.max(0, (r.likes || 1) - 1)) } : r));
        setLikedIds(prev => prev.filter(lid => lid !== id));
      }
    } catch (err) {
      // Optionally handle error (e.g., already liked/unliked, network error)
    }
  };

  const handleUnlike = (id: string) => handleLike(id);


  // Group by most common ingredients
  const ingredientMap: { [ingredient: string]: Recipe[] } = {};
  recipes.forEach(recipe => {
    let ingredients: string[] = [];
    if (Array.isArray(recipe.ingredients)) {
      ingredients = recipe.ingredients;
    } else if (typeof recipe.ingredients === 'string') {
      ingredients = recipe.ingredients.split(',').map(i => i.trim());
    }
    ingredients.forEach(ing => {
      if (!ingredientMap[ing]) ingredientMap[ing] = [];
      ingredientMap[ing].push(recipe);
    });
  });
  // Sort ingredients by frequency
  const sortedIngredients = Object.keys(ingredientMap).sort((a, b) => ingredientMap[b].length - ingredientMap[a].length);
  const popularIngredients = sortedIngredients.slice(0, 8).map(ing => {
    // Pick the first recipe with this ingredient for image/title
    const recipe = ingredientMap[ing][0];
    return {
      title: ing,
      image: recipe.images?.[0] ? `http://192.168.50.210:8081${recipe.images[0]}` : undefined,
      _id: recipe._id,
    };
  });

  // Popular Dishes: most liked recipes
  const popularDishes = [...recipes].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 8);

  // Ethnicity groupings
  const ethnicityMap: { [ethnicity: string]: Recipe[] } = {};
  recipes.forEach(recipe => {
    if (recipe.ethnicity) {
      if (!ethnicityMap[recipe.ethnicity]) ethnicityMap[recipe.ethnicity] = [];
      ethnicityMap[recipe.ethnicity].push(recipe);
    }
  });
  const sortedEthnicities = Object.keys(ethnicityMap).sort((a, b) => ethnicityMap[b].length - ethnicityMap[a].length);
  const ethnicitySection = sortedEthnicities.slice(0, 8).map(e => {
    const recipe = ethnicityMap[e][0];
    return {
      title: e,
      image: recipe.images?.[0] ? `http://192.168.50.210:8081${recipe.images[0]}` : undefined,
      _id: recipe._id,
    };
  });

  // Trending Keywords: use ethnicity as a proxy for now (or use tags if available)
  const trendingKeywords = ethnicitySection;

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(API_ENDPOINTS.recipes);
        setRecipes(res.data);
        // If user is logged in, set likedIds from user.likedRecipes
        if (user && user.likedRecipes) {
          setLikedIds(user.likedRecipes.map((r: any) => (typeof r === 'string' ? r : r._id)));
        } else {
          setLikedIds([]);
        }
      } catch (err: any) {
        setError('Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [user]);

  if (loading) {
    return <ActivityIndicator size="large" color="#bfa16a" style={{ marginTop: 40 }} />;
  }
  if (error) {
    return <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</Text>;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ height: 36 }} />
      <Section title="Popular Dishes" data={popularDishes} updated="6:04 AM" onLike={handleLike} onUnlike={handleUnlike} likedIds={likedIds} />
      <Section title="Trending Keywords" data={trendingKeywords} updated="4:05 PM" onLike={handleLike} onUnlike={handleUnlike} likedIds={likedIds} />
      <Section title="Ethnicity" data={ethnicitySection} updated="4:10 PM" onLike={handleLike} onUnlike={handleUnlike} likedIds={likedIds} />
      <Section title="Popular Ingredients" data={popularIngredients} updated="6:05 AM" onLike={handleLike} onUnlike={handleUnlike} likedIds={likedIds} />
      {/* Add more sections as needed */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 90,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#eee',
    overflow: 'hidden',
    marginBottom: 4,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
      : { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }),
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    ...(Platform.OS === 'web'
      ? { textShadow: '0 1px 2px rgba(0,0,0,0.18)' }
      : { textShadowColor: 'rgba(0,0,0,0.18)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }),
  },
});
