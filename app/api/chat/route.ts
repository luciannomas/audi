import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, APPOINTMENT_TOOL } from '@/lib/agent';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [APPOINTMENT_TOOL as any],
      messages,
    });

    let appointmentData = null;
    let textContent = '';

    for (const block of response.content) {
      if (block.type === 'text') {
        textContent += block.text;
      } else if (block.type === 'tool_use' && block.name === 'schedule_appointment') {
        appointmentData = block.input;
      }
    }

    return NextResponse.json({
      message: textContent,
      appointmentData,
      stopReason: response.stop_reason,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chat error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
