import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Ionicons } from '@expo/vector-icons';

const CARD_MARGIN = 14;
const CARD_MAX_WIDTH = 150;

export default function HomeScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState<{ [id: string]: boolean }>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('http://192.168.50.210:8081/recipes')
      .then(res => {
        // Sort recipes by most recent (assuming MongoDB _id timestamp order)
        const sorted = [...res.data].reverse();
        setRecipes(sorted);
      })
      .catch((err: any) => setError('Failed to load recipes'))
      .finally(() => setLoading(false));
  }, []);

  const handleLike = async (id: string) => {
    if (!token) return; // Only allow likes if logged in
    if (liked[id]) return; // Only like once
    try {
  await axios.post(`http://192.168.50.210:8081/recipes/${id}/like`);
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
        <TouchableOpacity style={styles.menuIcon} onPress={() => {/* TODO: open menu */}}>
          <Ionicons name="menu" size={38} color="#8d7754" />
        </TouchableOpacity>
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
        contentContainerStyle={{
          padding: CARD_MARGIN,
          paddingTop: 0,
          minHeight: '100%',
          flexGrow: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center', // Center cards horizontally
        }}
        renderItem={({ item }) => (
          <View style={{ width: CARD_MAX_WIDTH, margin: CARD_MARGIN / 2, alignItems: 'center' }}>
            <TouchableOpacity
              style={[styles.card, { width: '100%', maxWidth: CARD_MAX_WIDTH, aspectRatio: 1 }]}
              onPress={() => router.push({ pathname: '/recipes/[id]', params: { id: item._id } })}
              activeOpacity={0.92}
            >
              <Image source={{ uri: item.images?.[0] ? `http://192.168.50.210:8081${item.images[0]}` : undefined }} style={[styles.image, { aspectRatio: 1 }]} />
              <View style={styles.infoWrap}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.creator} numberOfLines={1}>
                  {item.createdBy?.email ? `By ${item.createdBy.email}` : item.createdBy ? `By ${item.createdBy}` : ''}
                </Text>
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
          </View>
        )}
        numColumns={undefined}
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
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#f4f4f7',
    alignItems: 'center',
    justifyContent: 'center',
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
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 3 },
      default: {},
    }),
    borderWidth: 1,
    borderColor: '#d1cfc9',
    paddingBottom: 0,
    minHeight: 0,
    aspectRatio: 1,
    backdropFilter: Platform.OS === 'web' ? 'blur(8px)' : undefined,
  },
  image: {
    width: '100%',
    height: undefined,
    flex: 1,
    resizeMode: 'cover',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#e6e3de',
    aspectRatio: 1,
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
  creator: {
    fontSize: 14,
    color: '#a6a6a6',
    marginBottom: 4,
    fontStyle: 'italic',
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
