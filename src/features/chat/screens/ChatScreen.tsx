import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useChatRoom, Message } from '../hooks/useChatRoom';
import { enableScreenshotBlocker, disableScreenshotBlocker } from '../../../utils/security';
import { Colors } from '../../../constants/Colors';
import { supabase } from '../../../config/supabase';
import { MOCK_ROOMS } from './HomeScreen';

interface ChatScreenProps {
  roomId: string;
  sessionExpiry: string;
  onSessionExpired: () => void;
  onLeaveRoom: () => void;
}

// Translations Database
const TRANSLATIONS: Record<string, string> = {
  'नमस्ते दोस्तों! कैसे हैं सब?': 'Hello friends! How is everyone? (Translated from Hindi)',
  'আমি ভালো আছি, আপনি কেমন আছেন?': 'I am doing well, how are you? (Translated from Bengali)',
  'Hey everyone, the automatic translation is working perfectly here!': 'अरे सभी, स्वचालित अनुवाद यहाँ पूरी तरह से काम कर रहा है! (Translated from English)',
  'こんにちは！日本のアニメが好きな人？': 'Hello! Who likes Japanese anime? (Translated from Japanese)',
  'Me! I am currently watching Demon Slayer. It is incredible!': 'मैं! मैं वर्तमान में डेमन स्लेयर देख रहा हूँ। यह अविश्वसनीय है! (Translated from English)',
  'あ、鬼滅の刃ですね！炭治郎がかっこいい。': 'Ah, Demon Slayer! Tanjiro is cool. (Translated from Japanese)',
  'Supabase real-time is perfect for scaling chat apps.': 'स्केलिंग चैट ऐप्स के लिए सुपर्बेस रीयल-टाइम बिल्कुल सही है। (Translated from English)',
  'Agreed, the RLS policies keep the timed-access sessions safe.': 'सहमत हूँ, आरएलएस नीतियां समय-बद्ध सत्रों को सुरक्षित रखती हैं। (Translated from English)',
};

