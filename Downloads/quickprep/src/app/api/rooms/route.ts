import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all rooms
export async function GET() {
  try {
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rooms:', error);
      return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
    }

    return NextResponse.json({ rooms: rooms || [] });
  } catch (error) {
    console.error('Error in GET /api/rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new room
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, topic, maxParticipants, isPrivate, host, hostId } = body;

    if (!name || !topic || !host || !hostId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const meetingId = `meet-${Date.now()}`;

    const { data: room, error } = await supabase
      .from('rooms')
      .insert([
        {
          id: roomId,
          name,
          topic,
          max_participants: maxParticipants || 10,
          is_private: isPrivate || false,
          host,
          host_id: hostId,
          meeting_id: meetingId,
          participants: 0,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove room
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (error) {
      console.error('Error deleting room:', error);
      return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
