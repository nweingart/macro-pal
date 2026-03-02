import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { OnboardingLayout } from '../../components/OnboardingLayout';

interface Props {
  onContinue: (input: string) => Promise<void>;
  onBack: () => void;
}

const SUGGESTIONS = [
  '2 eggs and toast',
  'bowl of oatmeal with berries',
  'chicken salad sandwich',
  'grilled salmon with rice',
];

export function TryItNowScreen({ onContinue, onBack }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const result = await ExpoSpeechRecognitionModule.getPermissionsAsync();
      setHasPermission(result.granted);
    };
    checkPermission();
  }, []);

  // Speech recognition events
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0]?.transcript;
      if (transcript) {
        setInput(transcript);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
  });

  const startListening = async () => {
    // Request permission if not granted
    if (hasPermission !== true) {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      setHasPermission(result.granted);
      if (!result.granted) {
        return;
      }
    }

    try {
      await ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        maxAlternatives: 1,
      });
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
    }
  };

  const stopListening = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (err) {
      console.error('Failed to stop speech recognition:', err);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleContinue = async () => {
    if (input.trim()) {
      setLoading(true);
      await onContinue(input.trim());
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <OnboardingLayout
      currentStep={17}
      onContinue={handleContinue}
      onBack={onBack}
      continueLabel={loading ? 'Analyzing...' : 'Log It'}
      continueDisabled={!input.trim() || loading}
    >
      <View style={styles.content}>
        <Text style={styles.label}>TRY IT NOW</Text>
        <Text style={styles.title}>Log your first{'\n'}food</Text>
        <Text style={styles.subtitle}>
          Just describe what you ate naturally — our AI will handle the rest.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="e.g., 2 eggs with toast and butter"
            placeholderTextColor="#9CA3AF"
            multiline
            autoFocus={!isListening}
          />
          <TouchableOpacity
            style={[
              styles.micButton,
              isListening && styles.micButtonActive,
            ]}
            onPress={toggleListening}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isListening ? 'mic' : 'mic-outline'}
              size={24}
              color={isListening ? '#FFFFFF' : '#3B82F6'}
            />
          </TouchableOpacity>
          {isListening && (
            <View style={styles.listeningOverlay}>
              <View style={styles.listeningIndicator}>
                <Ionicons name="mic" size={32} color="#DC2626" />
                <Text style={styles.listeningText}>Listening...</Text>
              </View>
            </View>
          )}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#3B82F6" size="large" />
              <Text style={styles.loadingText}>Analyzing nutrition...</Text>
            </View>
          )}
        </View>

        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Try these examples:</Text>
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((suggestion, index) => (
              <Text
                key={index}
                style={styles.suggestion}
                onPress={() => handleSuggestion(suggestion)}
              >
                "{suggestion}"
              </Text>
            ))}
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    paddingRight: 56,
    fontSize: 17,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  micButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  micButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  listeningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(254, 242, 242, 0.95)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningIndicator: {
    alignItems: 'center',
  },
  listeningText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(249, 250, 251, 0.9)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  suggestionsContainer: {
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestion: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    color: '#3B82F6',
  },
});
