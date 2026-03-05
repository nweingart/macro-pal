import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from '../utils/speechRecognition';
import { Food } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Mascot } from './Mascot';
import { SpeechBubble } from './SpeechBubble';

interface AddFoodModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: string) => Promise<void>;
  foods: Food[];
  loading?: boolean;
}

export function AddFoodModal({
  visible,
  onClose,
  onSubmit,
  foods,
  loading = false,
}: AddFoodModalProps) {
  const { colors, radius, spacing } = useTheme();
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<'input' | 'library'>('input');
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
    if (hasPermission !== true) {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      setHasPermission(result.granted);
      if (!result.granted) return;
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

  const filteredFoods = foods
    .filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.times_used - a.times_used);

  const quickAddFoods = foods
    .slice()
    .sort((a, b) => b.times_used - a.times_used)
    .slice(0, 3);

  const handleSubmit = async () => {
    if (input.trim()) {
      await onSubmit(input.trim());
      setInput('');
      onClose();
    }
  };

  const handleSelectFood = async (food: Food) => {
    await onSubmit(`1 ${food.serving_unit} ${food.name}`);
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    if (isListening) {
      stopListening();
    }
    setInput('');
    setSearchQuery('');
    setMode('input');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} accessibilityLabel="Cancel" accessibilityRole="button">
            <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Add Food</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.teddyRow}>
          <SpeechBubble message="What did you have?" />
          <Mascot size={72} mood="happy" />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: mode === 'input' ? colors.primary : colors.border, borderRadius: radius.sm },
            ]}
            onPress={() => setMode('input')}
            accessibilityLabel="Describe food"
            accessibilityRole="button"
          >
            <Text style={[styles.tabText, { color: mode === 'input' ? colors.white : colors.textSecondary }]}>
              Describe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: mode === 'library' ? colors.primary : colors.border, borderRadius: radius.sm },
            ]}
            onPress={() => setMode('library')}
            accessibilityLabel="Select from library"
            accessibilityRole="button"
          >
            <Text style={[styles.tabText, { color: mode === 'library' ? colors.white : colors.textSecondary }]}>
              Library
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'input' ? (
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.card,
                    borderRadius: radius.md,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="e.g., 2 eggs, bowl of oatmeal with berries"
                placeholderTextColor={colors.textMuted}
                value={input}
                onChangeText={setInput}
                multiline
                autoFocus={!isListening}
                accessibilityLabel="Describe what you ate"
              />
              <TouchableOpacity
                style={[
                  styles.micButton,
                  {
                    backgroundColor: isListening ? '#DC2626' : colors.primaryLight || '#EFF6FF',
                    borderColor: isListening ? '#DC2626' : colors.primary,
                  },
                ]}
                onPress={toggleListening}
                activeOpacity={0.7}
                accessibilityLabel={isListening ? 'Stop listening' : 'Start voice input'}
                accessibilityRole="button"
              >
                <Ionicons
                  name={isListening ? 'mic' : 'mic-outline'}
                  size={22}
                  color={isListening ? '#FFFFFF' : colors.primary}
                />
              </TouchableOpacity>
              {isListening && (
                <View style={[styles.listeningOverlay, { borderRadius: radius.md }]}>
                  <Ionicons name="mic" size={32} color="#DC2626" />
                  <Text style={styles.listeningText}>Listening...</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: input.trim() ? colors.primary : colors.textMuted,
                  borderRadius: radius.md,
                },
              ]}
              onPress={handleSubmit}
              disabled={!input.trim() || loading}
              accessibilityLabel="Add food"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[styles.submitButtonText, { color: colors.white }]}>Add</Text>
              )}
            </TouchableOpacity>
            {quickAddFoods.length > 0 && (
              <View style={styles.quickAddSection}>
                <Text style={[styles.quickAddLabel, { color: colors.textMuted }]}>Quick add</Text>
                <View style={styles.quickAddRow}>
                  {quickAddFoods.map((food) => (
                    <TouchableOpacity
                      key={food.id}
                      style={[styles.quickAddChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                      onPress={() => handleSelectFood(food)}
                      accessibilityLabel={`Quick add ${food.name}`}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.quickAddChipText, { color: colors.primary }]} numberOfLines={1}>
                        {food.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.libraryContainer}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.card,
                  borderRadius: radius.md,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Search your foods..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search your foods"
            />
            <FlatList
              data={filteredFoods}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.foodItem, { backgroundColor: colors.card, borderRadius: radius.md }]}
                  onPress={() => handleSelectFood(item)}
                  accessibilityLabel={`Add ${item.name}`}
                  accessibilityRole="button"
                >
                  <View>
                    <Text style={[styles.foodName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.foodServing, { color: colors.textSecondary }]}>
                      {item.serving_unit} · {item.calories_per_serving} kcal
                    </Text>
                  </View>
                  <Text style={[styles.timesUsed, { color: colors.textMuted }]}>Used {item.times_used}x</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  {searchQuery ? 'No foods found' : 'Your food library is empty'}
                </Text>
              }
            />
          </View>
        )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  teddyRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  cancelButton: {
    fontSize: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },
  inputContainer: {
    flex: 1,
    padding: 16,
  },
  inputWrapper: {
    position: 'relative',
  },
  textInput: {
    padding: 16,
    paddingRight: 56,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  micButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  listeningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(254, 242, 242, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  submitButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  libraryContainer: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  foodItem: {
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
  },
  foodServing: {
    fontSize: 14,
    marginTop: 2,
  },
  timesUsed: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
  },
  quickAddSection: {
    marginTop: 20,
  },
  quickAddLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickAddChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickAddChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
