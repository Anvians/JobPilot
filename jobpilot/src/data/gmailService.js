import { BACKEND_URL } from './config';

/**
 * Send email via backend secure endpoint
 */
export async function sendEmail({ to, subject, body }) {
  try {
    const response = await fetch(`${BACKEND_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Failed to send email' };
    }
    
    return { success: true, message: 'Email sent successfully' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Fetch job-related emails from backend secure endpoint
 */
export async function fetchJobEmails(limit = 20) {
  try {
    const response = await fetch(`${BACKEND_URL}/inbox?limit=${limit}`);
    
    if (!response.ok) {
      const error = await response.json();
      return { success: false, emails: [], error: error.error || 'Failed to fetch emails' };
    }
    
    const data = await response.json();
    return { success: true, emails: data.emails || [] };
  } catch (e) {
    return { success: false, emails: [], error: e.message };
  }
}
