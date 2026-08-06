import { NextRequest, NextResponse } from 'next/server';
import { getRoom, updateRoomMove } from '@/lib/db/schema';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: rawCode } = await params;
    const code = rawCode.toUpperCase();
    const { username } = await req.json();

    const room = await getRoom(code);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Xona topilmadi' }, { status: 404 });
    }

    // Only players in the room or host can close/finish the room
    if (room.white_player === username || room.black_player === username) {
      await updateRoomMove(code, room.fen, room.turn, room.moves || [], 'finished', 'draw');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Ruxsat berilmadi' }, { status: 403 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

