import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { logger } from '../utils/logger';
import { LegalModal } from '../components/LegalModal';

export function LoginScreen() {
  const { colors, radius } = useTheme();
  const { signIn, signUp } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [legalVisible, setLegalVisible] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');

  const handleSubmit = async () => {
    logger.info('LoginScreen', 'Submit pressed', { isSignUp, email });

    if (!email || !password) {
      logger.warn('LoginScreen', 'Validation failed - missing fields');
      toast.warning('Please fill in all fields');
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    logger.info('LoginScreen', `Starting ${isSignUp ? 'sign up' : 'sign in'}...`);

    if (isSignUp) {
      const { error, needsConfirmation } = await signUp(email, password);
      if (error) {
        logger.error('LoginScreen', 'Sign up failed', { message: error.message });
        toast.error(error.message);
        setError(error.message);
      } else if (needsConfirmation) {
        logger.info('LoginScreen', 'Sign up successful, confirmation required');
        // EmailConfirmationScreen will be shown by AppNavigator
      } else {
        logger.info('LoginScreen', 'Sign up successful');
        toast.success('Account created successfully!');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        logger.error('LoginScreen', 'Sign in failed', { message: error.message });
        toast.error(error.message);
        setError(error.message);
      } else {
        logger.info('LoginScreen', 'Sign in successful');
        toast.success('Welcome back!');
      }
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {isSignUp ? 'Create Account' : 'Sign In'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isSignUp ? 'Enter your details to get started' : 'Welcome back to Macro Pal'}
        </Text>

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: colors.errorLight, borderRadius: radius.sm }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderRadius: radius.md,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderRadius: radius.md,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: loading ? colors.textMuted : colors.primary,
              borderRadius: radius.md,
            },
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.white }]}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
        >
          <Text style={[styles.switchText, { color: colors.primary }]}>
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>

        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={() => { setLegalTab('privacy'); setLegalVisible(true); }}>
            <Text style={[styles.legalText, { color: colors.textMuted }]}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={[styles.legalSeparator, { color: colors.textMuted }]}> | </Text>
          <TouchableOpacity onPress={() => { setLegalTab('terms'); setLegalVisible(true); }}>
            <Text style={[styles.legalText, { color: colors.textMuted }]}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
        </View>
      </KeyboardAvoidingView>

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
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  errorContainer: {
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    textAlign: 'center',
  },
  input: {
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  button: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  legalText: {
    fontSize: 13,
  },
  legalSeparator: {
    fontSize: 13,
  },
});
