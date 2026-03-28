import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { BACKEND_URL } from './config';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user, getGmailToken } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inboxLoading, setInboxLoading] = useState(false);

  // Reload when user changes
  useEffect(() => {
    if (user) {
      loadJobs();
      loadReminders();
    } else {
      setJobs([]);
      setReminders([]);
      setInbox([]);
    }
  }, [user]);

  const loadJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setJobs(data.map(dbToJob));
    setLoading(false);
  };

  const addJob = async (job) => {
    const row = jobToDb({
      ...job,
      avatar: job.company.slice(0, 2).toUpperCase(),
      timeline: [{ date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), event: 'Applied', type: 'blue' }],
      emails: [],
    });
    row.user_id = user.id;
    const { data, error } = await supabase.from('jobs').insert(row).select().single();
    if (!error && data) setJobs((prev) => [dbToJob(data), ...prev]);
  };

  const updateJob = async (id, updates) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
    await supabase.from('jobs').update(jobToDb(updates)).eq('id', id).eq('user_id', user.id);
  };

  const deleteJob = async (id) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    await supabase.from('jobs').delete().eq('id', id).eq('user_id', user.id);
  };

  const addTimelineEvent = async (jobId, event) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const newTimeline = [...job.timeline, {
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      event, type: 'blue',
    }];
    await updateJob(jobId, { timeline: newTimeline });
  };

  const loadReminders = async () => {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setReminders(data.map(dbToReminder));
  };

  const addReminder = async (reminder) => {
    const row = {
      type: reminder.type || 'amber',
      icon: reminder.icon || '⏰',
      title: reminder.title,
      desc: reminder.desc || '',
      time: reminder.time || '',
      job_id: reminder.jobId || null,
      user_id: user.id,
    };
    const { data, error } = await supabase.from('reminders').insert(row).select().single();
    if (!error && data) setReminders((prev) => [...prev, dbToReminder(data)]);
  };

  const dismissReminder = async (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    await supabase.from('reminders').delete().eq('id', id).eq('user_id', user.id);
  };

  // Gmail via backend — passes user's OAuth token
  const loadInbox = useCallback(async () => {
    setInboxLoading(true);
    try {
      const token = getGmailToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${BACKEND_URL}/inbox/jobs`, { headers });
      const data = await res.json();
      if (data.emails) setInbox(data.emails);
    } catch (e) {
      console.log('Inbox error:', e.message);
    }
    setInboxLoading(false);
  }, [user, getGmailToken]);

  const sendEmail = async ({ to, subject, body }) => {
    try {
      const token = getGmailToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${BACKEND_URL}/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ to, subject, body }),
      });
      const data = await res.json();
      if (data.success) {
        setInbox((prev) => [{
          id: Date.now().toString(), from: user.email,
          fromName: 'You (Sent)', subject,
          preview: body.slice(0, 80), body,
          unread: false, time: 'Just now', date: new Date(),
        }, ...prev]);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const markEmailRead = (id) => {
    setInbox((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));
  };

  return (
    <AppContext.Provider value={{
      jobs, inbox, reminders,
      loading, inboxLoading,
      addJob, updateJob, deleteJob, addTimelineEvent,
      sendEmail, markEmailRead, loadInbox,
      dismissReminder, addReminder,
      unreadCount: inbox.filter((m) => m.unread).length,
      reload: loadJobs,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

function dbToJob(row) {
  return {
    id: row.id, role: row.role || '', company: row.company || '',
    avatar: row.avatar || '??', appliedDate: row.applied_date || '',
    stage: row.stage || 'Applied', salary: row.salary || '',
    contact: row.contact || '', notes: row.notes || '',
    jobUrl: row.job_url || '', resumeVersion: row.resume_version || '',
    tags: row.tags || [], timeline: row.timeline || [], emails: row.emails || [],
  };
}

function jobToDb(job) {
  const row = {};
  if (job.role !== undefined) row.role = job.role;
  if (job.company !== undefined) row.company = job.company;
  if (job.avatar !== undefined) row.avatar = job.avatar;
  if (job.appliedDate !== undefined) row.applied_date = job.appliedDate;
  if (job.stage !== undefined) row.stage = job.stage;
  if (job.salary !== undefined) row.salary = job.salary;
  if (job.contact !== undefined) row.contact = job.contact;
  if (job.notes !== undefined) row.notes = job.notes;
  if (job.jobUrl !== undefined) row.job_url = job.jobUrl;
  if (job.resumeVersion !== undefined) row.resume_version = job.resumeVersion;
  if (job.tags !== undefined) row.tags = job.tags;
  if (job.timeline !== undefined) row.timeline = job.timeline;
  if (job.emails !== undefined) row.emails = job.emails;
  return row;
}

function dbToReminder(row) {
  return {
    id: row.id, type: row.type || 'amber', icon: row.icon || '⏰',
    title: row.title || '', desc: row.desc || '',
    time: row.time || '', jobId: row.job_id || null,
  };
}