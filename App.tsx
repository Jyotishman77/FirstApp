import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from './src/features/auth/hooks/useAuth';
import { LoginScreen } from './src/features/auth/screens/LoginScreen';
import { ProfileSetupScreen } from './src/features/auth/screens/ProfileSetupScreen';
import { HomeScreen } from './src/features/chat/screens/HomeScreen';
import { ChatScreen } from './src/features/chat/screens/ChatScreen';
import { ExpiredScreen } from './src/features/chat/screens/ExpiredScreen';
import { Colors } from './src/constants/Colors';
import { supabase } from './src/config/supabase';

type AppNavigationState = 'loading' | 'auth' | 'profile_setup' | 'home' | 'chat' | 'expired';

interface UserProfile {
  username: string;
  avatar: string;
  language: string;
}

export default function App() {
  const { user, isLoading, sendOtpCode, verifyOtpCode, logout } = useAuth();
  const [navState, setNavState] = useState<AppNavigationState>('loading');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const colors = Colors.dark;

  // Coordinate routing based on Supabase session state & profile existence
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Fetch profiles table to see if user has already set up username
        supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single()
          .then(({ data, error }) => {
            if (error || !data) {
              setNavState('profile_setup');
            } else {
              // Parse displayName & avatar from DB
              const fullName = data.full_name || 'User';
              const cleanUsername = fullName.split(' (')[0];
              setUserProfile({
                username: cleanUsername,
                avatar: data.avatar_url || '🦊',
                language: 'en',
              });
              setNavState('home');
            }
          });
      } else {
        setNavState('auth');
      }
    }
  }, [user, isLoading]);

  if (isLoading || navState === 'loading') {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bgPrimary }]}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </View>
    );
  }

  const handleLoginSuccess = () => {
    // Navigates state dynamically based on useEffect authentication state sync
  };

  const handleProfileComplete = async (profileData: {
    username: string;
    fullName: string;
    bio: string;
    avatar: string;
    language: string;
    interests: string[];
  }) => {
    setNavState('loading');
    if (user) {
      try {
        // Upsert standard profiles info into database
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: `${profileData.fullName} (${profileData.avatar})`,
          avatar_url: profileData.avatar,
          updated_at: new Date().toISOString(),
        });

        // Upsert user preference if exists
        await supabase.from('user_preferences').upsert({
          id: user.id,
          username: profileData.username,
          full_name: profileData.fullName,
          avatar_url: profileData.avatar,
          bio: profileData.bio,
          preferred_language: profileData.language,
          interests: profileData.interests,
        });

        if (error) {
          console.warn('Supabase profiles upsert failure:', error.message);
        }
      } catch (err) {
        console.warn('Preferences table not initialized yet, skipping extra fields');
      }
    }
    
    setUserProfile({
      username: profileData.username,
      avatar: profileData.avatar,
      language: profileData.language,
    });
    setNavState('home');
  };

  const handleJoinSuccess = (roomId: string, expiry: string) => {
    setCurrentRoomId(roomId);
    setSessionExpiry(expiry);
    setNavState('chat');
  };

  const handleSessionExpired = () => {
    setNavState('expired');
  };

  const handleLeaveRoom = () => {
    setNavState('home');
    setCurrentRoomId(null);
    setSessionExpiry(null);
  };

  const handleBackToHome = () => {
    setNavState('home');
    setCurrentRoomId(null);
    setSessionExpiry(null);
  };

  const handleLogout = async () => {
    setNavState('loading');
    setUserProfile(null);
    await logout();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {navState === 'auth' && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          sendOtp={sendOtpCode}
          verifyOtp={verifyOtpCode}
        />
      )}

      {navState === 'profile_setup' && (
        <ProfileSetupScreen
          onComplete={handleProfileComplete}
        />
      )}

      {navState === 'home' && (
        <HomeScreen
          userProfile={userProfile}
          onJoinSuccess={handleJoinSuccess}
          onLogout={handleLogout}
          onEditProfile={() => setNavState('profile_setup')}
        />
      )}

      {navState === 'chat' && currentRoomId && sessionExpiry && (
        <ChatScreen
          roomId={currentRoomId}
          sessionExpiry={sessionExpiry}
          onSessionExpired={handleSessionExpired}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      {navState === 'expired' && (
        <ExpiredScreen
          onBackToHome={handleBackToHome}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
