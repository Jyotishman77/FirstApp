import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { supabase } from '../../../config/supabase';
import { Colors } from '../../../constants/Colors';

interface JoinRoomScreenProps {
  onJoinSuccess: (roomId: string, sessionExpiry: string) => void;
  onLogout: () => void;
}

export function JoinRoomScreen({ onJoinSuccess, onLogout }: JoinRoomScreenProps) {
  const [tokenCode, setTokenCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinRoom = async () => {
    if (!tokenCode || tokenCode.trim().length === 0) {
      setError('Please enter a valid access token');
      return;
    }
    setError(null);
    setLoading(true);
    Keyboard.dismiss();

    try {
      // Invoke postgres RPC to atomically lock the token, generate a session, and return the session ID
      const { data: sessionId, error: rpcError } = await supabase.rpc('join_room_via_token', {
        p_token_code: tokenCode.trim(),
      });

      if (rpcError) throw rpcError;

      if (!sessionId) {
        throw new Error('Failed to start a session. Token might be invalid or fully claimed.');
      }

      // Fetch the newly created session parameters to get the expiry timestamp and room ID
      const { data: sessionData, error: sessionFetchError } = await supabase
        .from('sessions')
        .select('room_id, expires_at')
        .eq('id', sessionId)
        .single();

      if (sessionFetchError || !sessionData) {
        throw new Error('Failed to retrieve session metrics');
      }

      onJoinSuccess(sessionData.room_id, sessionData.expires_at);
    } catch (err: any) {
      setError(err.message || 'Access token validation failed');
    } finally {
      setLoading(false);
    }
  };

  const colors = Colors.dark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <Text style={[styles.logoutText, { color: colors.textMuted }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Enter Access Token</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Insert your unique room access passcode to unlock your timed chat session.
          </Text>

          {error && <Text style={[styles.errorText, { color: colors.accentWarn }]}>{error}</Text>}

          <TextInput
            style={[styles.input, { borderColor: colors.divider, color: colors.textPrimary, backgroundColor: colors.bgSecondary }]}
            placeholder="TOKEN-XXXX-XXXX"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            value={tokenCode}
            onChangeText={setTokenCode}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.bubbleUser }]}
            onPress={handleJoinRoom}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textUser} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.textUser }]}>Unlock Room Access</Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.infoFooter, { color: colors.textMuted }]}>
            * Each token is single-use and registers a strict, non-negotiable chat window.
          </Text>
        </View>
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
    paddingHorizontal: 24,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  logoutBtn: {
    padding: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 32,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: 1,
  },
  button: {
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoFooter: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
  },
});
