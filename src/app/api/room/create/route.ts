import { NextRequest, NextResponse } from 'next/server';
import { createRoom } from '@/lib/db/schema';
import { INITIAL_BOARD_FEN } from '@/lib/engine/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, is_private } = body;
    
    if (!username) {
      return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = await createRoom(code, INITIAL_BOARD_FEN, username.trim(), Boolean(is_private));
    return NextResponse.json({ success: true, room });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
