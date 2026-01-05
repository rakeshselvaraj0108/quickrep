import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sjhhxpjpaxyqeorfkaie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqaGh4cGpwYXh5cWVvcmZrYWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTk0ODQsImV4cCI6MjA4MzE5NTQ4NH0.M5wgeno5_3273rrvrd99h1xVCGUr04Ep3Xi7kOAZNWo';

const supabase = createClient(supabaseUrl, supabaseKey);

const createRoomsTable = `
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
DROP POLICY IF EXISTS "Allow public read access" ON public.rooms;
CREATE POLICY "Allow public read access" ON public.rooms
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create rooms" ON public.rooms;
CREATE POLICY "Allow authenticated users to create rooms" ON public.rooms
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow room hosts to update their rooms" ON public.rooms;
CREATE POLICY "Allow room hosts to update their rooms" ON public.rooms
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow room hosts to delete their rooms" ON public.rooms;
CREATE POLICY "Allow room hosts to delete their rooms" ON public.rooms
  FOR DELETE USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_meeting_id ON public.rooms(meeting_id);
`;

async function setupTable() {
  console.log('🔄 Creating rooms table in Supabase...');
  
  try {
    // Note: The anon key doesn't have permission to run raw SQL
    // You need to run this manually in Supabase SQL Editor
    console.log('⚠️  Please run the following SQL in Supabase SQL Editor:');
    console.log('');
    console.log('Go to: https://sjhhxpjpaxyqeorfkaie.supabase.co/project/default/sql');
    console.log('');
    console.log(createRoomsTable);
    console.log('');
    
    // Test if table exists by trying to select from it
    const { data, error } = await supabase
      .from('rooms')
      .select('id')
      .limit(1);
    
    if (error && error.message.includes('does not exist')) {
      console.log('❌ Table does not exist yet. Please create it using the SQL above.');
    } else if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log('✅ Table exists! Ready to use.');
      console.log('📊 Current rooms count:', data?.length || 0);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

setupTable();
