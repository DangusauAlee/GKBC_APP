import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Clock, CheckCircle, AlertCircle, HelpCircle, MessageSquare, X } from 'lucide-react-native';
import { useUserTickets, useSubmitTicket } from '../../hooks/useSupportQueries';
import { TicketDetailView } from '../../components/support/TicketDetailView';
import type { SupportTicket } from '../../types';
import { formatDate } from '../../utils/formatters';

export const HelpSupportScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'normal'
  });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: tickets = [], isLoading, refetch } = useUserTickets();
  const submitMutation = useSubmitTicket();

  const handleSubmit = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) return;

    try {
      await submitMutation.mutateAsync(formData);
      setFormData({ subject: '', message: '', category: 'general', priority: 'normal' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit your request. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'in_progress':
        return <Clock size={16} color="#16a34a" />;
      case 'closed':
        return <CheckCircle size={16} color="#6b7280" />;
      default:
        return <AlertCircle size={16} color="#d97706" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch ( status) {
      case 'resolved':
      case 'in_progress':
        return '#16a34a';
      case 'closed':
        return '#6b7280';
      default:
        return '#d97706';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'in_progress':
        return '#f0fdf4';
      case 'closed':
        return '#f3f4f6';
      default:
        return '#fffbeb';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        <TicketDetailView
          visible={!!selectedTicket}
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />

        {/* Success Toast */}
        {showSuccess && (
          <View style={styles.successToast}>
            <CheckCircle size={20} color="#16a34a" />
            <Text style={styles.successText}>Ticket submitted successfully!</Text>
            <TouchableOpacity onPress={() => setShowSuccess(false)}>
              <X size={16} color="#16a34a" />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <HelpCircle size={32} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>
              We're here to help! Submit a ticket and our support team will get back to you as soon as possible.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <MessageSquare size={20} color="#16a34a" />
              <Text style={styles.formTitle}>Submit a Request</Text>
            </View>
            <Text style={styles.formSubtitle}>
              Fill out the form below and we'll respond within 24 hours.
            </Text>

            {/* Subject */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject *</Text>
              <TextInput
                style={styles.input}
                placeholder="Briefly describe your issue"
                placeholderTextColor="#9ca3af"
                value={formData.subject}
                onChangeText={(text) => setFormData(prev => ({ ...prev, subject: text }))}
                maxLength={200}
              />
              <Text style={styles.charCount}>{formData.subject.length}/200</Text>
            </View>

            {/* Category & Priority */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                  <TextInput
                    style={styles.input}
                    value={formData.category}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
                    placeholder="Select category"
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.pickerContainer}>
                  <TextInput
                    style={styles.input}
                    value={formData.priority}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, priority: text }))}
                    placeholder="Select priority"
                  />
                </View>
              </View>
            </View>
            <View style={styles.row}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {['general', 'technical', 'account', 'bug', 'feature', 'payment'].map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, formData.category === cat && styles.chipSelected]}
                    onPress={() => setFormData(prev => ({ ...prev, category: cat }))}
                  >
                    <Text style={[styles.chipText, formData.category === cat && styles.chipTextSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.row}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {['low', 'normal', 'high', 'urgent'].map(pri => (
                  <TouchableOpacity
                    key={pri}
                    style={[styles.chip, formData.priority === pri && styles.chipSelected]}
                    onPress={() => setFormData(prev => ({ ...prev, priority: pri }))}
                  >
                    <Text style={[styles.chipText, formData.priority === pri && styles.chipTextSelected]}>
                      {pri}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Message */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Please provide detailed information about your issue..."
                placeholderTextColor="#9ca3af"
                value={formData.message}
                onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
                multiline
                numberOfLines={6}
              />
              <Text style={styles.hint}>Please include any relevant details that will help us resolve your issue faster.</Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, submitMutation.isPending && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={submitMutation.isPending || !formData.subject.trim() || !formData.message.trim()}
            >
              {submitMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Send size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit Request</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Ticket History */}
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Your Tickets</Text>
              <Text style={styles.historySubtitle}>Previous support requests</Text>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color="#16a34a" style={styles.loader} />
            ) : tickets.length === 0 ? (
              <View style={styles.emptyHistory}>
                <MessageSquare size={32} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No support tickets yet</Text>
                <Text style={styles.emptyText}>Your submitted tickets will appear here</Text>
              </View>
            ) : (
              <View style={styles.ticketList}>
                {tickets.map((ticket) => (
                  <TouchableOpacity
                    key={ticket.id}
                    style={styles.ticketItem}
                    onPress={() => setSelectedTicket(ticket)}
                  >
                    <View style={styles.ticketHeader}>
                      <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
                      <View style={[styles.ticketStatus, { backgroundColor: getStatusBg(ticket.status) }]}>
                        {getStatusIcon(ticket.status)}
                        <Text style={[styles.ticketStatusText, { color: getStatusColor(ticket.status) }]}>
                          {ticket.status.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.ticketMessage} numberOfLines={2}>{ticket.message}</Text>
                    <View style={styles.ticketFooter}>
                      <Text style={styles.ticketDate}>{formatDate(ticket.created_at)}</Text>
                      <Text style={styles.ticketCategory}>{ticket.category}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Quick Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <HelpCircle size={18} color="#166534" />
              <Text style={styles.tipsTitle}>Quick Tips</Text>
            </View>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Be specific about your issue</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Include error messages if any</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Check FAQ before submitting</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Response time: 24-48 hours</Text>
              </View>
            </View>
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
  successToast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 300,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  formSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 2,
  },
  hint: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  flex1: {
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
  },
  chipScroll: {
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  chipText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 16,
  },
  historyHeader: {
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  historySubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  loader: {
    marginVertical: 24,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 12,
    color: '#6b7280',
  },
  ticketList: {
    gap: 8,
  },
  ticketItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketSubject: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  ticketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  ticketStatusText: {
    fontSize: 9,
    fontWeight: '600',
  },
  ticketMessage: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 6,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDate: {
    fontSize: 10,
    color: '#6b7280',
  },
  ticketCategory: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  tipsCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 16,
    marginBottom: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  tipText: {
    fontSize: 13,
    color: '#166534',
  },
});
