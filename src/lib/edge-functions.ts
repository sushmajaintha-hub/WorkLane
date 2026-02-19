import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callEdgeFunction(functionName: string, payload: unknown, method: string = 'POST') {
  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Client-Info': `supabase-js/${ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Edge function call failed');
  }

  return response.json();
}

async function callEdgeFunctionQuery(
  functionName: string,
  params: Record<string, string | number | boolean>
) {
  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const queryString = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryString.append(key, String(value));
  });

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${functionName}?${queryString}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Client-Info': `supabase-js/${ANON_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Edge function call failed');
  }

  return response.json();
}

export async function createJob(jobData: {
  title: string;
  description: string;
  budget: number;
  deadline: string;
  required_skills?: string[];
}) {
  return callEdgeFunction('jobs-create', jobData);
}

export async function listJobs(limit: number = 10, offset: number = 0, status: string = 'open') {
  return callEdgeFunctionQuery('jobs-list', { limit, offset, status });
}

export async function createBid(bidData: {
  job_id: string;
  amount: number;
  proposal: string;
  delivery_time: number;
}) {
  return callEdgeFunction('bids-create', bidData);
}

export async function listBidsForJob(job_id: string, status?: string) {
  const params: Record<string, string | number> = { job_id };
  if (status) params.status = status;
  return callEdgeFunctionQuery('bids-list', params);
}

export async function listFreelancerBids(limit: number = 20, offset: number = 0, status?: string) {
  const params: Record<string, string | number> = { limit, offset };
  if (status) params.status = status;
  return callEdgeFunctionQuery('bids-freelancer', params);
}

export async function hireFreelancer(bid_id: string) {
  return callEdgeFunction('hire-freelancer', { bid_id });
}

export async function completeJob(job_id: string) {
  return callEdgeFunction('jobs-complete', { job_id });
}

export async function listNotifications(limit: number = 20, offset: number = 0, unreadOnly: boolean = false) {
  return callEdgeFunctionQuery('notifications-list', { limit, offset, unread_only: unreadOnly });
}

export async function markNotificationAsRead(notification_id: string) {
  return callEdgeFunction('notifications-read', { notification_id });
}

export async function preparePayment(job_id: string) {
  return callEdgeFunction('payment-prepare', { job_id });
}
