import { NextRequest, NextResponse } from 'next/server';
import { getRoom, updateRoomMove } from '@/lib/db/schema';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const room = await getRoom(code.toUpperCase());
  if (!room) {
    return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, room });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  try {
    const body = await req.json();
    const { fen, turn, move, status, winner } = body;
    const room = await getRoom(code.toUpperCase());

    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    const updatedMoves = [...room.moves, move];
    await updateRoomMove(code.toUpperCase(), fen, turn, updatedMoves, status || 'active', winner || null);
    const freshRoom = await getRoom(code.toUpperCase());

    return NextResponse.json({ success: true, room: freshRoom });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
