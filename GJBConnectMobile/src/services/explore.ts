import { supabase } from '../lib/supabase';
import type { Job, Event, RSVPResult, JobFilters, EventFilters } from '../types';

export const exploreService = {
  // Jobs
  async getJobs(filters?: JobFilters): Promise<Job[]> {
    const { data, error } = await supabase.rpc('get_jobs_list', {
      p_job_type: filters?.jobType,
      p_search: filters?.search,
      p_limit: filters?.limit || 20,
      p_offset: filters?.offset || 0
    });
    if (error) throw new Error('Failed to load jobs');
    return data || [];
  },

  async createJob(jobData: {
    title: string;
    description: string;
    salary: string;
    job_type: string;
    location: string;
    experience_level?: string;
    category?: string;
    contact_info?: Record<string, any>;
  }): Promise<string> {
    const { data, error } = await supabase.rpc('create_job_with_verification_check', {
      p_title: jobData.title,
      p_description: jobData.description,
      p_salary: jobData.salary,
      p_job_type: jobData.job_type,
      p_location: jobData.location,
      p_experience_level: jobData.experience_level || null,
      p_category: jobData.category || null,
      p_contact_info: jobData.contact_info || {}
    });
    if (error) {
      if (error.message.includes('Only verified users')) {
        throw new Error('Only verified members can create job listings.');
      }
      throw new Error('Failed to create job');
    }
    return data;
  },

  async updateJob(jobId: string, jobData: {
    title: string;
    description: string;
    salary: string;
    job_type: string;
    location: string;
    experience_level?: string;
    category?: string;
    contact_info?: Record<string, any>;
  }): Promise<void> {
    const { error } = await supabase.rpc('update_job', {
      p_job_id: jobId,
      p_title: jobData.title,
      p_description: jobData.description,
      p_salary: jobData.salary,
      p_job_type: jobData.job_type,
      p_location: jobData.location,
      p_experience_level: jobData.experience_level || null,
      p_category: jobData.category || null,
      p_contact_info: jobData.contact_info || {}
    });
    if (error) throw new Error('Failed to update job');
  },

  async deleteJob(jobId: string): Promise<void> {
    const { error } = await supabase.rpc('delete_job', { p_job_id: jobId });
    if (error) throw new Error('Failed to delete job');
  },

  async incrementJobViews(jobId: string): Promise<void> {
    await supabase.rpc('increment_job_views', { p_job_id: jobId });
  },

  // Events
  async getEvents(filters?: EventFilters): Promise<Event[]> {
    const { data, error } = await supabase.rpc('get_events_list', {
      p_upcoming_only: filters?.upcomingOnly ?? true,
      p_search: filters?.search,
      p_limit: filters?.limit || 20,
      p_offset: filters?.offset || 0
    });
    if (error) throw new Error('Failed to load events');
    return data || [];
  },

  async createEvent(eventData: {
    title: string;
    description: string;
    event_date: string;
    location: string;
    image_url?: string;
  }): Promise<string> {
    const { data, error } = await supabase.rpc('create_event_with_verification_check', {
      p_title: eventData.title,
      p_description: eventData.description,
      p_event_date: eventData.event_date,
      p_location: eventData.location,
      p_image_url: eventData.image_url || null
    });
    if (error) {
      if (error.message.includes('Only verified users')) {
        throw new Error('Only verified members can create events.');
      }
      throw new Error('Failed to create event');
    }
    return data;
  },

  async updateEvent(eventId: string, eventData: {
    title: string;
    description: string;
    event_date: string;
    location: string;
    image_url?: string;
  }): Promise<void> {
    const { error } = await supabase.rpc('update_event', {
      p_event_id: eventId,
      p_title: eventData.title,
      p_description: eventData.description,
      p_event_date: eventData.event_date,
      p_location: eventData.location,
      p_image_url: eventData.image_url || null
    });
    if (error) throw new Error('Failed to update event');
  },

  async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase.rpc('delete_event', { p_event_id: eventId });
    if (error) throw new Error('Failed to delete event');
  },

  async toggleEventRSVP(eventId: string, rsvpStatus: string = 'going'): Promise<RSVPResult> {
    const { data, error } = await supabase.rpc('toggle_event_rsvp', {
      p_event_id: eventId,
      p_rsvp_status: rsvpStatus
    });
    if (error) throw new Error(error.message || 'Failed to update RSVP');
    return data;
  }
};
