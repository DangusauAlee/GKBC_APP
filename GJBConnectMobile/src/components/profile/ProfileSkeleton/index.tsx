import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const ProfileSkeleton = () => {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
        {/* Header skeleton */}
        <View style={styles.header} />
        
        {/* Cover skeleton */}
        <View style={styles.cover} />
        
        {/* Avatar skeleton */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar} />
        </View>
        
        {/* Info skeleton */}
        <View style={styles.info}>
          <View style={styles.nameLine} />
          <View style={styles.bioLine} />
          <View style={styles.bioLine} />
          
          {/* Stats skeleton */}
          <View style={styles.statsRow}>
            <View style={styles.statBox} />
            <View style={styles.statBox} />
          </View>
          
          {/* Action button skeleton */}
          <View style={styles.actionButton} />
        </View>
        
        {/* Tabs skeleton */}
        <View style={styles.tabs}>
          <View style={styles.tab} />
          <View style={styles.tab} />
        </View>
        
        {/* Content skeleton */}
        <View style={styles.content}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.postCard} />
          ))}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    height: 60,
    backgroundColor: '#fff',
  },
  cover: {
    height: 144,
    backgroundColor: '#e5e7eb',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -48,
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#d1d5db',
    borderWidth: 4,
    borderColor: '#fff',
  },
  info: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  nameLine: {
    width: 150,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  bioLine: {
    width: 200,
    height: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
    width: '100%',
  },
  statBox: {
    flex: 1,
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
  },
  actionButton: {
    width: '80%',
    height: 48,
    backgroundColor: '#16a34a',
    borderRadius: 30,
    opacity: 0.5,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginTop: 8,
  },
  tab: {
    flex: 1,
    height: 48,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  postCard: {
    height: 200,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
});
