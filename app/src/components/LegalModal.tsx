import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type Tab = 'privacy' | 'terms';

interface Props {
  visible: boolean;
  onClose: () => void;
  initialTab?: Tab;
}

export function LegalModal({ visible, onClose, initialTab = 'privacy' }: Props) {
  const { colors, radius } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Legal</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'privacy' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab('privacy')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'privacy' ? colors.primary : colors.textMuted },
              ]}
            >
              Privacy Policy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'terms' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab('terms')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'terms' ? colors.primary : colors.textMuted },
              ]}
            >
              Terms of Service
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {activeTab === 'privacy' ? <PrivacyPolicy colors={colors} /> : <TermsOfService colors={colors} />}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function SectionTitle({ children, colors }: { children: string; colors: any }) {
  return <Text style={[styles.sectionTitle, { color: colors.text }]}>{children}</Text>;
}

function Paragraph({ children, colors }: { children: string; colors: any }) {
  return <Text style={[styles.paragraph, { color: colors.textSecondary }]}>{children}</Text>;
}

function PrivacyPolicy({ colors }: { colors: any }) {
  return (
    <View>
      <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>Last updated: February 2026</Text>

      <SectionTitle colors={colors}>1. Information We Collect</SectionTitle>
      <Paragraph colors={colors}>
        When you create an account, we collect your email address and password (stored securely via Supabase Authentication). You may optionally provide profile information such as gender, age, height, weight, activity level, and dietary goals to receive personalized macro targets.
      </Paragraph>
      <Paragraph colors={colors}>
        When you log food, we store the food descriptions you enter, the nutritional data generated from those descriptions, and your daily meal log history.
      </Paragraph>
      <Paragraph colors={colors}>
        If you use the voice input feature, audio is processed on-device using Apple's Speech Recognition framework. We do not store or transmit audio recordings.
      </Paragraph>

      <SectionTitle colors={colors}>2. How We Use Your Information</SectionTitle>
      <Paragraph colors={colors}>
        We use your information to provide the core functionality of Macro Pal: tracking your daily food intake, calculating nutritional information, and providing personalized macro and calorie targets. Your food descriptions are sent to an AI service to parse nutritional data.
      </Paragraph>

      <SectionTitle colors={colors}>3. Data Storage and Security</SectionTitle>
      <Paragraph colors={colors}>
        Your data is stored securely using Supabase, which provides row-level security ensuring you can only access your own data. All data is transmitted over HTTPS. Passwords are hashed and never stored in plain text.
      </Paragraph>

      <SectionTitle colors={colors}>4. Third-Party Services</SectionTitle>
      <Paragraph colors={colors}>
        We use the following third-party services: Supabase for authentication and data storage, and Anthropic's Claude AI for parsing food descriptions into nutritional data. Food descriptions you enter are sent to Anthropic for processing. Please refer to Anthropic's privacy policy for details on how they handle data.
      </Paragraph>

      <SectionTitle colors={colors}>5. Data Retention and Deletion</SectionTitle>
      <Paragraph colors={colors}>
        Your data is retained as long as your account is active. You can delete your account at any time from the Profile Settings screen. When you delete your account, all associated data (profile, food library, and meal logs) is permanently removed from our servers.
      </Paragraph>

      <SectionTitle colors={colors}>6. Your Rights</SectionTitle>
      <Paragraph colors={colors}>
        You have the right to access, correct, and delete your personal data at any time through the app. You can update your profile information in Profile Settings and delete individual food log entries from the Today screen.
      </Paragraph>

      <SectionTitle colors={colors}>7. Children's Privacy</SectionTitle>
      <Paragraph colors={colors}>
        Macro Pal is not intended for use by children under 13. We do not knowingly collect personal information from children under 13.
      </Paragraph>

      <SectionTitle colors={colors}>8. Changes to This Policy</SectionTitle>
      <Paragraph colors={colors}>
        We may update this privacy policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this policy.
      </Paragraph>

      <SectionTitle colors={colors}>9. Contact Us</SectionTitle>
      <Paragraph colors={colors}>
        If you have questions about this privacy policy or your data, please contact us at support@macropal.app.
      </Paragraph>
    </View>
  );
}

function TermsOfService({ colors }: { colors: any }) {
  return (
    <View>
      <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>Last updated: February 2026</Text>

      <SectionTitle colors={colors}>1. Acceptance of Terms</SectionTitle>
      <Paragraph colors={colors}>
        By creating an account or using Macro Pal, you agree to these Terms of Service. If you do not agree, please do not use the app.
      </Paragraph>

      <SectionTitle colors={colors}>2. Description of Service</SectionTitle>
      <Paragraph colors={colors}>
        Macro Pal is a nutrition tracking application that allows you to log food intake, track macronutrients (calories, protein, carbohydrates, and fat), and view estimated micronutrient information. The app uses AI to parse natural language food descriptions into nutritional data.
      </Paragraph>

      <SectionTitle colors={colors}>3. Account Responsibilities</SectionTitle>
      <Paragraph colors={colors}>
        You are responsible for maintaining the security of your account credentials. You must provide a valid email address to create an account. You agree not to share your account with others or create multiple accounts.
      </Paragraph>

      <SectionTitle colors={colors}>4. Nutritional Information Disclaimer</SectionTitle>
      <Paragraph colors={colors}>
        All nutritional information provided by Macro Pal is estimated using AI and may not be perfectly accurate. This information is for general informational purposes only and should not be considered medical or dietary advice. Always consult a qualified healthcare professional or registered dietitian before making significant changes to your diet.
      </Paragraph>

      <SectionTitle colors={colors}>5. Acceptable Use</SectionTitle>
      <Paragraph colors={colors}>
        You agree to use Macro Pal only for its intended purpose of personal nutrition tracking. You agree not to abuse the service, attempt to access other users' data, or use automated systems to make excessive requests.
      </Paragraph>

      <SectionTitle colors={colors}>6. Intellectual Property</SectionTitle>
      <Paragraph colors={colors}>
        The Macro Pal app, including its design, features, and content, is owned by Macro Pal and protected by applicable intellectual property laws. Your food log data remains yours.
      </Paragraph>

      <SectionTitle colors={colors}>7. Limitation of Liability</SectionTitle>
      <Paragraph colors={colors}>
        Macro Pal is provided "as is" without warranties of any kind. We are not liable for any health outcomes resulting from use of the app or reliance on the nutritional information provided. We are not responsible for data loss due to circumstances beyond our control.
      </Paragraph>

      <SectionTitle colors={colors}>8. Account Termination</SectionTitle>
      <Paragraph colors={colors}>
        You may delete your account at any time. We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior.
      </Paragraph>

      <SectionTitle colors={colors}>9. Changes to Terms</SectionTitle>
      <Paragraph colors={colors}>
        We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the updated terms.
      </Paragraph>

      <SectionTitle colors={colors}>10. Contact</SectionTitle>
      <Paragraph colors={colors}>
        For questions about these terms, please contact us at support@macropal.app.
      </Paragraph>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 13,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
});
