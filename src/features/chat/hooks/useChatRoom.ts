import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../config/supabase';

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'announcement';
  media_url?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export function useChatRoom(roomId: string, sessionExpiryStr: string | null, onSessionExpired?: () => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Manage precision countdown ticking
  useEffect(() => {
    if (!sessionExpiryStr) return;

    const targetTime = new Date(sessionExpiryStr).getTime();

    const tick = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((targetTime - now) / 1000));
      
      setSecondsLeft(diff);

      if (diff <= 0) {
        setIsExpired(true);
        if (timerRef.current) clearInterval(timerRef.current);
        if (onSessionExpired) onSessionExpired();
      }
    };

    tick(); // Initial execute
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionExpiryStr, onSessionExpired]);

  // 2. Fetch history and bind Realtime messages subscription
  useEffect(() => {
    if (isExpired || !roomId) return;

    // Fetch initial chat logs
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles(full_name, avatar_url)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as unknown as Message[]);
      }
    };

    fetchHistory();

    // Subscribe to real-time inserts on the current room ID
    const channel = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch user metadata for the newly appended message
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          const newMessage: Message = {
            id: payload.new.id,
            room_id: payload.new.room_id,
            user_id: payload.new.user_id,
            content: payload.new.content,
            type: payload.new.type,
            media_url: payload.new.media_url,
            created_at: payload.new.created_at,
            profiles: profileData ? {
              full_name: profileData.full_name,
              avatar_url: profileData.avatar_url,
            } : undefined,
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, isExpired]);

  /**
   * Helper function to dispatch text message payload
   */
  const sendMessage = async (content: string): Promise<boolean> => {
    if (isExpired) return false;
    
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return false;

    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      user_id: user.id,
      content,
      type: 'text',
    });

    return !error;
  };

  /**
   * Helper function to dispatch media payloads
   */
  const sendMediaMessage = async (mediaUrl: string, type: 'image' | 'voice'): Promise<boolean> => {
    if (isExpired) return false;
    
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return false;

    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      user_id: user.id,
      type,
      media_url: mediaUrl,
    });

    return !error;
  };

  // Human readable stopwatch countdown format (e.g., 04:31)
  const formatTimeLeft = (): string => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return {
    messages,
    secondsLeft,
    isExpired,
    formatTimeLeft,
    sendMessage,
    sendMediaMessage,
  };
}
export type UseChatRoomReturn = ReturnType<typeof useChatRoom>;
