import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Mascot } from '../components/Mascot';
import { Button } from '../components/Button';
import { LegalModal } from '../components/LegalModal';

interface AuthHomeScreenProps {
  onNavigateToEmail: () => void;
}

export function AuthHomeScreen({ onNavigateToEmail }: AuthHomeScreenProps) {
  const { colors, radius } = useTheme();
  const { signInWithGoogle } = useAuth();
  const toast = useToast();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [legalVisible, setLegalVisible] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
    }
    setGoogleLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Mascot size={120} mood="excited" />
          <Text style={[styles.title, { color: colors.text }]}>Macro Pal</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your nutrition with AI
          </Text>
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={[
              styles.googleButton,
              {
                backgroundColor: colors.white,
                borderRadius: radius.md,
                borderColor: colors.border,
              },
            ]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color={colors.text} />
                <Text style={[styles.googleButtonText, { color: colors.text }]}>
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <Button
            label="Continue with Email"
            onPress={onNavigateToEmail}
            variant="primary"
            size="large"
          />
        </View>
      </View>

      <View style={styles.legalLinks}>
        <Pressable onPress={() => { setLegalTab('privacy'); setLegalVisible(true); }}>
          <Text style={[styles.legalText, { color: colors.textMuted }]}>Privacy Policy</Text>
        </Pressable>
        <Text style={[styles.legalSeparator, { color: colors.textMuted }]}> | </Text>
        <Pressable onPress={() => { setLegalTab('terms'); setLegalVisible(true); }}>
          <Text style={[styles.legalText, { color: colors.textMuted }]}>Terms of Service</Text>
        </Pressable>
      </View>

      <LegalModal
        visible={legalVisible}
        onClose={() => setLegalVisible(false)}
        initialTab={legalTab}
      />
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
    padding: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  buttons: {
    gap: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderWidth: 1,
    gap: 10,
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 16,
  },
  legalText: {
    fontSize: 13,
  },
  legalSeparator: {
    fontSize: 13,
  },
});
