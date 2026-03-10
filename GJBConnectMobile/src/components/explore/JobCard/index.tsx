import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Briefcase, Clock, Mail, Phone, Building, Eye, MoreVertical, Edit2, Trash2 } from 'lucide-react-native';
import { Job } from '../../../types';
import { formatTimeAgo } from '../../../utils/formatters';
import { useJobs } from '../../../hooks/useJobs';
import { useAuthStore } from '../../../store/authStore';
import VerifiedBadge from '../../shared/VerifiedBadge';

interface Props {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
}

export const JobCard: React.FC<Props> = React.memo(({ job, onEdit, onDelete }) => {
  const { incrementViews } = useJobs();
  const { user } = useAuthStore();
  const [showContact, setShowContact] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = job.company_id === user?.id;

  const formatSalary = useCallback((salary: string): string => {
    if (!salary) return '';
    if (salary.toLowerCase().includes('negotiable') || salary.toLowerCase().includes('competitive')) {
      return salary;
    }
    return salary.startsWith('₦') || salary.startsWith('$') || salary.startsWith('€') || salary.startsWith('£')
      ? salary
      : `₦${salary}`;
  }, []);

  const handleShowContact = useCallback(() => {
    if (!showContact) {
      incrementViews(job.id);
    }
    setShowContact(true);
  }, [showContact, job.id, incrementViews]);

  const getJobTypeStyle = useCallback((): any => {
    switch (job.job_type?.toLowerCase()) {
      case 'full-time':
        return styles.typeFullTime;
      case 'part-time':
        return styles.typePartTime;
      case 'contract':
        return styles.typeContract;
      case 'remote':
        return styles.typeRemote;
      default:
        return styles.typeDefault;
    }
  }, [job.job_type]);

  return (
    <View style={styles.card}>
      <LinearGradient colors={['#fff', '#f9fafb']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyRow}>
            <View style={styles.avatarWrapper}>
              {job.company_avatar ? (
                <Image source={{ uri: job.company_avatar }} style={styles.avatar} />
              ) : (
                <LinearGradient colors={['#16a34a', '#15803d']} style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{job.company_name?.charAt(0) || 'C'}</Text>
                </LinearGradient>
              )}
              {job.company_verified && (
                <View style={styles.verifiedBadge}>
                  <VerifiedBadge size={16} />
                </View>
              )}
            </View>

            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
                {job.is_verified && <VerifiedBadge size={14} />}
              </View>
              <View style={styles.companyNameRow}>
                <Building size={12} color="#16a34a" />
                <Text style={styles.companyName} numberOfLines={1}>{job.company_name}</Text>
              </View>
            </View>

            {job.salary && (
              <LinearGradient colors={['#16a34a', '#15803d']} style={styles.salaryBadge}>
                <Text style={styles.salaryText}>{formatSalary(job.salary)}</Text>
              </LinearGradient>
            )}

            {isOwner && (
              <View style={styles.menuContainer}>
                <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.menuButton}>
                  <MoreVertical size={16} color="#374151" />
                </TouchableOpacity>
                {showMenu && (
                  <View style={styles.menuDropdown}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => { onEdit(job); setShowMenu(false); }}
                    >
                      <Edit2 size={12} color="#374151" />
                      <Text style={styles.menuItemText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.menuItem, styles.menuItemDanger]}
                      onPress={() => { onDelete(job.id); setShowMenu(false); }}
                    >
                      <Trash2 size={12} color="#dc2626" />
                      <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsGrid}>
          {/* Job Type */}
          <View style={[styles.detailItem, getJobTypeStyle()]}>
            <Briefcase size={14} color={getJobTypeStyle().color} />
            <Text style={[styles.detailText, { color: getJobTypeStyle().color }]}>{job.job_type}</Text>
          </View>

          {/* Location */}
          {job.location && (
            <View style={styles.detailItem}>
              <MapPin size={14} color="#6b7280" />
              <Text style={styles.detailText} numberOfLines={1}>{job.location}</Text>
            </View>
          )}

          {/* Posted */}
          <View style={styles.detailItem}>
            <Clock size={14} color="#6b7280" />
            <Text style={styles.detailText}>{formatTimeAgo(job.created_at)}</Text>
          </View>

          {/* Views */}
          <View style={styles.detailItem}>
            <Eye size={14} color="#6b7280" />
            <Text style={styles.detailText}>{job.views_count}</Text>
          </View>
        </View>

        {/* Description */}
        {job.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Job Description</Text>
            <Text style={styles.description} numberOfLines={3}>{job.description}</Text>
          </View>
        )}

        {/* Contact Section */}
        {!showContact ? (
          <TouchableOpacity style={styles.contactButton} onPress={handleShowContact}>
            <Text style={styles.contactButtonText}>Show Contact & Apply</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.contactContainer}>
            <Text style={styles.contactTitle}>Contact Information</Text>
            {job.contact_email && (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => Linking.openURL(`mailto:${job.contact_email}`)}
              >
                <Mail size={14} color="#16a34a" />
                <Text style={styles.contactItemText} numberOfLines={1}>{job.contact_email}</Text>
              </TouchableOpacity>
            )}
            {job.contact_phone && (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => Linking.openURL(`tel:${job.contact_phone.replace(/\D/g, '')}`)}
              >
                <Phone size={14} color="#16a34a" />
                <Text style={styles.contactItemText} numberOfLines={1}>{job.contact_phone}</Text>
              </TouchableOpacity>
            )}
            {!job.contact_email && !job.contact_phone && (
              <Text style={styles.noContact}>No contact details provided</Text>
            )}
          </View>
        )}
      </LinearGradient>
    </View>
  );
});

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
    padding: 12,
  },
  header: {
    marginBottom: 12,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  companyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  companyName: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '500',
  },
  salaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  salaryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  menuDropdown: {
    position: 'absolute',
    top: 28,
    right: 0,
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
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  typeFullTime: {
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe',
  },
  typePartTime: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
  },
  typeContract: {
    backgroundColor: '#f3e8ff',
    borderColor: '#e9d5ff',
  },
  typeRemote: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  typeDefault: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
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
    lineHeight: 16,
  },
  contactButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  contactContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contactTitle: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  contactItemText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
    flex: 1,
  },
  noContact: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
