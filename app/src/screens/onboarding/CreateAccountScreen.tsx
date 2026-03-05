import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { Mascot } from '../../components/Mascot';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { LegalModal } from '../../components/LegalModal';
import { useFunnelStep } from '@nedweingart/funnel-kit-react-native';

interface Props {
  onAccountCreated: () => void | Promise<void>;
  onBack?: () => void;
}

export function CreateAccountScreen({ onAccountCreated, onBack }: Props) {
  useFunnelStep('CreateAccount');
  const { colors, radius } = useTheme();
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState<'options' | 'email'>('options');
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [legalVisible, setLegalVisible] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
    } else {
      await onAccountCreated();
    }
    setGoogleLoading(false);
  };

  const handleEmailSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);

    if (isSignUp) {
      const result = await signUp(email, password);
      const { error } = result;
      const needsConfirmation = 'needsConfirmation' in result ? result.needsConfirmation : false;
      if (error) {
        setError(error.message);
      } else if (needsConfirmation) {
        // AppNavigator will show EmailConfirmationScreen
      } else {
        await onAccountCreated();
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        await onAccountCreated();
      }
    }

    setLoading(false);
  };

  const content = (
    <View style={styles.content}>
      <View style={styles.header}>
        <Mascot size={80} mood="happy" />
        <Text style={[styles.title, { color: colors.text }]}>Create your account</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Save your personalized plan and start your free trial
        </Text>
      </View>

      {mode === 'options' ? (
        <View style={styles.options}>
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
            accessibilityLabel="Continue with Google"
            accessibilityRole="button"
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

          <Pressable
            style={[
              styles.emailButton,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.md,
              },
            ]}
            onPress={() => setMode('email')}
            accessibilityLabel="Continue with Email"
            accessibilityRole="button"
          >
            <Ionicons name="mail-outline" size={20} color={colors.white} />
            <Text style={[styles.emailButtonText, { color: colors.white }]}>
              Continue with Email
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.emailForm}>
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
            accessibilityLabel="Email"
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
            accessibilityLabel="Password"
          />

          {isSignUp && password.length > 0 && password.length < 8 && (
            <Text style={[styles.passwordHint, { color: colors.textMuted }]}>
              {8 - password.length} more character{8 - password.length !== 1 ? 's' : ''} needed
            </Text>
          )}

          <Pressable
            style={[
              styles.submitButton,
              {
                backgroundColor: loading ? colors.textMuted : colors.primary,
                borderRadius: radius.md,
              },
            ]}
            onPress={handleEmailSubmit}
            disabled={loading}
            accessibilityLabel={isSignUp ? 'Create account' : 'Sign in'}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={[styles.submitButtonText, { color: colors.white }]}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </Pressable>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            accessibilityLabel={isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            accessibilityRole="button"
          >
            <Text style={[styles.switchText, { color: colors.primary }]}>
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backToOptions} onPress={() => { setMode('options'); setError(null); }} accessibilityLabel="Back to sign-in options" accessibilityRole="button">
            <Text style={[styles.backToOptionsText, { color: colors.textMuted }]}>
              Back to sign-in options
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.legalLinks}>
        <TouchableOpacity onPress={() => { setLegalTab('privacy'); setLegalVisible(true); }} accessibilityLabel="Privacy Policy" accessibilityRole="button">
          <Text style={[styles.legalText, { color: colors.textMuted }]}>Privacy Policy</Text>
        </TouchableOpacity>
        <Text style={[styles.legalSeparator, { color: colors.textMuted }]}> | </Text>
        <TouchableOpacity onPress={() => { setLegalTab('terms'); setLegalVisible(true); }} accessibilityLabel="Terms of Service" accessibilityRole="button">
          <Text style={[styles.legalText, { color: colors.textMuted }]}>Terms of Service</Text>
        </TouchableOpacity>
      </View>

      <LegalModal
        visible={legalVisible}
        onClose={() => setLegalVisible(false)}
        initialTab={legalTab}
      />
    </View>
  );

  // Use OnboardingLayout but hide the continue button (auth buttons handle navigation)
  return (
    <OnboardingLayout
      currentStep={21}
      onContinue={() => {}}
      onBack={onBack}
      continueLabel=""
      continueDisabled={true}
      showProgress={false}
    >
      {content}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 22,
  },
  options: {
    gap: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    gap: 10,
  },
  googleButtonText: {
    fontSize: 17,
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
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  emailButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  emailForm: {
    gap: 12,
  },
  errorContainer: {
    padding: 12,
  },
  errorText: {
    textAlign: 'center',
  },
  input: {
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  submitButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  switchText: {
    fontSize: 14,
  },
  backToOptions: {
    alignItems: 'center',
    marginTop: 4,
  },
  backToOptionsText: {
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
  passwordHint: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 4,
  },
});
