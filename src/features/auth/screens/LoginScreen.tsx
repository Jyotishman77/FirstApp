import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { CountryPicker } from './CountryPicker';
import { Country, COUNTRIES } from '../../../constants/countries';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>;
}

export function LoginScreen({ onLoginSuccess, sendOtp, verifyOtp }: LoginScreenProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // default India
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Resend OTP countdown
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleRequestOtp = async () => {
    const fullPhone = `${selectedCountry.dialCode}${phoneNumber.replace(/\s+/g, '')}`;
    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setError('Please enter a valid phone number');
      return;
    }
    setError(null);
    setLoading(true);
    Keyboard.dismiss();

    const res = await sendOtp(fullPhone);
    setLoading(false);
    if (res.success) {
      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
    } else {
      setError(res.error || 'Failed to send verification SMS');
    }
  };

  const handleVerifyOtp = async () => {
    const fullPhone = `${selectedCountry.dialCode}${phoneNumber.replace(/\s+/g, '')}`;
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    setError(null);
    setLoading(true);
    Keyboard.dismiss();

    const res = await verifyOtp(fullPhone, otpCode);
    setLoading(false);
    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.error || 'Invalid verification code');
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setError(null);
    setLoading(true);
    const fullPhone = `${selectedCountry.dialCode}${phoneNumber.replace(/\s+/g, '')}`;
    const res = await sendOtp(fullPhone);
    setLoading(false);
    if (res.success) {
      setResendTimer(30);
      setCanResend(false);
      setError('A new verification code was sent');
    } else {
      setError(res.error || 'Failed to resend verification SMS');
    }
  };

  const handleSSOLogin = (provider: string) => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(); // Simulate successful login
    }, 1000);
  };

  const colors = Colors.dark;

  if (showCountryPicker) {
    return (
      <CountryPicker
        onSelect={(country) => {
          setSelectedCountry(country);
          setShowCountryPicker(false);
        }}
        onClose={() => setShowCountryPicker(false)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>GLOBECHAT</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              GLOBAL MESSAGING HUB
            </Text>
          </View>

          <View style={styles.formContainer}>
            {error && (
              <Text style={[styles.errorText, { color: error.includes('sent') ? colors.accentActive : colors.accentWarn }]}>
                {error}
              </Text>
            )}

            {step === 'phone' ? (
              <>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Country / Region</Text>
                <TouchableOpacity
                  style={[
                    styles.countryDropdown,
                    { borderColor: colors.divider, backgroundColor: colors.bgSecondary },
                  ]}
                  onPress={() => {
                    setError(null);
                    setShowCountryPicker(true);
                  }}
                >
                  <Text style={[styles.countryDropdownText, { color: colors.textPrimary }]}>
                    {selectedCountry.flag}  {selectedCountry.name}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>▼</Text>
                </TouchableOpacity>

                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Mobile Phone Number</Text>
                <View style={styles.phoneInputRow}>
                  <View style={[styles.dialCodeBadge, { borderColor: colors.divider, backgroundColor: colors.bgSecondary }]}>
                    <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                      {selectedCountry.dialCode}
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.phoneInput,
                      { borderColor: colors.divider, color: colors.textPrimary, backgroundColor: colors.bgSecondary },
                    ]}
                    placeholder="98765 43210"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.bubbleUser }]}
                  onPress={handleRequestOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.textUser} />
                  ) : (
                    <Text style={[styles.buttonText, { color: colors.textUser }]}>Send Access OTP</Text>
                  )}
                </TouchableOpacity>

                {/* SSO options */}
                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                  <Text style={[styles.dividerText, { color: colors.textMuted }]}>Or connect with</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                </View>

                <View style={styles.ssoGrid}>
                  <TouchableOpacity
                    style={[styles.ssoButton, { borderColor: colors.divider, backgroundColor: colors.bgSecondary }]}
                    onPress={() => handleSSOLogin('Google')}
                  >
                    <Text style={{ fontSize: 18, marginRight: 6 }}>🌐</Text>
                    <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.ssoButton, { borderColor: colors.divider, backgroundColor: colors.bgSecondary }]}
                    onPress={() => handleSSOLogin('Apple')}
                  >
                    <Text style={{ fontSize: 18, marginRight: 6 }}>🍎</Text>
                    <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>Apple</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.guestButton, { borderColor: colors.divider, backgroundColor: colors.bgSecondary }]}
                  onPress={() => handleSSOLogin('Guest')}
                >
                  <Text style={[styles.guestButtonText, { color: colors.textPrimary }]}>👤 Enter as Guest</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                  Enter 6-Digit Code sent to {selectedCountry.dialCode} {phoneNumber}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: colors.divider, color: colors.textPrimary, backgroundColor: colors.bgSecondary },
                  ]}
                  placeholder="000000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  autoFocus
                />
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.bubbleUser }]}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.textUser} />
                  ) : (
                    <Text style={[styles.buttonText, { color: colors.textUser }]}>Verify & Join</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.otpFooter}>
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={loading || !canResend}
                    style={styles.resendBtn}
                  >
                    <Text style={[styles.resendText, { color: canResend ? colors.accentActive : colors.textMuted }]}>
                      {canResend ? 'Resend Verification Code' : `Resend in ${resendTimer}s`}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backLink}
                    onPress={() => setStep('phone')}
                    disabled={loading}
                  >
                    <Text style={[styles.backLinkText, { color: colors.textMuted }]}>Change Phone Number</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 6,
  },
  formContainer: {
    marginBottom: 20,
    marginTop: 30,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countryDropdown: {
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  countryDropdownText: {
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInputRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  dialCodeBadge: {
    height: 52,
    width: 70,
    borderWidth: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 20,
  },
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ssoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  ssoButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  guestButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  otpFooter: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendBtn: {
    padding: 8,
    marginBottom: 12,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  backLink: {
    alignItems: 'center',
    padding: 8,
  },
  backLinkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
