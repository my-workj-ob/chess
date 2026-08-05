import { NextRequest } from 'next/server';
import { getRoom, roomEventEmitter } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const roomCode = code.toUpperCase();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (roomData: any) => {
        try {
          const data = `data: ${JSON.stringify(roomData)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch {
          // stream might be closed
        }
      };

      // Send initial state immediately
      try {
        const initialRoom = await getRoom(roomCode);
        if (initialRoom) {
          sendUpdate(initialRoom);
        }
      } catch (err) {
        console.error('SSE Stream initial fetch error:', err);
      }

      // Listen for updates on the global event emitter for instant push (0ms delay)
      const onUpdate = (room: any) => {
        sendUpdate(room);
      };

      roomEventEmitter.on(`update:${roomCode}`, onUpdate);

      // Keep a slower backup database poll (every 3 seconds) just in case
      const backupInterval = setInterval(async () => {
        try {
          const room = await getRoom(roomCode);
          if (room) {
            sendUpdate(room);
          }
        } catch {}
      }, 3000);

      req.signal.addEventListener('abort', () => {
        clearInterval(backupInterval);
        roomEventEmitter.off(`update:${roomCode}`, onUpdate);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
