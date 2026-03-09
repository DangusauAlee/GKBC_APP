import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Shield, ArrowLeft } from 'lucide-react-native';

export const TermsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f9fafb', '#ffffff']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#16a34a" />
          </TouchableOpacity>
          <LinearGradient colors={['#16a34a', '#15803d']} style={styles.headerGradient}>
            <Shield size={48} color="#fff" />
            <Text style={styles.headerTitle}>Terms and Conditions</Text>
            <Text style={styles.headerSubtitle}>Greater Jigawa Business Council</Text>
            <Text style={styles.headerDate}>Last Updated: December 2025</Text>
          </LinearGradient>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* 1. Acceptance of Terms */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>1</Text>
                </View>
                <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
              </View>
              <Text style={styles.paragraph}>
                By accessing or using the GJBC platform (“Service”), you agree to be bound by these Terms.
                If you do not agree, you may not use the Service. These terms apply to all members, businesses,
                and visitors of the Greater Jigawa Business Council community.
              </Text>
            </View>

            {/* 2. Eligibility */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>2</Text>
                </View>
                <Text style={styles.sectionTitle}>Eligibility</Text>
              </View>
              <Text style={styles.paragraph}>
                You must be at least 18 years old to use the Service. By agreeing to these Terms, you represent
                and warrant that you are of legal age to form a binding contract.
              </Text>
            </View>

            {/* 3. Account Registration */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>3</Text>
                </View>
                <Text style={styles.sectionTitle}>Account Registration</Text>
              </View>
              <Text style={styles.paragraph}>
                You are responsible for maintaining the confidentiality of your account credentials. You agree
                to notify us immediately of any unauthorized use. You are liable for all activities under your
                account.
              </Text>
            </View>

            {/* 4. User Conduct */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>4</Text>
                </View>
                <Text style={styles.sectionTitle}>User Conduct</Text>
              </View>
              <Text style={styles.paragraph}>You agree not to:</Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• Post false, misleading, or fraudulent content</Text>
                <Text style={styles.bulletItem}>• Harass, abuse, or harm others</Text>
                <Text style={styles.bulletItem}>• Violate any applicable laws</Text>
                <Text style={styles.bulletItem}>• Attempt to gain unauthorized access</Text>
                <Text style={styles.bulletItem}>• Use the Service for spam or unsolicited advertising</Text>
              </View>
            </View>

            {/* 5. Content Ownership */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>5</Text>
                </View>
                <Text style={styles.sectionTitle}>Content Ownership</Text>
              </View>
              <Text style={styles.paragraph}>
                You retain ownership of content you post. By posting, you grant GJBC a non-exclusive, worldwide,
                royalty-free license to use, display, and distribute your content to provide the Service.
              </Text>
            </View>

            {/* 6. Verified Members */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>6</Text>
                </View>
                <Text style={styles.sectionTitle}>Verified Members</Text>
              </View>
              <Text style={styles.paragraph}>
                Verified membership requires payment of an annual fee and submission of a receipt. Verification
                status may be revoked for violations. Fees are non-refundable.
              </Text>
            </View>

            {/* 7. Termination */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>7</Text>
                </View>
                <Text style={styles.sectionTitle}>Termination</Text>
              </View>
              <Text style={styles.paragraph}>
                We may suspend or terminate your account for violations of these Terms. You may delete your
                account at any time.
              </Text>
            </View>

            {/* 8. Limitation of Liability */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>8</Text>
                </View>
                <Text style={styles.sectionTitle}>Limitation of Liability</Text>
              </View>
              <Text style={styles.paragraph}>
                GJBC is not liable for indirect, incidental, or consequential damages arising from your use of
                the Service, to the fullest extent permitted by law.
              </Text>
            </View>

            {/* 9. Changes to Terms */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>9</Text>
                </View>
                <Text style={styles.sectionTitle}>Changes to Terms</Text>
              </View>
              <Text style={styles.paragraph}>
                We may update these Terms from time to time. We will notify you of material changes. Continued
                use constitutes acceptance.
              </Text>
            </View>

            {/* 10. Contact */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>10</Text>
                </View>
                <Text style={styles.sectionTitle}>Contact Us</Text>
              </View>
              <Text style={styles.paragraph}>
                For questions, email us at{' '}
                <Text style={styles.link} onPress={() => {}}>support@GJBC.com</Text>.
              </Text>
            </View>
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Greater Jigawa Business Council. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  header: { marginBottom: 20 },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 12, textAlign: 'center' },
  headerSubtitle: { fontSize: 14, color: '#e5e7eb', marginTop: 4, textAlign: 'center' },
  headerDate: { fontSize: 12, color: '#d1d5db', marginTop: 8 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 20,
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
  },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionNumberText: { fontSize: 16, fontWeight: 'bold', color: '#16a34a' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  paragraph: { fontSize: 14, color: '#4b5563', lineHeight: 22 },
  bulletList: { marginTop: 8, paddingLeft: 16 },
  bulletItem: { fontSize: 14, color: '#4b5563', lineHeight: 24 },
  link: { color: '#16a34a', fontWeight: '600', textDecorationLine: 'underline' },
  footerNote: { marginTop: 16, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#9ca3af' },
});
