import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { BACKEND_URL } from './config';
import { useAuth } from './AuthContext';
import { applyTheme } from './theme';

const AppContext = createContext(null);
const THEME_MODE_KEY = 'jobpilot_theme_mode';

export function AppProvider({ children }) {
  const { user, getGmailToken } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState('');
  const [themeMode, setThemeModeState] = useState('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_MODE_KEY)
      .then((storedMode) => {
        const nextMode = storedMode === 'light' ? 'light' : 'dark';
        applyTheme(nextMode);
        setThemeModeState(nextMode);
      })
      .catch(() => {
        applyTheme('dark');
        setThemeModeState('dark');
      });
  }, []);

  const setThemeMode = (mode) => {
    const nextMode = mode === 'light' ? 'light' : 'dark';
    applyTheme(nextMode);
    setThemeModeState(nextMode);
    AsyncStorage.setItem(THEME_MODE_KEY, nextMode).catch(() => {});
  };

  const toggleTheme = () => {
    setThemeModeState((prev) => {
      const nextMode = prev === 'light' ? 'dark' : 'light';
      applyTheme(nextMode);
      AsyncStorage.setItem(THEME_MODE_KEY, nextMode).catch(() => {});
      return nextMode;
    });
  };

  // Reload when user changes
  useEffect(() => {
    if (user) {
      loadJobs();
      loadReminders();
    } else {
      setJobs([]);
      setReminders([]);
      setInbox([]);
      setInboxError('');
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
      time: reminder.time || '',
      job_id: reminder.jobId || null,
      user_id: user.id,
    };

    const reminderDesc = reminder.desc || reminder.description || '';
    if (reminderDesc.trim()) {
      row.description = reminderDesc.trim();
    }

    try {
      const { data, error } = await supabase.from('reminders').insert(row).select().single();
      if (error) throw error;

      const savedReminder = dbToReminder(data);
      setReminders((prev) => [savedReminder, ...prev]);
      return { success: true, reminder: savedReminder };
    } catch (error) {
      const localReminder = {
        id: `local-${Date.now()}`,
        type: row.type,
        icon: row.icon,
        title: row.title,
        desc: reminderDesc,
        time: row.time,
        jobId: row.job_id,
      };
      setReminders((prev) => [localReminder, ...prev]);
      return { success: false, localOnly: true, error: error.message || 'Could not save reminder to Supabase.' };
    }
  };

  const dismissReminder = async (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    await supabase.from('reminders').delete().eq('id', id).eq('user_id', user.id);
  };

  const addSentEmail = ({ jobId = null, from, fromName, subject, preview, body }) => {
    const sentItem = {
      id: `sent-${Date.now()}`,
      from: from || user?.email || 'you',
      fromName: fromName || 'You (Sent)',
      subject,
      preview: preview || body?.slice(0, 80) || '',
      body: body || '',
      unread: false,
      time: 'Just now',
      date: new Date(),
      jobId,
    };

    setInbox((prev) => [sentItem, ...prev]);
    return sentItem;
  };

  // Gmail via backend — passes user's OAuth token
  const loadInbox = useCallback(async () => {
    setInboxLoading(true);
    setInboxError('');

    try {
      const token = getGmailToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${BACKEND_URL}/inbox/jobs`, { headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not fetch inbox right now.');
      }

      setInbox(data.emails || []);
    } catch (e) {
      setInboxError(e.message || 'Could not fetch inbox right now.');
      console.log('Inbox error:', e.message);
    } finally {
      setInboxLoading(false);
    }
  }, [getGmailToken]);

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
        addSentEmail({
          from: user?.email,
          fromName: 'You (Sent)',
          subject,
          preview: body.slice(0, 80),
          body,
        });
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
      loading, inboxLoading, inboxError,
      themeMode, setThemeMode, toggleTheme,
      addJob, updateJob, deleteJob, addTimelineEvent,
      sendEmail, addSentEmail, markEmailRead, loadInbox,
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
    title: row.title || '', desc: row.description || row.desc || '',
    time: row.time || '', jobId: row.job_id || null,
  };
}