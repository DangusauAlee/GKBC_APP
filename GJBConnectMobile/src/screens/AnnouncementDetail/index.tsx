import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Calendar, User } from 'lucide-react-native';
import { format } from 'date-fns';
interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string | null;
  author?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const AnnouncementDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id } = route.params;

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

  const fetchAnnouncement = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          author:profiles!created_by (
            first_name,
            last_name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setAnnouncement(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load announcement');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonMeta} />
            <View style={styles.skeletonParagraph} />
            <View style={styles.skeletonParagraph} />
            <View style={styles.skeletonParagraph} />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error || !announcement) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Announcement not found</Text>
            <Text style={styles.errorMessage}>
              {error || 'The announcement may have been removed.'}
            </Text>
            <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
              <Text style={styles.errorButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={20} color="#16a34a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Announcement
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>{announcement.title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Calendar size={14} color="#6b7280" />
                <Text style={styles.metaText}>{formatDate(announcement.created_at)}</Text>
              </View>
              {announcement.author && (
                <View style={styles.metaItem}>
                  <User size={14} color="#6b7280" />
                  <Text style={styles.metaText}>
                    {announcement.author.first_name} {announcement.author.last_name}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.contentDivider} />

            <Text style={styles.content}>
              {announcement.content.split('\n').map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  {idx < announcement.content.split('\n').length - 1 && <Text>{'\n'}</Text>}
                </React.Fragment>
              ))}
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
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#16a34a',
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#16a34a',
    bottom: 100,
    left: -50,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#16a34a',
    top: '30%',
    right: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
  },
  contentDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  skeletonContainer: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  skeletonTitle: {
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    width: '80%',
    marginBottom: 12,
  },
  skeletonMeta: {
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    width: '40%',
    marginBottom: 16,
  },
  skeletonParagraph: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
