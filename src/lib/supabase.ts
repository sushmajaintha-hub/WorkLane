import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  role: 'client' | 'freelancer';
  full_name: string;
  bio: string;
  skills: string[];
  hourly_rate: number;
  portfolio_url: string;
  avatar_url: string;
  location: string;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
};

export type Job = {
  id: string;
  client_id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  required_skills: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  hired_freelancer_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Bid = {
  id: string;
  job_id: string;
  freelancer_id: string;
  amount: number;
  proposal: string;
  delivery_time: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  job_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
};
