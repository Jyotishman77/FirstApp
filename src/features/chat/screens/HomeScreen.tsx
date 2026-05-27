import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { supabase } from '../../../config/supabase';
import { JoinConfirmationModal } from './JoinConfirmationModal';

interface Room {
  id: string;
  title: string;
  category: string;
  country: string;
  flag: string;
  members: number;
  popularity: number;
  lang: string;
  isTimed: boolean;
  timeLimit?: number;
  desc: string;
  rules?: string[];
}

interface HomeScreenProps {
  userProfile: {
    username: string;
    avatar: string;
    language: string;
  } | null;
  onJoinSuccess: (roomId: string, sessionExpiry: string) => void;
  onLogout: () => void;
  onEditProfile: () => void;
}

export const MOCK_ROOMS: Room[] = [
  { id: '1', title: 'India Global Chat', category: 'country', country: 'IN', flag: '🇮🇳', members: 1421, popularity: 98, lang: 'Hindi/English', isTimed: false, desc: 'Official hub for India and global NRI connections. Discuss culture, tech, and meet people.' },
  { id: '2', title: 'USA Community', category: 'country', country: 'US', flag: '🇺🇸', members: 890, popularity: 85, lang: 'English', isTimed: false, desc: 'Connect with community members from East Coast to West Coast.' },
  { id: '3', title: 'Japan Anime Group', category: 'anime', country: 'JP', flag: '🇯🇵', members: 2310, popularity: 99, lang: 'Japanese/Multilingual', isTimed: false, desc: 'Anime, Manga, J-Pop and Japanese culture discussion. Everyone welcome!' },
  { id: '4', title: 'UK Students Room', category: 'country', country: 'GB', flag: '🇬🇧', members: 420, popularity: 72, lang: 'English', isTimed: false, desc: 'Space for university students across London, Manchester, and Edinburgh.' },
  { id: '5', title: 'Global Developers Hub', category: 'tech', country: 'ALL', flag: '💻', members: 3105, popularity: 97, lang: 'English (Translating)', isTimed: false, desc: 'Share code, talk architecture, and pair-program with devs worldwide.' },
  { id: '6', title: 'International Gaming Chat', category: 'gaming', country: 'ALL', flag: '🎮', members: 1820, popularity: 90, lang: 'English/Japanese', isTimed: false, desc: 'LFG, tournaments, and discussion about console, PC, and mobile gaming.' },
  { id: '7', title: 'Design Sprint (Timed)', category: 'tech', country: 'ALL', flag: '⚡', members: 5, popularity: 40, lang: 'English', isTimed: true, timeLimit: 120, desc: 'Private 2-minute design discussion. Message logs will expire and self-destruct.' },
  { id: '8', title: 'Fast Expiry Test (Timed)', category: 'global', country: 'ALL', flag: '⏳', members: 2, popularity: 15, lang: 'English', isTimed: true, timeLimit: 10, desc: '10-second fast-expiry sandbox room.' },
];

