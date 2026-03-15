import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, User, Mail, Calendar, Tag, AlertCircle, MessageSquare, ChevronLeft } from 'lucide-react-native';
import { useTicketReplies, useAddReply, useCloseTicket } from '../../../hooks/useSupportQueries';
import type { SupportTicket } from '../../../types';
import { formatDate } from '../../../utils/formatters';

interface Props {
  visible: boolean;
  ticket: SupportTicket | null;
  onClose: () => void;
}

export const TicketDetailView: React.FC<Props> = ({ visible, ticket, onClose }) => {
  const [replyText, setReplyText] = useState('');

  const { data: replies = [], isLoading: repliesLoading } = useTicketReplies(ticket?.id || null);
  const addReplyMutation = useAddReply(ticket?.id || '');
  const closeTicketMutation = useCloseTicket(ticket?.id || '');

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !ticket) return;
    try {
      await addReplyMutation.mutateAsync(replyText);
      setReplyText('');
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  if (!ticket) return null;

  const canReply = ticket.status !== 'closed' && ticket.status !== 'resolved';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient colors={['#f9fafb', '#f0fdf4']} style={styles.gradient}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <ChevronLeft size={20} color="#16a34a" />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>{ticket.subject}</Text>
                <View style={styles.headerMeta}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBg(ticket.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                      {ticket.status.replace('_', ' ')}
                    </Text>
                  </View>
                  <Text style={styles.ticketId}>• Ticket #{ticket.id.slice(0, 8)}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.xButton}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Ticket Info */}
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Tag size={16} color="#9ca3af" />
                    <View style={styles.infoText}>
                      <Text style={styles.infoLabel}>Category</Text>
                      <Text style={styles.infoValue}>{ticket.category}</Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Calendar size={16} color="#9ca3af" />
                    <View style={styles.infoText}>
                      <Text style={styles.infoLabel}>Created</Text>
                      <Text style={styles.infoValue}>{formatDate(ticket.created_at)}</Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <AlertCircle size={16} color="#9ca3af" />
                    <View style={styles.infoText}>
                      <Text style={styles.infoLabel}>Priority</Text>
                      <Text style={styles.infoValue}>{ticket.priority}</Text>
                    </View>
                  </View>
                </View>

                {/* Original Message */}
                <View style={styles.messageSection}>
                  <View style={styles.messageHeader}>
                    <View style={styles.avatar}>
                      <User size={16} color="#16a34a" />
                    </View>
                    <View>
                      <Text style={styles.senderName}>You</Text>
                      <Text style={styles.messageTime}>{formatDate(ticket.created_at)}</Text>
                    </View>
                  </View>
                  <View style={styles.messageBubble}>
                    <Text style={styles.messageText}>{ticket.message}</Text>
                  </View>
                </View>

                {/* Replies */}
                <View style={styles.repliesSection}>
                  {repliesLoading ? (
                    <ActivityIndicator size="small" color="#16a34a" style={styles.loader} />
                  ) : replies.length === 0 ? (
                    <View style={styles.emptyReplies}>
                      <MessageSquare size={32} color="#9ca3af" />
                      <Text style={styles.emptyRepliesTitle}>No replies yet</Text>
                      <Text style={styles.emptyRepliesText}>Support team will reply here</Text>
                    </View>
                  ) : (
                    replies.map((reply) => (
                      <View key={reply.id} style={reply.is_admin ? styles.adminReplyContainer : styles.replyContainer}>
                        <View style={styles.messageHeader}>
                          <View style={[styles.avatar, reply.is_admin && styles.adminAvatar]}>
                            {reply.is_admin ? (
                              <Mail size={16} color="#16a34a" />
                            ) : (
                              <User size={16} color="#16a34a" />
                            )}
                          </View>
                          <View>
                            <View style={styles.senderRow}>
                              <Text style={styles.senderName}>
                                {reply.is_admin ? 'Support Team' : 'You'}
                              </Text>
                              {reply.is_admin && (
                                <View style={styles.adminBadge}>
                                  <Text style={styles.adminBadgeText}>Admin</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.messageTime}>{formatDate(reply.created_at)}</Text>
                          </View>
                        </View>
                        <View style={[styles.replyBubble, reply.is_admin && styles.adminBubble]}>
                          <Text style={styles.messageText}>{reply.message}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>

              {/* Reply Form */}
              {canReply && (
                <View style={styles.replyForm}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Type your reply here..."
                    placeholderTextColor="#9ca3af"
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                    maxLength={1000}
                  />
                  <View style={styles.replyActions}>
                    <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.sendButton, (!replyText.trim() || addReplyMutation.isPending) && styles.disabledButton]}
                      onPress={handleSubmitReply}
                      disabled={!replyText.trim() || addReplyMutation.isPending}
                    >
                      {addReplyMutation.isPending ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.sendButtonText}>Send Reply</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </KeyboardAvoidingView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    marginTop: 60,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  ticketId: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 4,
  },
  xButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  messageSection: {
    marginBottom: 20,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminAvatar: {
    backgroundColor: '#dcfce7',
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 10,
    color: '#6b7280',
  },
  messageBubble: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 12,
    marginLeft: 40,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 13,
    color: '#1f2937',
    lineHeight: 18,
  },
  repliesSection: {
    gap: 16,
  },
  loader: {
    marginVertical: 20,
  },
  emptyReplies: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyRepliesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  emptyRepliesText: {
    fontSize: 12,
    color: '#6b7280',
  },
  replyContainer: {
    marginBottom: 8,
  },
  adminReplyContainer: {
    marginBottom: 8,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adminBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#166534',
  },
  replyBubble: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 12,
    marginLeft: 40,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  adminBubble: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  replyForm: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    padding: 12,
  },
  replyInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  sendButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
