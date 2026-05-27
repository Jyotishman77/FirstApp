import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { LANGUAGES } from '../../../constants/countries';

interface ProfileSetupScreenProps {
  onComplete: (profile: {
    username: string;
    fullName: string;
    bio: string;
    avatar: string;
    language: string;
    interests: string[];
  }) => void;
}

const AVATARS = ['🦊', '🐱', '🐼', '🐨', '🐸', '🦁', '🦖', '🦄', '🐙'];
const INTERESTS = ['🌏 Global Chat', '🎮 Gaming', '🎌 Anime', '💻 Coding', '🎓 Students', '⚽ Sports', '🎬 Movies'];

export function ProfileSetupScreen({ onComplete }: ProfileSetupScreenProps) {
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [username, setUsername] = useState('user_' + Math.floor(1000 + Math.random() * 9000));
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('Hey there! Connecting globally. 🌏');
  const [language, setLanguage] = useState('en');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['🌏 Global Chat']);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const colors = Colors.dark;

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSave = () => {
    if (!username.trim()) return;
    onComplete({
      username: username.trim(),
      fullName: fullName.trim() || username.trim(),
      bio: bio.trim(),
      avatar: AVATARS[avatarIndex],
      language,
      interests: selectedInterests,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Create Profile</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              SET UP YOUR GLOBAL IDENTITY
            </Text>
          </View>

          {/* Avatar Upload */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={[styles.avatarBox, { borderColor: colors.divider, backgroundColor: colors.bgSecondary }]}
              onPress={() => setAvatarIndex((prev) => (prev + 1) % AVATARS.length)}
            >
              <Text style={styles.avatarEmoji}>{AVATARS[avatarIndex]}</Text>
              <View style={[styles.cameraBadge, { backgroundColor: colors.bubbleUser }]}>
                <Text style={{ color: '#FFF', fontSize: 10 }}>📸</Text>
              </View>
            </TouchableOpacity>
            <Text style={[styles.avatarHint, { color: colors.bubbleUser }]}>Tap to change avatar</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Username</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.divider, color: colors.textPrimary, backgroundColor: colors.bgSecondary },
              ]}
              placeholder="alex_global"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>Full Name (Optional)</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.divider, color: colors.textPrimary, backgroundColor: colors.bgSecondary },
              ]}
              placeholder="Alex Smith"
              placeholderTextColor={colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>Bio / Status</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.divider, color: colors.textPrimary, backgroundColor: colors.bgSecondary },
              ]}
              placeholder="Tell other countries about yourself!"
              placeholderTextColor={colors.textMuted}
              value={bio}
              onChangeText={setBio}
            />

            {/* Language Selection */}
            <Text style={[styles.label, { color: colors.textMuted }]}>Preferred Language</Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                { borderColor: colors.divider, backgroundColor: colors.bgSecondary },
              ]}
              onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {LANGUAGES.find((l) => l.code === language)?.nativeName || 'English'}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>▼</Text>
            </TouchableOpacity>

            {showLanguageDropdown && (
              <View style={[styles.dropdownList, { borderColor: colors.divider, backgroundColor: colors.bgSecondary }]}>
                <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                  {LANGUAGES.map((l) => (
                    <TouchableOpacity
                      key={l.code}
                      style={[styles.dropdownItem, { borderBottomColor: colors.divider }]}
                      onPress={() => {
                        setLanguage(l.code);
                        setShowLanguageDropdown(false);
                      }}
                    >
                      <Text style={{ color: colors.textPrimary, fontWeight: language === l.code ? '700' : '400' }}>
                        {l.nativeName} ({l.name})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Interests Chips */}
            <Text style={[styles.label, { color: colors.textMuted, marginTop: 12 }]}>Interests / Tags</Text>
            <View style={styles.interestsGrid}>
              {INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.chip,
                      {
                        borderColor: isSelected ? colors.bubbleUser : colors.divider,
                        backgroundColor: isSelected ? colors.bubbleUser : colors.bgSecondary,
                      },
                    ]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? colors.textUser : colors.textPrimary },
                      ]}
                    >
                      {interest}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.bubbleUser }]}
              onPress={handleSave}
            >
              <Text style={[styles.saveBtnText, { color: colors.textUser }]}>Save & Explore</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 6,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 44,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0A0A0C',
  },
  avatarHint: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 20,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: -16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
