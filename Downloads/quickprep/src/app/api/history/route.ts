import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // Mock history for demo
  return NextResponse.json({
    history: [
      { id: 1, mode: 'summary', topic: 'RL Notes', date: '2min ago', length: 847 },
      { id: 2, mode: 'questions', topic: 'Neural Nets', date: '15min ago', length: 1245 },
      { id: 3, mode: 'plan', topic: 'Algorithms', date: '1hr ago', length: 2034 }
    ]
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({ success: true, id: Date.now() });
}
