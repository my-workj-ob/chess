import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUser } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Invalid username' }, { status: 400 });
    }

    // Attempt to fetch or create user
    let user = await getUser(username);
    if (!user) {
      user = await createUser(username);
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
