import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useFoodLibrary } from '../hooks/useFoodLibrary';
import { useTheme } from '../context/ThemeContext';
import { ProfileSettingsModal } from '../components/ProfileSettingsModal';
import { LegalModal } from '../components/LegalModal';
import { api } from '../services/api';

export function ProfileScreen() {
  const { colors, radius, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, signOut } = useAuth();
  const { isSubscribed } = useSubscription();
  const { foods } = useFoodLibrary();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');
  const [deleting, setDeleting] = useState(false);

  const initial = user?.email?.charAt(0).toUpperCase() || '?';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will permanently delete all your data including your food log, food library, and profile. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This is your last chance. All your data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete My Account',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setDeleting(true);
                      await api.deleteAccount();
                      await signOut();
                    } catch {
                      Alert.alert('Error', 'Failed to delete account. Please try again.');
                      setDeleting(false);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const openLegal = (tab: 'privacy' | 'terms') => {
    setLegalTab(tab);
    setLegalModalVisible(true);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      {/* User Header */}
      <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.lg }, shadows.small]}>
        <View style={styles.userRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.email, { color: colors.text }]} numberOfLines={1}>
              {user?.email}
            </Text>
            <View style={[styles.badge, { backgroundColor: isSubscribed ? colors.primaryLight : colors.borderLight }]}>
              <Text style={[styles.badgeText, { color: isSubscribed ? colors.primaryDark : colors.textSecondary }]}>
                {isSubscribed ? 'Pro' : 'Free Trial'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Navigation Rows */}
      <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.lg }, shadows.small]}>
        {/* Edit Profile */}
        <TouchableOpacity
          style={styles.navRow}
          onPress={() => setProfileModalVisible(true)}
          accessibilityLabel="Edit profile"
          accessibilityRole="button"
        >
          <View style={styles.navRowLeft}>
            <View style={[styles.navIcon, { backgroundColor: colors.infoLight }]}>
              <Ionicons name="person-outline" size={20} color={colors.info} />
            </View>
            <View>
              <Text style={[styles.navTitle, { color: colors.text }]}>Edit Profile</Text>
              <Text style={[styles.navSubtitle, { color: colors.textSecondary }]}>Body stats & preferences</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

        {/* My Targets */}
        <TouchableOpacity
          style={styles.navRow}
          onPress={() => navigation.navigate('MacroTargets')}
          accessibilityLabel="Go to my targets"
          accessibilityRole="button"
        >
          <View style={styles.navRowLeft}>
            <View style={[styles.navIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="nutrition-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.navTitle, { color: colors.text }]}>My Targets</Text>
              <Text style={[styles.navSubtitle, { color: colors.textSecondary }]}>Calorie & macro goals</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

        {/* Food Library */}
        <TouchableOpacity
          style={styles.navRow}
          onPress={() => navigation.navigate('FoodLibrary')}
          accessibilityLabel="Go to food library"
          accessibilityRole="button"
        >
          <View style={styles.navRowLeft}>
            <View style={[styles.navIcon, { backgroundColor: colors.successLight }]}>
              <Ionicons name="book-outline" size={20} color={colors.success} />
            </View>
            <View>
              <Text style={[styles.navTitle, { color: colors.text }]}>Food Library</Text>
              <Text style={[styles.navSubtitle, { color: colors.textSecondary }]}>
                {foods.length} saved food{foods.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.lg }, shadows.small]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>

        <TouchableOpacity style={styles.accountRow} onPress={() => openLegal('privacy')} accessibilityLabel="View privacy policy" accessibilityRole="button">
          <Text style={[styles.accountRowText, { color: colors.text }]}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

        <TouchableOpacity style={styles.accountRow} onPress={() => openLegal('terms')} accessibilityLabel="View terms of service" accessibilityRole="button">
          <Text style={[styles.accountRowText, { color: colors.text }]}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

        <TouchableOpacity style={styles.accountRow} onPress={handleSignOut} accessibilityLabel="Sign out" accessibilityRole="button">
          <Text style={[styles.accountRowText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

        <TouchableOpacity style={styles.accountRow} onPress={handleDeleteAccount} disabled={deleting} accessibilityLabel="Delete account" accessibilityRole="button">
          <Text style={[styles.accountRowText, { color: colors.textMuted }]}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <ProfileSettingsModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />

      <LegalModal
        visible={legalModalVisible}
        onClose={() => setLegalModalVisible(false)}
        initialTab={legalTab}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  section: {
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 14,
  },
  // User header
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Navigation rows
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  navIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  navSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  rowDivider: {
    height: 1,
  },
  // Account rows
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  accountRowText: {
    fontSize: 15,
  },
});
