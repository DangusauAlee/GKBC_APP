import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FileText, Users } from 'lucide-react-native';

interface ProfileStatsProps {
  postsCount: number;
  connectionsCount: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  postsCount,
  connectionsCount,
  activeTab,
  onTabChange,
}) => {
  const stats = [
    { key: 'posts', icon: FileText, label: 'Posts', count: postsCount },
    { key: 'connections', icon: Users, label: 'Connections', count: connectionsCount },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isActive = activeTab === stat.key;
          return (
            <TouchableOpacity
              key={stat.key}
              style={[styles.statCard, isActive && styles.statCardActive]}
              onPress={() => onTabChange(stat.key)}
            >
              <Icon size={24} color={isActive ? '#16a34a' : '#6b7280'} />
              <Text style={[styles.statCount, isActive && styles.statCountActive]}>
                {stat.count}
              </Text>
              <Text style={[styles.statLabel, isActive && styles.statLabelActive]}>
                {stat.label}
              </Text>
              {isActive && (
                <LinearGradient
                  colors={['#16a34a', '#15803d']}
                  style={styles.activeIndicator}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
    overflow: 'hidden',
  },
  statCardActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  statCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  statCountActive: {
    color: '#16a34a',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statLabelActive: {
    color: '#16a34a',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
