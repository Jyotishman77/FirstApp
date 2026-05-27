import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '../../../constants/Colors';

interface ExpiredScreenProps {
  onBackToHome: () => void;
}

export function ExpiredScreen({ onBackToHome }: ExpiredScreenProps) {
  const colors = Colors.dark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View style={styles.content}>
        {/* Large clock/alarm icon representation */}
        <View style={[styles.iconContainer, { backgroundColor: colors.accentWarn + '15' }]}>
          <Text style={[styles.iconText, { color: colors.accentWarn }]}>⏰</Text>
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Session Expired</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          Your timed-access window has ended. You have been securely disconnected from the chat server.
        </Text>

        <View style={[styles.statsCard, { backgroundColor: colors.bgSecondary, borderColor: colors.divider }]}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Room Status</Text>
            <Text style={[styles.statValue, { color: colors.accentWarn, fontWeight: '700' }]}>Locked</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Encryption Keys</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>Purged</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.bubbleUser }]}
          onPress={onBackToHome}
        >
          <Text style={[styles.buttonText, { color: colors.textUser }]}>Back to Token Code Screen</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconText: {
    fontSize: 44,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 40,
  },
  statsCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statDivider: {
    height: 1,
    width: '100%',
  },
  button: {
    height: 52,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
