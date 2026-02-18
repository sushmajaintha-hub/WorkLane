import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callEdgeFunction(functionName: string, payload: unknown) {
  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method: 'POST',
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

export async function createJob(jobData: {
  title: string;
  description: string;
  budget: number;
  deadline: string;
  required_skills?: string[];
}) {
  return callEdgeFunction('jobs-create', jobData);
}

export async function createBid(bidData: {
  job_id: string;
  amount: number;
  proposal: string;
  delivery_time: number;
}) {
  return callEdgeFunction('bids-create', bidData);
}

export async function hireFreelancer(bid_id: string) {
  return callEdgeFunction('hire-freelancer', { bid_id });
}

export async function preparePayment(job_id: string) {
  return callEdgeFunction('payment-prepare', { job_id });
}
