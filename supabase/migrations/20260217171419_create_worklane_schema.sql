/*
  # Worklane Marketplace Database Schema

  ## Overview
  Complete database schema for Worklane freelance marketplace platform.
  
  ## New Tables
  
  ### 1. profiles
  - `id` (uuid, references auth.users) - User ID
  - `role` (text) - 'client' or 'freelancer'
  - `full_name` (text) - User's full name
  - `bio` (text) - Profile bio
  - `skills` (text[]) - Array of skills
  - `hourly_rate` (numeric) - Hourly rate for freelancers
  - `portfolio_url` (text) - Portfolio website
  - `avatar_url` (text) - Profile picture
  - `location` (text) - User location
  - `is_blocked` (boolean) - Admin block status
  - `created_at` (timestamptz) - Account creation time
  - `updated_at` (timestamptz) - Last update time
  
  ### 2. jobs
  - `id` (uuid) - Job ID
  - `client_id` (uuid) - References profiles(id)
  - `title` (text) - Job title
  - `description` (text) - Job description
  - `budget` (numeric) - Job budget
  - `deadline` (date) - Project deadline
  - `required_skills` (text[]) - Required skills
  - `status` (text) - 'open', 'in_progress', 'completed', 'cancelled'
  - `hired_freelancer_id` (uuid) - References profiles(id)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 3. bids
  - `id` (uuid) - Bid ID
  - `job_id` (uuid) - References jobs(id)
  - `freelancer_id` (uuid) - References profiles(id)
  - `amount` (numeric) - Bid amount
  - `proposal` (text) - Bid proposal
  - `delivery_time` (integer) - Estimated days
  - `status` (text) - 'pending', 'accepted', 'rejected'
  - `created_at` (timestamptz)
  
  ### 4. messages
  - `id` (uuid) - Message ID
  - `sender_id` (uuid) - References profiles(id)
  - `receiver_id` (uuid) - References profiles(id)
  - `job_id` (uuid) - References jobs(id)
  - `content` (text) - Message content
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz)
  
  ### 5. reviews
  - `id` (uuid) - Review ID
  - `job_id` (uuid) - References jobs(id)
  - `reviewer_id` (uuid) - References profiles(id)
  - `reviewee_id` (uuid) - References profiles(id)
  - `rating` (integer) - 1-5 stars
  - `comment` (text) - Review comment
  - `created_at` (timestamptz)
  
  ### 6. transactions
  - `id` (uuid) - Transaction ID
  - `job_id` (uuid) - References jobs(id)
  - `client_id` (uuid) - References profiles(id)
  - `freelancer_id` (uuid) - References profiles(id)
  - `amount` (numeric) - Total amount
  - `platform_fee` (numeric) - 10% commission
  - `freelancer_payout` (numeric) - Amount to freelancer
  - `payment_id` (text) - Razorpay payment ID
  - `status` (text) - 'pending', 'completed', 'refunded'
  - `created_at` (timestamptz)
  
  ## Security
  Row Level Security (RLS) enabled on all tables with policies for:
  - Users can manage their own profiles
  - Clients can create jobs and view bids
  - Freelancers can create bids and view jobs
  - Both parties can send/receive messages
  - Reviews are public but can only be created by job participants
  - Transactions are visible only to involved parties
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('client', 'freelancer')),
  full_name text NOT NULL,
  bio text DEFAULT '',
  skills text[] DEFAULT '{}',
  hourly_rate numeric DEFAULT 0,
  portfolio_url text DEFAULT '',
  avatar_url text DEFAULT '',
  location text DEFAULT '',
  is_blocked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  budget numeric NOT NULL CHECK (budget > 0),
  deadline date,
  required_skills text[] DEFAULT '{}',
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  hired_freelancer_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  proposal text NOT NULL,
  delivery_time integer NOT NULL CHECK (delivery_time > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, freelancer_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, reviewer_id, reviewee_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  platform_fee numeric NOT NULL DEFAULT 0,
  freelancer_payout numeric NOT NULL DEFAULT 0,
  payment_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_hired_freelancer_id ON jobs(hired_freelancer_id);
CREATE INDEX IF NOT EXISTS idx_bids_job_id ON bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_freelancer_id ON bids(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Jobs Policies
CREATE POLICY "Anyone can view open jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (status = 'open' OR client_id = auth.uid() OR hired_freelancer_id = auth.uid());

CREATE POLICY "Clients can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Bids Policies
CREATE POLICY "Job owners and bid creators can view bids"
  ON bids FOR SELECT
  TO authenticated
  USING (
    freelancer_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = bids.job_id AND jobs.client_id = auth.uid())
  );

CREATE POLICY "Freelancers can create bids"
  ON bids FOR INSERT
  TO authenticated
  WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY "Freelancers can update own bids"
  ON bids FOR UPDATE
  TO authenticated
  USING (freelancer_id = auth.uid())
  WITH CHECK (freelancer_id = auth.uid());

-- Messages Policies
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Reviews Policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Job participants can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_id 
      AND (jobs.client_id = auth.uid() OR jobs.hired_freelancer_id = auth.uid())
    )
  );

-- Transactions Policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (client_id = auth.uid() OR freelancer_id = auth.uid());

CREATE POLICY "Clients can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();