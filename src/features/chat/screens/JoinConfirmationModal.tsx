import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/Colors';

interface JoinConfirmationModalProps {
  visible: boolean;
  roomTitle: string;
  flag: string;
  desc: string;
  isTimed: boolean;
  timeLimit?: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function JoinConfirmationModal({
  visible,
  roomTitle,
  flag,
  desc,
  isTimed,
  timeLimit = 120,
  onClose,
  onConfirm,
}: JoinConfirmationModalProps) {
  const colors = Colors.dark;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.bgSecondary, borderTopColor: colors.divider }]}>
          {/* Room Title */}
          <View style={styles.titleRow}>
            <Text style={styles.flag}>{flag}</Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{roomTitle}</Text>
          </View>

          {/* Room Description */}
          <Text style={[styles.description, { color: colors.textMuted }]}>{desc}</Text>

          {/* Rules */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Community Rules</Text>
          <View style={[styles.rulesList, { backgroundColor: colors.bgPrimary, borderColor: colors.divider }]}>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleNum}>1</Text>
              <Text style={[styles.ruleText, { color: colors.textOther }]}>
                Be respectful to all international participants. No hate speech or slurs.
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleNum}>2</Text>
              <Text style={[styles.ruleText, { color: colors.textOther }]}>
                Auto-translate is active. Speak clearly so other users can translate your comments.
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleNum}>3</Text>
              <Text style={[styles.ruleText, { color: colors.textOther }]}>
                {isTimed
                  ? `This room has a strict ${timeLimit}s timer. You will be automatically disconnected upon expiry.`
                  : 'This is a verified public community room. Your presence is logged via secure auth.'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btnSecondary, { borderColor: colors.divider, backgroundColor: colors.bgPrimary }]}
              onPress={onClose}
            >
              <Text style={[styles.btnSecondaryText, { color: colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: colors.bubbleUser }]}
              onPress={onConfirm}
            >
              <Text style={[styles.btnPrimaryText, { color: colors.textUser }]}>Agree & Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    padding: 24,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  flag: {
    fontSize: 26,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  rulesList: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: 10,
  },
  ruleNum: {
    color: '#3B82F6',
    fontWeight: '800',
    fontSize: 13,
  },
  ruleText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnSecondary: {
    height: 52,
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  btnPrimary: {
    height: 52,
    flex: 1.5,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
