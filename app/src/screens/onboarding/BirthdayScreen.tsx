import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { toISODateFromParts } from '../../utils/date';

interface Props {
  onContinue: (birthday: string) => void;
  onBack: () => void;
  initialValue?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function calculateAge(year: number, month: number, day: number): number {
  const today = new Date();
  const birthDate = new Date(year, month, day);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}


interface PickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: number) => void;
  options: { label: string; value: number }[];
  title: string;
  selectedValue: number;
}

function PickerModal({ visible, onClose, onSelect, options, title, selectedValue }: PickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.optionsList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  selectedValue === option.value && styles.optionItemSelected,
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedValue === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedValue === option.value && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export function BirthdayScreen({ onContinue, onBack, initialValue }: Props) {
  const currentYear = new Date().getFullYear();
  const defaultYear = currentYear - 30;

  const parseInitialValue = () => {
    if (initialValue) {
      const parts = initialValue.split('-');
      return {
        year: parseInt(parts[0]),
        month: parseInt(parts[1]) - 1,
        day: parseInt(parts[2]),
      };
    }
    return { year: defaultYear, month: 0, day: 1 };
  };

  const initial = parseInitialValue();
  const [month, setMonth] = useState<number | null>(initialValue ? initial.month : null);
  const [day, setDay] = useState<number | null>(initialValue ? initial.day : null);
  const [year, setYear] = useState<number | null>(initialValue ? initial.year : null);

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const hasSelected = month !== null && day !== null && year !== null;
  const age = hasSelected ? calculateAge(year!, month!, day!) : 0;
  const isValidAge = age >= 13 && age <= 120;

  // Generate year options (13 to 120 years ago)
  const yearOptions = [];
  for (let y = currentYear - 13; y >= currentYear - 120; y--) {
    yearOptions.push({ label: String(y), value: y });
  }

  // Generate month options
  const monthOptions = MONTHS.map((m, i) => ({ label: m, value: i }));

  // Generate day options based on selected month/year
  const daysInMonth = month !== null && year !== null ? getDaysInMonth(month, year) : 31;
  const dayOptions = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dayOptions.push({ label: String(d), value: d });
  }

  // Adjust day if it exceeds days in selected month
  if (day !== null && day > daysInMonth) {
    setDay(daysInMonth);
  }

  const handleContinue = () => {
    if (hasSelected && isValidAge) {
      onContinue(toISODateFromParts(year!, month!, day!));
    }
  };

  return (
    <OnboardingLayout
      currentStep={10}
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!hasSelected || !isValidAge}
    >
      <View style={styles.content}>
        <Text style={styles.label}>ABOUT YOU</Text>
        <Text style={styles.title}>When's your{'\n'}birthday?</Text>
        <Text style={styles.subtitle}>
          We use your age to calculate your metabolism. Your age updates automatically each year.
        </Text>

        <View style={styles.pickerRow}>
          {/* Month Picker */}
          <TouchableOpacity
            style={[styles.pickerButton, styles.pickerButtonMonth]}
            onPress={() => setShowMonthPicker(true)}
          >
            <Text style={[styles.pickerButtonText, month === null && styles.pickerPlaceholder]}>
              {month !== null ? MONTHS[month] : 'Month'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>

          {/* Day Picker */}
          <TouchableOpacity
            style={[styles.pickerButton, styles.pickerButtonDay]}
            onPress={() => setShowDayPicker(true)}
          >
            <Text style={[styles.pickerButtonText, day === null && styles.pickerPlaceholder]}>
              {day !== null ? String(day) : 'Day'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>

          {/* Year Picker */}
          <TouchableOpacity
            style={[styles.pickerButton, styles.pickerButtonYear]}
            onPress={() => setShowYearPicker(true)}
          >
            <Text style={[styles.pickerButtonText, year === null && styles.pickerPlaceholder]}>
              {year !== null ? String(year) : 'Year'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {hasSelected && (
          <View style={styles.ageDisplay}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <Text style={styles.ageText}>
              You are <Text style={styles.ageNumber}>{age}</Text> years old
            </Text>
          </View>
        )}

        {hasSelected && !isValidAge && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>
              {age < 13 ? 'You must be at least 13 years old' : 'Please enter a valid birth year'}
            </Text>
          </View>
        )}

        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
          <Text style={styles.privacyNoteText}>Your data is private and never shared</Text>
        </View>
      </View>

      <PickerModal
        visible={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        onSelect={setMonth}
        options={monthOptions}
        title="Select Month"
        selectedValue={month ?? -1}
      />

      <PickerModal
        visible={showDayPicker}
        onClose={() => setShowDayPicker(false)}
        onSelect={setDay}
        options={dayOptions}
        title="Select Day"
        selectedValue={day ?? -1}
      />

      <PickerModal
        visible={showYearPicker}
        onClose={() => setShowYearPicker(false)}
        onSelect={setYear}
        options={yearOptions}
        title="Select Year"
        selectedValue={year ?? -1}
      />
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
    marginBottom: 32,
    lineHeight: 24,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  pickerButtonMonth: {
    flex: 2,
  },
  pickerButtonDay: {
    flex: 1,
  },
  pickerButtonYear: {
    flex: 1.2,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  pickerPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  ageDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  ageText: {
    fontSize: 16,
    color: '#374151',
  },
  ageNumber: {
    fontWeight: '700',
    color: '#1D4ED8',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  privacyNoteText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  optionsList: {
    paddingBottom: 40,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#3B82F6',
  },
});
