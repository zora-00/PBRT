/*
  # Initial Schema Setup for Modern Pastebin

  1. New Tables
    - `pastes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `syntax` (text)
      - `expiration` (timestamptz)
      - `created_at` (timestamptz)
      - `user_id` (uuid, foreign key)
      - `is_rich_text` (boolean)
      - `is_public` (boolean)

  2. Security
    - Enable RLS on `pastes` table
    - Add policies for:
      - Public read access for public pastes
      - Authenticated users can create pastes
      - Users can read/update/delete their own pastes
*/

CREATE TABLE IF NOT EXISTS pastes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  content text NOT NULL,
  syntax text DEFAULT 'plain',
  expiration timestamptz,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  is_rich_text boolean DEFAULT false,
  is_public boolean DEFAULT true
);

ALTER TABLE pastes ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to public pastes
CREATE POLICY "Public pastes are viewable by everyone"
  ON pastes
  FOR SELECT
  USING (is_public = true);

-- Policy for authenticated users to create pastes
CREATE POLICY "Authenticated users can create pastes"
  ON pastes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for users to manage their own pastes
CREATE POLICY "Users can manage their own pastes"
  ON pastes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);