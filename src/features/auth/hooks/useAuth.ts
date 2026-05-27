import { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabase';
import { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [otpSent, setOtpSent] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check current session status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 2. Listen to changes in auth state (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Request an OTP code via SMS for the given phone number
   */
  const sendOtpCode = async (phoneNumber: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });
      if (error) throw error;
      setOtpSent(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'SMS request failed' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify the received OTP token to complete authentication
   */
  const verifyOtpCode = async (phoneNumber: string, token: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: token,
        type: 'sms',
      });
      if (error) throw error;
      setSession(data.session);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'OTP verification failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    isLoading,
    otpSent,
    sendOtpCode,
    verifyOtpCode,
    logout,
  };
}
