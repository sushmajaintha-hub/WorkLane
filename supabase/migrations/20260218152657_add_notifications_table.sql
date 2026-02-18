/*
  # Create notifications table

  ## Overview
  Notifications table for tracking user events like new bids, bid acceptance, and job completion.

  ## New Tables
  - `notifications`
    - `id` (uuid) - Primary key
    - `user_id` (uuid) - Recipient of notification
    - `type` (text) - Type of notification (bid_placed, bid_accepted, job_completed)
    - `title` (text) - Notification title
    - `message` (text) - Notification message
    - `related_job_id` (uuid) - Related job ID
    - `related_bid_id` (uuid) - Related bid ID
    - `is_read` (boolean) - Read status
    - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - RLS enabled
  - Users can only view their own notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('bid_placed', 'bid_accepted', 'job_completed', 'job_cancelled')),
  title text NOT NULL,
  message text NOT NULL,
  related_job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  related_bid_id uuid REFERENCES bids(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
