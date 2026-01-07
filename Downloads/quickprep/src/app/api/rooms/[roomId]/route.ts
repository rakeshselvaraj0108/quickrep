import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId;

    const { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update room (e.g., increment participants)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId;
    const body = await req.json();
    const { participants } = body;

    if (participants !== undefined) {
      const { data: room, error } = await supabase
        .from('rooms')
        .update({ participants })
        .eq('id', roomId)
        .select()
        .single();

      if (error) {
        console.error('Error updating room:', error);
        return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
      }

      return NextResponse.json({ room });
    }

    return NextResponse.json({ error: 'Invalid update data' }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH /api/rooms/[roomId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