export function HomeScreen({ userProfile, onJoinSuccess, onLogout, onEditProfile }: HomeScreenProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tokenCode, setTokenCode] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Modal State
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const colors = Colors.dark;

  const handleJoinViaToken = async () => {
    if (!tokenCode.trim()) {
      setTokenError('Enter a valid token');
      return;
    }
    setTokenError(null);
    setTokenLoading(true);

    try {
      // Direct demo tokens shortcut
      if (tokenCode.toUpperCase().trim() === 'DEMO-2MIN') {
        const expiry = new Date(Date.now() + 120 * 1000).toISOString();
        onJoinSuccess('7', expiry);
        return;
      }
      if (tokenCode.toUpperCase().trim() === 'DEMO-10SEC') {
        const expiry = new Date(Date.now() + 10 * 1000).toISOString();
        onJoinSuccess('8', expiry);
        return;
      }

      const { data: sessionId, error: rpcError } = await supabase.rpc('join_room_via_token', {
        p_token_code: tokenCode.trim(),
      });

      if (rpcError) throw rpcError;
      if (!sessionId) throw new Error('Token fully claimed or invalid');

      const { data: sessionData, error: fetchError } = await supabase
        .from('sessions')
        .select('room_id, expires_at')
        .eq('id', sessionId)
        .single();

      if (fetchError || !sessionData) throw new Error('Failed to retrieve session metrics');
      onJoinSuccess(sessionData.room_id, sessionData.expires_at);
    } catch (err: any) {
      setTokenError(err.message || 'Validation failed');
    } finally {
      setTokenLoading(false);
    }
  };

  const handleConfirmJoinRoom = () => {
    if (!selectedRoom) return;
    const expiry = selectedRoom.isTimed
      ? new Date(Date.now() + (selectedRoom.timeLimit || 120) * 1000).toISOString()
      : new Date(Date.now() + 3600 * 24 * 365 * 1000).toISOString(); // 1 year for persistent public chats

    const roomId = selectedRoom.id;
    setSelectedRoom(null);
    onJoinSuccess(roomId, expiry);
  };

  // Filter Rooms
  const filteredRooms = MOCK_ROOMS.filter((room) => {
    const matchesSearch =
      room.title.toLowerCase().includes(search.toLowerCase()) ||
      room.desc.toLowerCase().includes(search.toLowerCase()) ||
      room.lang.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'global' && room.country === 'ALL') ||
      (selectedCategory === 'country' && room.country === 'IN') || // Mock user country matching
      room.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const trendingRooms = MOCK_ROOMS.filter((r) => r.popularity >= 85).slice(0, 4);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>GLOBECHAT</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onEditProfile} style={[styles.avatarBtn, { borderColor: colors.divider, backgroundColor: colors.bgSecondary }]}>
            <Text style={{ fontSize: 18 }}>{userProfile?.avatar || '🦊'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600' }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Token Access Input */}
        <View style={[styles.tokenCard, { borderColor: colors.divider, backgroundColor: colors.bgSecondary }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 4 }]}>Enter Timed Access Token</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 12 }}>
            Claim a strict single-use private chat passcode
          </Text>
          {tokenError && <Text style={{ color: colors.accentWarn, fontSize: 13, marginBottom: 8 }}>{tokenError}</Text>}
          <View style={styles.tokenRow}>
            <TextInput
              style={[styles.tokenInput, { borderColor: colors.divider, color: colors.textPrimary, backgroundColor: colors.bgPrimary }]}
              placeholder="DEMO-2MIN or DEMO-10SEC"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              value={tokenCode}
              onChangeText={setTokenCode}
            />
            <TouchableOpacity
              style={[styles.tokenBtn, { backgroundColor: colors.bubbleUser }]}
              onPress={handleJoinViaToken}
              disabled={tokenLoading}
            >
              <Text style={{ color: colors.textUser, fontWeight: '700', fontSize: 13 }}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.bgSecondary, borderColor: colors.divider, color: colors.textPrimary }]}
            placeholder="Search communities, language, tags..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Categories chips */}
        <View style={{ marginBottom: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {[
              { id: 'all', name: 'All Rooms' },
              { id: 'global', name: '🌍 Global' },
              { id: 'country', name: '🇮🇳 India' },
              { id: 'gaming', name: '🎮 Gaming' },
              { id: 'anime', name: '🎌 Anime & Pop' },
              { id: 'tech', name: '💻 Developers' },
            ].map((chip) => {
              const isActive = selectedCategory === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isActive ? colors.textPrimary : colors.bgSecondary,
                      borderColor: colors.divider,
                    },
                  ]}
                  onPress={() => setSelectedCategory(chip.id)}
                >
                  <Text style={[styles.chipText, { color: isActive ? colors.bgPrimary : colors.textMuted }]}>
                    {chip.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Trending Section */}
        {search.length === 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginHorizontal: 16 }]}>
              Trending Communities
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
              {trendingRooms.map((room) => (
                <TouchableOpacity
                  key={`trend-${room.id}`}
                  style={[styles.trendingCard, { borderColor: colors.divider, backgroundColor: colors.bgSecondary }]}
                  onPress={() => setSelectedRoom(room)}
                >
                  <Text style={styles.trendFlag}>{room.flag}</Text>
                  <Text style={[styles.trendTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                    {room.title}
                  </Text>
                  <View style={styles.memberIndicator}>
                    <View style={styles.pulseDot} />
                    <Text style={{ color: colors.accentActive, fontSize: 11, fontWeight: '600' }}>
                      {room.members} online
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Room Discover List */}
        <View style={[styles.section, { marginTop: 10 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginHorizontal: 16, marginBottom: 12 }]}>
            Discover Communities
          </Text>
          <View style={{ paddingHorizontal: 16 }}>
            {filteredRooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={[styles.roomCard, { borderColor: colors.divider, backgroundColor: colors.bgSecondary }]}
                onPress={() => setSelectedRoom(room)}
              >
                <View style={[styles.roomFlagBox, { backgroundColor: colors.bgPrimary }]}>
                  <Text style={{ fontSize: 24 }}>{room.flag}</Text>
                </View>
                <View style={styles.roomContent}>
                  <View style={styles.roomHeaderRow}>
                    <Text style={[styles.roomTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {room.title}
                    </Text>
                    <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '700' }}>
                      🔥 {room.popularity}
                    </Text>
                  </View>
                  <Text style={[styles.roomDesc, { color: colors.textMuted }]} numberOfLines={1}>
                    {room.desc}
                  </Text>
                  <View style={styles.badgeRow}>
                    <Text style={[styles.badge, { backgroundColor: colors.bgPrimary, color: colors.bubbleUser }]}>
                      {room.lang}
                    </Text>
                    {room.isTimed && (
                      <Text style={[styles.badge, { backgroundColor: 'rgba(239,68,68,0.1)', color: colors.accentWarn }]}>
                        ⏳ Timed
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.roomRight}>
                  <View style={styles.pulseDot} />
                  <Text style={{ color: colors.accentActive, fontSize: 11, fontWeight: '700' }}>{room.members}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Confirmation Bottom Sheet */}
      {selectedRoom && (
        <JoinConfirmationModal
          visible={!!selectedRoom}
          roomTitle={selectedRoom.title}
          flag={selectedRoom.flag}
          desc={selectedRoom.desc}
          isTimed={selectedRoom.isTimed}
          timeLimit={selectedRoom.timeLimit}
          onClose={() => setSelectedRoom(null)}
          onConfirm={handleConfirmJoinRoom}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  tokenCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  tokenRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tokenInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  tokenBtn: {
    width: 60,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    height: 42,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  trendingScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  trendingCard: {
    width: 140,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 8,
  },
  trendFlag: {
    fontSize: 28,
  },
  trendTitle: {
    fontSize: 14,
    fontWeight: '700',
    height: 36,
    lineHeight: 18,
  },
  memberIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  roomFlagBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomContent: {
    flex: 1,
    gap: 2,
  },
  roomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  roomDesc: {
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  roomRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 4,
  },
});
