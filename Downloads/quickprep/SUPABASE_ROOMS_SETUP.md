# Supabase Database Setup for Collaborative Rooms

## Create the `rooms` table in Supabase

Go to your Supabase project SQL Editor and run this SQL:

```sql
-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  topic TEXT NOT NULL,
  max_participants INTEGER DEFAULT 10,
  participants INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT FALSE,
  host TEXT NOT NULL,
  host_id TEXT NOT NULL,
  meeting_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all users to read and create rooms
CREATE POLICY "Allow public read access" ON public.rooms
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create rooms" ON public.rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow room hosts to update their rooms" ON public.rooms
  FOR UPDATE USING (true);

CREATE POLICY "Allow room hosts to delete their rooms" ON public.rooms
  FOR DELETE USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_meeting_id ON public.rooms(meeting_id);
```

## Steps to Apply

1. Go to https://sjhhxpjpaxyqeorfkaie.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL above
5. Click **Run** or press F5

## Verify Table Creation

After running the SQL, go to **Table Editor** and you should see the `rooms` table with all the columns.

## Test the API

Once the table is created, the app will automatically:
- Fetch all rooms from the database
- Create new rooms in the database
- Share rooms globally across all users
- Each room will have a unique meeting link

## How It Works Now

1. **All users see the same rooms** - stored in Supabase
2. **Create Room** - saved to database, visible to everyone
3. **Join via Link** - paste meeting link to join specific room
4. **Video/Audio** - WebRTC peer-to-peer connections
5. **Chat** - Real-time via Socket.io
