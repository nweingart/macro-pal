import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../hooks/useToast';
import { useDevMode } from './DevModeContext';
import { MascotMood } from '../components/Mascot';
import { DataPreset } from './mockData';

// ── Segmented Control ──────────────────────────────────────────────

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  colors,
  radius,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  colors: any;
  radius: any;
}) {
  return (
    <View style={[segStyles.row, { backgroundColor: colors.background, borderRadius: radius.sm }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[
              segStyles.segment,
              active && { backgroundColor: colors.primary },
              { borderRadius: radius.sm },
            ]}
            onPress={() => onChange(opt.value)}
          >
            <Text
              style={[
                segStyles.segText,
                { color: active ? '#fff' : colors.textSecondary },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const segStyles = StyleSheet.create({
  row: { flexDirection: 'row', padding: 2 },
  segment: { flex: 1, paddingVertical: 6, alignItems: 'center' },
  segText: { fontSize: 12, fontWeight: '600' },
});

// ── Row helpers ────────────────────────────────────────────────────

function SwitchRow({
  label,
  value,
  onToggle,
  colors,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  colors: any;
}) {
  return (
    <View style={rowStyles.row}>
      <Text style={[rowStyles.label, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: { fontSize: 14, fontWeight: '500' },
});

// ── Section ────────────────────────────────────────────────────────

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={sectionStyles.section}>
      <Text style={[sectionStyles.title, { color: colors.textMuted }]}>{title}</Text>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  section: { marginBottom: 20 },
  title: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
});

// ── DevPanel ───────────────────────────────────────────────────────

const DATA_OPTIONS: { label: string; value: DataPreset }[] = [
  { label: 'Empty', value: 'empty' },
  { label: 'Light', value: 'light' },
  { label: 'Full',  value: 'full'  },
];

const MOOD_OPTIONS: { label: string; value: MascotMood | 'auto' }[] = [
  { label: 'Auto',   value: 'auto' },
  { label: 'Happy',  value: 'happy' },
  { label: 'Excited', value: 'excited' },
  { label: 'Think',  value: 'thinking' },
];

const MOOD_OPTIONS_2: { label: string; value: MascotMood | 'auto' }[] = [
  { label: 'Celebrate', value: 'celebrating' },
  { label: 'Sleepy', value: 'sleepy' },
];

export function DevPanel() {
  const [open, setOpen] = useState(false);
  const dev = useDevMode();
  const { colors, radius } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const moodValue: MascotMood | 'auto' = dev.moodOverride ?? 'auto';

  const handleMoodChange = (v: MascotMood | 'auto') => {
    dev.setMoodOverride(v === 'auto' ? null : v);
  };

  return (
    <>
      {/* Floating Pill */}
      <TouchableOpacity
        style={[
          styles.pill,
          {
            backgroundColor: dev.enabled ? colors.primary : colors.textMuted,
            borderRadius: radius.sm,
            bottom: insets.bottom + 88,
          },
        ]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.pillText}>DEV</Text>
      </TouchableOpacity>

      {/* Panel Modal */}
      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.backdrop}>
          <TouchableOpacity style={styles.backdropTouch} onPress={() => setOpen(false)} />
          <View
            style={[
              styles.panel,
              {
                backgroundColor: colors.card,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                paddingBottom: insets.bottom + 16,
              },
            ]}
          >
            {/* Handle */}
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            {/* Header */}
            <View style={styles.headerRow}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Dev Mode</Text>
              <Switch
                value={dev.enabled}
                onValueChange={dev.setEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
              {/* Auth & Gates */}
              <Section title="Auth & Gates" colors={colors}>
                <SwitchRow
                  label="Auth Bypass"
                  value={dev.authBypassed}
                  onToggle={dev.setAuthBypassed}
                  colors={colors}
                />
                <SwitchRow
                  label="Subscribed"
                  value={dev.subscriptionOverride}
                  onToggle={dev.setSubscriptionOverride}
                  colors={colors}
                />
                <SwitchRow
                  label="Onboarding Complete"
                  value={dev.onboardingComplete}
                  onToggle={dev.setOnboardingComplete}
                  colors={colors}
                />
              </Section>

              {/* Data Preset */}
              <Section title="Data Preset" colors={colors}>
                <SegmentedControl
                  options={DATA_OPTIONS}
                  value={dev.dataPreset}
                  onChange={dev.setDataPreset}
                  colors={colors}
                  radius={radius}
                />
              </Section>

              {/* Teddy Override */}
              <Section title="Teddy Mood" colors={colors}>
                <SegmentedControl
                  options={MOOD_OPTIONS}
                  value={moodValue}
                  onChange={handleMoodChange}
                  colors={colors}
                  radius={radius}
                />
                <View style={{ height: 6 }} />
                <SegmentedControl
                  options={MOOD_OPTIONS_2}
                  value={moodValue}
                  onChange={handleMoodChange}
                  colors={colors}
                  radius={radius}
                />
              </Section>

              {/* Quick Actions */}
              <Section title="Quick Actions" colors={colors}>
                <View style={styles.toastRow}>
                  <TouchableOpacity
                    style={[styles.toastBtn, { backgroundColor: colors.success, borderRadius: radius.sm }]}
                    onPress={() => toast.success('Dev success toast')}
                  >
                    <Ionicons name="checkmark-circle" size={14} color="#fff" />
                    <Text style={styles.toastBtnText}>Success</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toastBtn, { backgroundColor: colors.error, borderRadius: radius.sm }]}
                    onPress={() => toast.error('Dev error toast')}
                  >
                    <Ionicons name="close-circle" size={14} color="#fff" />
                    <Text style={styles.toastBtnText}>Error</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toastBtn, { backgroundColor: colors.warning, borderRadius: radius.sm }]}
                    onPress={() => toast.warning('Dev warning toast')}
                  >
                    <Ionicons name="warning" size={14} color="#fff" />
                    <Text style={styles.toastBtnText}>Warn</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toastBtn, { backgroundColor: colors.info, borderRadius: radius.sm }]}
                    onPress={() => toast.info('Dev info toast')}
                  >
                    <Ionicons name="information-circle" size={14} color="#fff" />
                    <Text style={styles.toastBtnText}>Info</Text>
                  </TouchableOpacity>
                </View>
              </Section>

              {/* Reset */}
              <TouchableOpacity
                style={[styles.resetBtn, { borderColor: colors.error, borderRadius: radius.md }]}
                onPress={() => {
                  dev.resetAll();
                  toast.info('Dev mode reset to defaults');
                }}
              >
                <Ionicons name="refresh" size={16} color={colors.error} />
                <Text style={[styles.resetText, { color: colors.error }]}>Reset All</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 9998,
    opacity: 0.85,
  },
  pillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  panel: {
    maxHeight: '75%',
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scroll: {
    flexGrow: 0,
  },
  toastRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toastBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  toastBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
