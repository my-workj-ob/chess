import { NextRequest, NextResponse } from 'next/server';
import { listRoomsForUser } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get('username');
    if (!username || username.trim().length === 0) {
      return NextResponse.json({ success: true, rooms: [] });
    }

    const rooms = await listRoomsForUser(username.trim());
    return NextResponse.json({ success: true, rooms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
