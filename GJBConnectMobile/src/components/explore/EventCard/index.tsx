import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, MapPin, Users, Clock, Eye, MoreVertical, Edit2, Trash2 } from 'lucide-react-native';
import { Event } from '../../../types';
import { formatTimeAgo } from '../../../utils/formatters';
import { useEvents } from '../../../hooks/useEvents';
import { useAuthStore } from '../../../store/authStore';
import VerifiedBadge from '../../shared/VerifiedBadge';

interface Props {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

export const EventCard: React.FC<Props> = ({ event, onEdit, onDelete }) => {
  const { toggleRSVP } = useEvents({});
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = event.organizer_id === user?.id;
  const hasRSVPed = event.user_rsvp_status !== null;

  const formatEventDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const handleRSVP = useCallback(async () => {
    if (isOwner || hasRSVPed) return;
    try {
      await toggleRSVP({ eventId: event.id, status: 'going' });
    } catch (error) {
      Alert.alert('Error', 'Failed to RSVP');
    }
  }, [event.id, isOwner, hasRSVPed, toggleRSVP]);

  const getRSVPButtonStyle = useCallback((): any[] => {
    if (isOwner) {
      return [styles.rsvpButton, styles.rsvpButtonOwner];
    }
    if (hasRSVPed) {
      return [styles.rsvpButton, styles.rsvpButtonGoing];
    }
    return [styles.rsvpButton, styles.rsvpButtonDefault];
  }, [isOwner, hasRSVPed]);

  const getButtonText = useCallback((): string => {
    if (isOwner) return "Your Event";
    if (hasRSVPed) return "Going ✓";
    return "RSVP Now";
  }, [isOwner, hasRSVPed]);

  return (
    <View style={styles.card}>
      <LinearGradient colors={['#fff', '#f9fafb']} style={styles.gradient}>
        {/* Header with image */}
        <View style={styles.imageContainer}>
          {event.image_url ? (
            <Image source={{ uri: event.image_url }} style={styles.image} />
          ) : (
            <LinearGradient colors={['#16a34a', '#15803d']} style={styles.imagePlaceholder}>
              <Calendar size={32} color="#fff" />
            </LinearGradient>
          )}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.3)']} style={styles.imageOverlay} />

          {/* RSVP count badge */}
          <View style={styles.rsvpBadge}>
            <Users size={12} color="#16a34a" />
            <Text style={styles.rsvpBadgeText}>{event.rsvp_count}</Text>
          </View>

          {/* Owner menu */}
          {isOwner && (
            <View style={styles.menuContainer}>
              <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.menuButton}>
                <MoreVertical size={16} color="#374151" />
              </TouchableOpacity>
              {showMenu && (
                <View style={styles.menuDropdown}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => { onEdit(event); setShowMenu(false); }}
                  >
                    <Edit2 size={12} color="#374151" />
                    <Text style={styles.menuItemText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.menuItem, styles.menuItemDanger]}
                    onPress={() => { onDelete(event.id); setShowMenu(false); }}
                  >
                    <Trash2 size={12} color="#dc2626" />
                    <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and verified badge */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
            {event.organizer_verified && <VerifiedBadge size={14} />}
          </View>

          {/* Organizer */}
          <View style={styles.organizerContainer}>
            <View style={styles.organizerAvatar}>
              {event.organizer_avatar ? (
                <Image source={{ uri: event.organizer_avatar }} style={styles.avatar} />
              ) : (
                <LinearGradient colors={['#16a34a', '#15803d']} style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{event.organizer_name?.charAt(0).toUpperCase() || 'O'}</Text>
                </LinearGradient>
              )}
              {event.organizer_verified && (
                <View style={styles.organizerBadge}>
                  <VerifiedBadge size={10} />
                </View>
              )}
            </View>
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerLabel}>Organized by</Text>
              <Text style={styles.organizerName} numberOfLines={1}>{event.organizer_name}</Text>
            </View>
          </View>

          {/* Details grid */}
          <View style={styles.detailsGrid}>
            {/* Date & Time */}
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: '#f0fdf4' }]}>
                <Calendar size={14} color="#16a34a" />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{formatEventDate(event.event_date)}</Text>
              </View>
            </View>

            {/* Location */}
            {event.location && (
              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: '#f0fdf4' }]}>
                  <MapPin size={14} color="#16a34a" />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{event.location}</Text>
                </View>
              </View>
            )}

            {/* Posted */}
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: '#f3e8ff' }]}>
                <Clock size={14} color="#9333ea" />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Posted</Text>
                <Text style={styles.detailValue}>{formatTimeAgo(event.created_at)}</Text>
              </View>
            </View>

            {/* Attendees */}
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: '#fff7ed' }]}>
                <Eye size={14} color="#f97316" />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Attendees</Text>
                <Text style={styles.detailValue}>{event.rsvp_count}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {event.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>About this event</Text>
              <Text style={styles.description} numberOfLines={2}>{event.description}</Text>
            </View>
          )}

          {/* RSVP Button */}
          <TouchableOpacity
            style={getRSVPButtonStyle()}
            onPress={handleRSVP}
            disabled={isOwner || hasRSVPed}
          >
            <Text style={styles.rsvpButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gradient: {
    flex: 1,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  rsvpBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rsvpBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1f2937',
  },
  menuContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },
  menuButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuDropdown: {
    position: 'absolute',
    top: 32,
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 100,
    zIndex: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  menuItemText: {
    fontSize: 12,
    color: '#374151',
  },
  menuItemTextDanger: {
    color: '#dc2626',
  },
  content: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  organizerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  organizerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  organizerName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1f2937',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '48%', // approx 2 per row
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1f2937',
  },
  descriptionContainer: {
    marginBottom: 12,
  },
  descriptionLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    color: '#4b5563',
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rsvpButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  rsvpButtonDefault: {
    backgroundColor: '#16a34a',
  },
  rsvpButtonGoing: {
    backgroundColor: '#16a34a',
  },
  rsvpButtonOwner: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  rsvpButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
