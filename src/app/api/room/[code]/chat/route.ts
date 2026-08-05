import { NextRequest, NextResponse } from 'next/server';
import { sendRoomChat } from '@/lib/db/schema';

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  try {
    const { username, message } = await req.json();
    if (!username || !message) {
      return NextResponse.json({ success: false, error: 'Missing username or message' }, { status: 400 });
    }

    const chatMsg = `${username}: ${message}`;
    const room = await sendRoomChat(code.toUpperCase(), chatMsg);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
