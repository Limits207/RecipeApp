import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Ionicons } from '@expo/vector-icons';

const numColumns = 2;
const CARD_MARGIN = 14;
const CARD_WIDTH = (Dimensions.get('window').width - CARD_MARGIN * (numColumns + 1)) / numColumns;

export default function HomeScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState<{ [id: string]: boolean }>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('http://192.168.50.210:3000/recipes')
      .then(res => setRecipes(res.data))
      .catch((err: any) => setError('Failed to load recipes'))
      .finally(() => setLoading(false));
  }, []);

  const handleLike = async (id: string) => {
    if (!token) return; // Only allow likes if logged in
    if (liked[id]) return; // Only like once
    try {
      await axios.post(`http://192.168.50.210:3000/recipes/${id}/like`);
      setLiked(prev => ({ ...prev, [id]: true }));
    } catch {
      // Optionally show error
    }
  };

  const filteredRecipes = recipes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#ffb347" />;
  if (error) return <Text style={{ color: '#e57373', margin: 20, fontSize: 16 }}>{error}</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f4f7' }}>
      <View style={styles.header}>
        <Image source={require('../assets/images/icon.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>Cookbook</Text>
        <TouchableOpacity style={styles.profileIcon} onPress={() => router.push('/login')}>
          <Ionicons name="person-circle-outline" size={34} color="#8d7754" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search recipes..."
          placeholderTextColor="#a6a6a6"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filteredRecipes}
        keyExtractor={item => item._id}
        numColumns={numColumns}
        contentContainerStyle={{ padding: CARD_MARGIN, paddingTop: 0, minHeight: '100%' }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/recipes/${item._id}`)}
            activeOpacity={0.92}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.infoWrap}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <View style={styles.row}>
                <Text style={styles.likes}>{item.likes || 0} Likes</Text>
                <TouchableOpacity
                  style={[styles.likeBtn, liked[item._id] && styles.liked]}
                  onPress={() => handleLike(item._id)}
                  disabled={!token || liked[item._id]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="heart" size={20} color={liked[item._id] ? '#fff' : '#b8a88e'} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/upload')} activeOpacity={0.85}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 28 : 44,
    paddingBottom: 10,
    paddingHorizontal: 24,
    backgroundColor: '#f9f9fa', // soft background
    borderBottomWidth: 0,
    marginBottom: 6,
    shadowColor: '#b8a88e',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 2,
    justifyContent: 'flex-start',
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#f4f4f7',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5a4b3c', // muted brown
    letterSpacing: 0.7,
    fontFamily: Platform.OS === 'web' ? undefined : 'SpaceMono',
    flex: 1,
  },
  profileIcon: {
    marginLeft: 8,
    padding: 2,
  },
  searchWrap: {
    backgroundColor: '#f9f9fa',
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 0,
    marginBottom: 2,
  },
  search: {
    backgroundColor: '#f4f4f7',
    borderRadius: 14,
    padding: 12,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#d1cfc9',
    color: '#3e2723',
    shadowColor: '#b8a88e',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  card: {
    backgroundColor: 'rgba(249,249,250,0.95)',
    borderRadius: 24,
    margin: CARD_MARGIN,
    width: CARD_WIDTH,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 3 },
      default: {},
    }),
    borderWidth: 1,
    borderColor: '#d1cfc9',
    paddingBottom: 0,
    minHeight: 250,
    backdropFilter: Platform.OS === 'web' ? 'blur(8px)' : undefined,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#e6e3de',
  },
  infoWrap: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
    color: '#5a4b3c',
    marginBottom: 10,
    letterSpacing: 0.12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likes: {
    color: '#a6a6a6',
    fontSize: 16,
    fontWeight: '500',
  },
  likeBtn: {
    padding: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#b8a88e',
    backgroundColor: '#f4f4f7',
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  liked: {
    backgroundColor: '#b8a88e',
    borderColor: '#b8a88e',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#8d7754',
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#b8a88e',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
