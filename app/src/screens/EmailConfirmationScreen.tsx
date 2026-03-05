import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../services/supabase';
import { logger } from '../utils/logger';

interface EmailConfirmationScreenProps {
  email: string;
  onBackToLogin: () => void;
}

export function EmailConfirmationScreen({ email, onBackToLogin }: EmailConfirmationScreenProps) {
  const { colors, radius } = useTheme();
  const toast = useToast();
  const [resending, setResending] = useState(false);

  const handleResendEmail = async () => {
    setResending(true);
    logger.info('EmailConfirmation', 'Resending confirmation email', { email });

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        logger.error('EmailConfirmation', 'Failed to resend email', error);
        toast.error(error.message);
      } else {
        logger.info('EmailConfirmation', 'Confirmation email resent');
        toast.success('Confirmation email sent!');
      }
    } catch (e) {
      logger.error('EmailConfirmation', 'Exception resending email', e);
      toast.error('Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="mail-outline" size={48} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Check your email</Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          We've sent a confirmation link to
        </Text>

        <Text style={[styles.email, { color: colors.text }]}>{email}</Text>

        <Text style={[styles.instructions, { color: colors.textSecondary }]}>
          Click the link in your email to confirm your account, then come back and sign in.
        </Text>

        <TouchableOpacity
          style={[
            styles.resendButton,
            {
              backgroundColor: resending ? colors.textMuted : colors.primary,
              borderRadius: radius.md,
            },
          ]}
          onPress={handleResendEmail}
          disabled={resending}
          accessibilityLabel="Resend confirmation email"
          accessibilityRole="button"
        >
          {resending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[styles.resendButtonText, { color: colors.white }]}>
              Resend email
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={onBackToLogin} accessibilityLabel="Back to sign in" accessibilityRole="button">
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            Back to Sign In
          </Text>
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
    padding: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  resendButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 16,
    minWidth: 160,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});
