import { NextResponse } from 'next/server';
import { listPublicRooms, getTopUsers } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rooms = await listPublicRooms();
    const topUsers = await getTopUsers();
    return NextResponse.json({ success: true, rooms, topUsers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
