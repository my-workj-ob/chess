import { NextRequest, NextResponse } from 'next/server';
import { joinRoom } from '@/lib/db/schema';

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  try {
    const { username } = await req.json();
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Invalid username' }, { status: 400 });
    }

    const room = await joinRoom(code.toUpperCase(), username.trim());
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found or already full' }, { status: 404 });
    }

    return NextResponse.json({ success: true, room });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
