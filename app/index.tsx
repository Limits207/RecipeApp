import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
// Responsive: 2 columns for small, 3 for medium, 4 for large screens
const getNumColumns = () => {
  if (SCREEN_WIDTH < 500) return 2;
  if (SCREEN_WIDTH < 900) return 3;
  return 4;
};
const NUM_COLUMNS = getNumColumns();
const CARD_MARGIN = Math.max(8, Math.round(SCREEN_WIDTH * 0.025));
const CARD_WIDTH = (SCREEN_WIDTH - CARD_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

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
      <Text style={styles.mostRecentTitle}>Most Recent</Text>
      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredRecipes}
          keyExtractor={item => item._id}
          contentContainerStyle={{
            padding: CARD_MARGIN,
            paddingTop: 0,
          }}
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH, marginLeft: CARD_MARGIN / 2, marginRight: CARD_MARGIN / 2, marginBottom: CARD_MARGIN / 2, alignItems: 'center' }}>
              <View style={{ position: 'relative', width: '100%', height: '100%' }}>
                <TouchableOpacity
                  style={[styles.card, { width: '100%', aspectRatio: 1, padding: 0 }]}
                  onPress={() => router.push(`/recipes/${item._id}`)}
                  activeOpacity={0.92}
                >
                  <Image
                    source={{ uri: item.images?.[0] ? `http://192.168.50.210:8081${item.images[0]}` : undefined }}
                    style={styles.fullImage}
                    resizeMode="cover"
                  />
                  {/* Overlay text as a child of the image for mobile visibility */}
                  <View pointerEvents="none" style={[styles.infoOverlay, { zIndex: 10, backgroundColor: Platform.OS === 'web' ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.55)' }] }>
                    <Text style={styles.titleOverlay} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.creatorOverlay} numberOfLines={1}>
                      {item.createdBy?.email ? `By ${item.createdBy.email}` : item.createdBy ? `By ${item.createdBy}` : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.heartButton}
                  onPress={() => handleLike(item._id)}
                  disabled={!token || liked[item._id]}
                  activeOpacity={0.7}
                >
                  <View style={styles.heartShape}>
                    <Ionicons name="heart" size={28} color={liked[item._id] ? '#e57373' : '#fff'} style={{ zIndex: 2 }} />
                    <Text style={styles.heartCount}>{item.likes || 0}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
          numColumns={NUM_COLUMNS}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mostRecentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8d7754',
    marginLeft: 22,
    marginTop: 8,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
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
    display: 'none', // legacy, not used
  },
  fullImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 18,
    backgroundColor: '#e6e3de',
    zIndex: 1,
    aspectRatio: 1,
    boxShadow: Platform.OS === 'web' ? '0 2px 12px rgba(0,0,0,0.08)' : undefined,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  overlay: {
    display: 'none', // overlay no longer used
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 3,
    backgroundColor: 'transparent',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  heartShape: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(232, 76, 61, 0.85)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  heartIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heartCount: {
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 4,
    fontSize: 13,
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    zIndex: 4,
    textAlign: 'center',
    minWidth: 12,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    zIndex: 2,
    alignItems: 'center',
  },
  titleOverlay: {
    fontWeight: '700',
    fontSize: 15,
    color: '#fff',
    marginBottom: 2,
    letterSpacing: 0.12,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  creatorOverlay: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 0,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.85,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoBelow: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    minHeight: 48,
  },
  infoWrap: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    color: '#3e2723',
    marginBottom: 2,
    letterSpacing: 0.12,
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    fontSize: 13,
    color: '#8d7754',
    marginBottom: 6,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.85,
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
