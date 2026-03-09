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
import { Shield, ArrowLeft, Eye, Database, Cookie, Trash2, Mail } from 'lucide-react-native';

export const PrivacyScreen: React.FC = () => {
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
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <Text style={styles.headerSubtitle}>How we protect and handle your data</Text>
            <Text style={styles.headerDate}>Effective: December 2025</Text>
          </LinearGradient>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {/* Introduction */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Our Commitment</Text>
              <Text style={styles.paragraph}>
                At Greater Jigawa Business Council (GJBC), we respect your privacy. This Privacy Policy explains
                how we collect, use, and safeguard your information when you use our platform.
              </Text>
            </View>

            {/* Information We Collect */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Information We Collect</Text>
              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Eye size={24} color="#16a34a" />
                  <Text style={styles.gridItemTitle}>Personal Data</Text>
                  <Text style={styles.gridItemText}>Name, email, phone, business details, profile information.</Text>
                </View>
                <View style={styles.gridItem}>
                  <Database size={24} color="#16a34a" />
                  <Text style={styles.gridItemTitle}>Usage Data</Text>
                  <Text style={styles.gridItemText}>Interactions, posts, messages, device info, IP address.</Text>
                </View>
              </View>
            </View>

            {/* How We Use Your Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How We Use Your Information</Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• Provide and maintain the Service.</Text>
                <Text style={styles.bulletItem}>• Personalize your experience and connect you with relevant businesses.</Text>
                <Text style={styles.bulletItem}>• Send notifications, updates, and support messages.</Text>
                <Text style={styles.bulletItem}>• Improve our platform through analytics and research.</Text>
                <Text style={styles.bulletItem}>• Ensure security and prevent fraud.</Text>
              </View>
            </View>

            {/* Sharing Your Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sharing Your Information</Text>
              <Text style={styles.paragraph}>
                We do not sell your personal data. We may share information with:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• Other members (as part of your public profile and activities).</Text>
                <Text style={styles.bulletItem}>• Service providers who assist in operating the platform.</Text>
                <Text style={styles.bulletItem}>• Legal authorities when required by law.</Text>
              </View>
            </View>

            {/* Cookies & Tracking */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cookies & Tracking</Text>
              <View style={styles.cookieBox}>
                <Cookie size={24} color="#16a34a" />
                <Text style={styles.cookieText}>
                  We use cookies to enhance your experience. You can control cookies through your browser settings.
                  By continuing to use GJBC, you consent to our use of cookies.
                </Text>
              </View>
            </View>

            {/* Your Rights */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Rights</Text>
              <View style={styles.rightsGrid}>
                <View style={styles.rightsItem}><Eye size={16} color="#16a34a" /><Text style={styles.rightsText}>Access your data</Text></View>
                <View style={styles.rightsItem}><Database size={16} color="#16a34a" /><Text style={styles.rightsText}>Correct inaccuracies</Text></View>
                <View style={styles.rightsItem}><Trash2 size={16} color="#16a34a" /><Text style={styles.rightsText}>Request deletion</Text></View>
                <View style={styles.rightsItem}><Mail size={16} color="#16a34a" /><Text style={styles.rightsText}>Opt out of marketing</Text></View>
              </View>
            </View>

            {/* Security, Children, Changes, Contact */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security</Text>
              <Text style={styles.paragraph}>
                We implement industry-standard measures to protect your data. However, no method of transmission
                over the internet is 100% secure.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Children's Privacy</Text>
              <Text style={styles.paragraph}>
                Our Service is not intended for individuals under 18. We do not knowingly collect data from minors.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Changes to This Policy</Text>
              <Text style={styles.paragraph}>
                We may update this Privacy Policy periodically. We will notify you of material changes via email
                or a prominent notice.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Us</Text>
              <Text style={styles.paragraph}>
                If you have questions, email us at{' '}
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
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  paragraph: { fontSize: 14, color: '#4b5563', lineHeight: 22 },
  grid: { flexDirection: 'row', gap: 12, marginTop: 8 },
  gridItem: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  gridItemTitle: { fontSize: 14, fontWeight: '600', color: '#166534', marginTop: 8, marginBottom: 4 },
  gridItemText: { fontSize: 12, color: '#166534' },
  bulletList: { paddingLeft: 16 },
  bulletItem: { fontSize: 14, color: '#4b5563', lineHeight: 24 },
  cookieBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  cookieText: { flex: 1, fontSize: 14, color: '#1e3a8a' },
  rightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  rightsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  rightsText: { fontSize: 13, color: '#166534' },
  link: { color: '#16a34a', fontWeight: '600', textDecorationLine: 'underline' },
  footerNote: { marginTop: 16, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#9ca3af' },
});