export function ChatScreen({ roomId, sessionExpiry, onSessionExpired, onLeaveRoom }: ChatScreenProps) {
  const [roomDetails, setRoomDetails] = useState<{
    title: string;
    flag: string;
    members: number;
    lang: string;
    isTimed: boolean;
  }>({
    title: 'Active Chat',
    flag: '💬',
    members: 10,
    lang: 'English',
    isTimed: false,
  });

  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [translatedMsgIds, setTranslatedMsgIds] = useState<Record<string, boolean>>({});
  const flatListRef = useRef<FlatList>(null);

  const colors = Colors.dark;

  const {
    messages,
    secondsLeft,
    isExpired,
    formatTimeLeft,
    sendMessage,
  } = useChatRoom(roomId, sessionExpiry, onSessionExpired);

  // 1. Load Room details and setup security blocking
  useEffect(() => {
    enableScreenshotBlocker();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });

    // Check Mock room first
    const mockMatch = MOCK_ROOMS.find((r) => r.id === roomId);
    if (mockMatch) {
      setRoomDetails({
        title: mockMatch.title,
        flag: mockMatch.flag,
        members: mockMatch.members,
        lang: mockMatch.lang,
        isTimed: mockMatch.isTimed,
      });
    } else {
      // Fetch room details from Supabase if not a mock
      supabase
        .from('rooms')
        .select('title, flag_emoji, online_count, default_language, is_timed')
        .eq('id', roomId)
        .single()
        .then(({ data }) => {
          if (data) {
            setRoomDetails({
              title: data.title,
              flag: data.flag_emoji || '💬',
              members: data.online_count || 12,
              lang: data.default_language || 'en',
              isTimed: data.is_timed || false,
            });
          }
        });
    }

    return () => {
      disableScreenshotBlocker();
    };
  }, [roomId]);

  // 2. Auto scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText('');
    const success = await sendMessage(textToSend);
    if (!success) {
      setInputText(textToSend);
    }
  };

  const toggleTranslate = (msgId: string) => {
    setTranslatedMsgIds((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const getTranslationText = (content: string): string => {
    if (TRANSLATIONS[content]) {
      return TRANSLATIONS[content];
    }
    // Fallback translation simulator
    return `${content} (Auto-translated to ${roomDetails.lang === 'Hindi/English' ? 'English' : 'Hindi'} 🌐)`;
  };

  const isWarningTime = roomDetails.isTimed && secondsLeft > 0 && secondsLeft <= 30;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={onLeaveRoom} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>← Leave</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.headerFlag}>{roomDetails.flag}</Text>
            <Text style={[styles.roomTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {roomDetails.title}
            </Text>
          </View>
          <Text style={[styles.statusText, { color: colors.textMuted }]}>
            🟢 {roomDetails.members} online | {roomDetails.lang}
          </Text>
        </View>

        {roomDetails.isTimed ? (
          <View
            style={[
              styles.timerBadge,
              { backgroundColor: isWarningTime ? colors.accentWarn + '20' : colors.accentActive + '20' },
            ]}
          >
            <Text
              style={[
                styles.timerText,
                { color: isWarningTime ? colors.accentWarn : colors.accentActive },
              ]}
            >
              {formatTimeLeft()}
            </Text>
          </View>
        ) : (
          <View style={[styles.timerBadge, { backgroundColor: colors.divider }]}>
            <Text style={[styles.timerText, { color: colors.textPrimary }]}>Public</Text>
          </View>
        )}
      </View>

      {/* Expiry Warning */}
      {isWarningTime && (
        <View style={[styles.warningBanner, { backgroundColor: colors.accentWarn }]}>
          <Text style={styles.warningBannerText}>
            Warning: Session expiring in {formatTimeLeft()}. Messages will self-destruct.
          </Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item.id || `msg-${index}`}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isOwnMessage = item.user_id === currentUserId;
          const showTrans = translatedMsgIds[item.id];
          const hasTrans = isOwnMessage ? false : true; // Allow translating incoming messages

          // Parse country suffix for mock profiles
          let countrySuffix = '';
          if (item.profiles?.full_name?.includes('(')) {
            const match = item.profiles.full_name.match(/\(([^)]+)\)/);
            if (match) {
              countrySuffix = match[1];
            }
          }

          return (
            <View
              style={[
                styles.messageWrapper,
                isOwnMessage ? styles.ownMessageWrapper : styles.otherMessageWrapper,
              ]}
            >
              {!isOwnMessage && (
                <View style={styles.senderHeader}>
                  <Text style={[styles.senderName, { color: colors.textMuted }]}>
                    {item.profiles?.full_name || 'Guest User'}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.9}
                onLongPress={() => toggleTranslate(item.id)}
                onPress={() => toggleTranslate(item.id)}
                style={[
                  styles.bubble,
                  {
                    backgroundColor: isOwnMessage ? colors.bubbleUser : colors.bubbleOther,
                    borderBottomRightRadius: isOwnMessage ? 4 : 18,
                    borderBottomLeftRadius: isOwnMessage ? 18 : 4,
                  },
                ]}
              >
                <Text style={[styles.messageText, { color: isOwnMessage ? colors.textUser : colors.textOther }]}>
                  {item.content}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    { color: isOwnMessage ? colors.textUser + '80' : colors.textMuted },
                  ]}
                >
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>

              {/* Translation Tooltip Display */}
              {hasTrans && showTrans && (
                <View style={[styles.transTooltip, { backgroundColor: colors.bgSecondary, borderColor: colors.divider }]}>
                  <Text style={[styles.transText, { color: colors.bubbleUser }]}>
                    {getTranslationText(item.content)}
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />

      {/* Composer Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.composerContainer, { borderTopColor: colors.divider, backgroundColor: colors.bgPrimary }]}>
          <TextInput
            style={[
              styles.inputField,
              { backgroundColor: colors.bgSecondary, color: colors.textPrimary, borderColor: colors.divider },
            ]}
            placeholder={isExpired ? 'Session expired' : 'Type a translated message...'}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            editable={!isExpired}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: isExpired || !inputText.trim() ? colors.bgSecondary : colors.bubbleUser },
            ]}
            onPress={handleSend}
            disabled={isExpired || !inputText.trim()}
          >
            <Text
              style={[
                styles.sendButtonText,
                { color: isExpired || !inputText.trim() ? colors.textMuted : colors.textUser },
              ]}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerFlag: {
    fontSize: 18,
  },
  roomTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  statusText: {
    fontSize: 11,
    marginTop: 2,
  },
  timerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    minWidth: 54,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  warningBanner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  messageList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessageWrapper: {
    alignSelf: 'flex-end',
  },
  otherMessageWrapper: {
    alignSelf: 'flex-start',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    paddingLeft: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  transTooltip: {
    marginTop: 4,
    padding: 8,
    borderRadius: 10,
    borderWidth: 0.5,
    alignSelf: 'flex-start',
  },
  transText: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  inputField: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 15,
    marginRight: 10,
  },
  sendButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
