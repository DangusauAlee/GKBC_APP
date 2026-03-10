import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Filter, Plus, Briefcase, Calendar, AlertCircle } from 'lucide-react-native';
import { useJobs } from '../../hooks/useJobs';
import { useEvents } from '../../hooks/useEvents';
import { useAuthStore } from '../../store/authStore';
import { JobCard } from '../../components/explore/JobCard';
import { EventCard } from '../../components/explore/EventCard';
import { CreateJobModal } from '../../components/explore/CreateJobModal';
import { CreateEventModal } from '../../components/explore/CreateEventModal';
import { EditJobModal } from '../../components/explore/EditJobModal';
import { EditEventModal } from '../../components/explore/EditEventModal';
import { ConfirmationDialog } from '../../components/shared/ConfirmationDialog';
import { FeedbackToast } from '../../components/shared/FeedbackToast';
import type { Job, Event } from '../../types';

export const ExploreScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'jobs' | 'events'>('jobs');
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'job' | 'event'; id: string } | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

 const { user, profile } = useAuthStore();
 const isVerified = profile?.user_status === 'verified';

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const {
    jobs,
    isLoading: jobsLoading,
    createJob,
    updateJob,
    deleteJob,
    isCreating: jobCreating,
    isUpdating: jobUpdating,
    isDeleting: jobDeleting,
  } = useJobs({ search });

  const {
    events,
    isLoading: eventsLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating: eventCreating,
    isUpdating: eventUpdating,
    isDeleting: eventDeleting,
  } = useEvents({ search });

  const loading = activeTab === 'jobs' ? jobsLoading : eventsLoading;
  const data = activeTab === 'jobs' ? jobs : events;

  const showFeedback = useCallback((message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  const handleCreateClick = useCallback(() => {
    if (!isVerified) {
      showFeedback('Only verified members can create listings', 'error');
      return;
    }
    if (activeTab === 'jobs') {
      setShowJobModal(true);
    } else {
      setShowEventModal(true);
    }
  }, [activeTab, isVerified, showFeedback]);

  const handleCreateJob = useCallback(async (jobData: any) => {
    try {
      await createJob(jobData);
      setShowJobModal(false);
      showFeedback('Job posted successfully', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to post job', 'error');
    }
  }, [createJob, showFeedback]);

  const handleUpdateJob = useCallback(async (jobId: string, jobData: any) => {
    try {
      await updateJob({ jobId, ...jobData });
      setEditingJob(null);
      showFeedback('Job updated successfully', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to update job', 'error');
    }
  }, [updateJob, showFeedback]);

  const handleDeleteJob = useCallback(async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'job') return;
    try {
      await deleteJob(deleteConfirm.id);
      setDeleteConfirm(null);
      showFeedback('Job deleted successfully', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to delete job', 'error');
    }
  }, [deleteJob, deleteConfirm, showFeedback]);

  const handleCreateEvent = useCallback(async (eventData: any) => {
    try {
      await createEvent(eventData);
      setShowEventModal(false);
      showFeedback('Event created successfully', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to create event', 'error');
    }
  }, [createEvent, showFeedback]);

  const handleUpdateEvent = useCallback(async (eventId: string, eventData: any) => {
    try {
      await updateEvent({ eventId, ...eventData });
      setEditingEvent(null);
      showFeedback('Event updated successfully', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to update event', 'error');
    }
  }, [updateEvent, showFeedback]);

  const handleDeleteEvent = useCallback(async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'event') return;
    try {
      await deleteEvent(deleteConfirm.id);
      setDeleteConfirm(null);
      showFeedback('Event deleted successfully', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to delete event', 'error');
    }
  }, [deleteEvent, deleteConfirm, showFeedback]);

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'jobs' ? "Search jobs..." : "Search events..."}
            placeholderTextColor="#9ca3af"
            value={inputValue}
            onChangeText={setInputValue}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={18} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.createButton, !isVerified && styles.createButtonDisabled]}
          onPress={handleCreateClick}
          disabled={!isVerified}
        >
          <Plus size={18} color={isVerified ? '#fff' : '#9ca3af'} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'jobs' && styles.activeTab]}
          onPress={() => setActiveTab('jobs')}
        >
          <Briefcase size={14} color={activeTab === 'jobs' ? '#16a34a' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>Jobs</Text>
          {jobs.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{jobs.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Calendar size={14} color={activeTab === 'events' ? '#16a34a' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>Events</Text>
          {events.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{events.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        {activeTab === 'jobs' ? (
          <Briefcase size={48} color="#16a34a" />
        ) : (
          <Calendar size={48} color="#16a34a" />
        )}
        <Text style={styles.emptyTitle}>No {activeTab} found</Text>
        <Text style={styles.emptyText}>
          {isVerified
            ? `Be the first to post a ${activeTab === 'jobs' ? 'job' : 'event'}!`
            : `No ${activeTab} found at the moment.`}
        </Text>
        {isVerified && (
          <TouchableOpacity style={styles.emptyButton} onPress={handleCreateClick}>
            <Text style={styles.emptyButtonText}>
              Post {activeTab === 'jobs' ? 'a Job' : 'an Event'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    if (activeTab === 'jobs') {
      return (
        <JobCard
          job={item}
          onEdit={setEditingJob}
          onDelete={(id) => setDeleteConfirm({ type: 'job', id })}
        />
      );
    } else {
      return (
        <EventCard
          event={item}
          onEdit={setEditingEvent}
          onDelete={(id) => setDeleteConfirm({ type: 'event', id })}
        />
      );
    }
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>Find jobs and events in GJBC community</Text>
        </View>

        {/* Search and tabs outside FlatList */}
        {renderHeader()}

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 80 }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        {/* Modals */}
        <CreateJobModal
          visible={showJobModal}
          onClose={() => setShowJobModal(false)}
          onSubmit={handleCreateJob}
          isLoading={jobCreating}
        />
        <CreateEventModal
          visible={showEventModal}
          onClose={() => setShowEventModal(false)}
          onSubmit={handleCreateEvent}
          isLoading={eventCreating}
        />

        {editingJob && (
          <EditJobModal
            visible={!!editingJob}
            onClose={() => setEditingJob(null)}
            onSubmit={(data) => handleUpdateJob(editingJob.id, data)}
            initialData={editingJob}
            isLoading={jobUpdating}
          />
        )}

        {editingEvent && (
          <EditEventModal
            visible={!!editingEvent}
            onClose={() => setEditingEvent(null)}
            onSubmit={(data) => handleUpdateEvent(editingEvent.id, data)}
            initialData={editingEvent}
            isLoading={eventUpdating}
          />
        )}

        {deleteConfirm && (
  <ConfirmationDialog
    visible={true}
    title={`Delete ${deleteConfirm.type === 'job' ? 'Job' : 'Event'}`}
    message={`Are you sure you want to delete this ${deleteConfirm.type}? This action cannot be undone.`}
    confirmText="Delete"
    onConfirm={deleteConfirm.type === 'job' ? handleDeleteJob : handleDeleteEvent}
    onCancel={() => setDeleteConfirm(null)}
    isDanger={true}
    isLoading={deleteConfirm.type === 'job' ? jobDeleting : eventDeleting}
  />
)}

        <FeedbackToast
          visible={!!feedback}
          message={feedback?.message || ''}
          type={feedback?.type || 'success'}
          onClose={() => setFeedback(null)}
        />
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    backgroundColor: '#fff',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#16a34a',
    fontWeight: '600',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#16a34a',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
