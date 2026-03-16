import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, APPOINTMENT_TOOL } from '@/lib/agent';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Mock conversation flow for demo when API credits are unavailable
function getMockResponse(messages: { role: string; content: string }[]) {
  const last = messages[messages.length - 1]?.content?.toLowerCase() ?? '';
  const history = messages.map(m => m.content.toLowerCase()).join(' ');

  const hasName = /me llamo|soy |mi nombre es/i.test(history);
  const hasPhone = /\d{9}|\+34/i.test(history);
  const hasPlate = /[0-9]{4}[-\s]?[a-z]{3}/i.test(history);
  const hasDate = /lunes|martes|miércoles|jueves|viernes|mañana|pasado|semana|día \d|\d+\/\d+/i.test(history);

  // Extract data if present
  const nameMatch = history.match(/(?:me llamo|soy|nombre es)\s+([a-záéíóúñ\s]+)/i);
  const phoneMatch = history.match(/(\+?34[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}|\d{9})/);
  const plateMatch = history.match(/([0-9]{4}[-\s]?[a-z]{3})/i);

  // Detect service type
  const isLavado = /lavado|lavar|limpi/i.test(history);
  const isRevision = /revisi[oó]n|revisar|itv/i.test(history);
  const isReparacion = /repara|aver[ií]a|roto|da[ñn]o/i.test(history);
  const isMantenimiento = /mantenimiento|aceite|filtro|frenos|km/i.test(history);
  const serviceType = isLavado ? 'lavado' : isRevision ? 'revision' : isReparacion ? 'reparacion' : isMantenimiento ? 'mantenimiento' : 'revision';
  const serviceLabel = isLavado ? 'lavado' : isRevision ? 'revisión' : isReparacion ? 'reparación' : isMantenimiento ? 'mantenimiento' : 'revisión';

  // Greeting
  if (messages.length <= 1) {
    return {
      message: '¡Hola! Soy **Alex**, el asistente virtual de **Audi Hercos Parayas**. Estoy aquí para ayudarte a gestionar la cita de tu vehículo. ¿En qué puedo ayudarte hoy? Ofrecemos servicios de **revisión**, **reparación**, **mantenimiento** y **lavado**.',
      appointmentData: null,
    };
  }

  // Has service but needs name
  if ((isLavado || isRevision || isReparacion || isMantenimiento) && !hasName) {
    return {
      message: `¡Perfecto! Te agendo para un **${serviceLabel}**. ¿Me podrías dar tu nombre completo para la cita?`,
      appointmentData: null,
    };
  }

  // Has name but needs phone
  if (hasName && !hasPhone) {
    const name = nameMatch?.[1]?.trim() ?? 'cliente';
    return {
      message: `Genial, ${name}. ¿Cuál es tu número de teléfono de contacto?`,
      appointmentData: null,
    };
  }

  // Has phone but needs plate
  if (hasPhone && !hasPlate) {
    return {
      message: '¿Me indicas la **matrícula** y el **modelo** de tu vehículo?',
      appointmentData: null,
    };
  }

  // Has plate but needs date
  if (hasPlate && !hasDate) {
    return {
      message: '¿Qué día te viene bien? Tenemos disponibilidad de **lunes a viernes de 8:00 a 19:00** y los **sábados de 9:00 a 14:00**.',
      appointmentData: null,
    };
  }

  // Has all info — create appointment
  if (hasName && hasPhone && hasPlate && hasDate) {
    const name = nameMatch?.[1]?.trim() ?? 'Cliente Demo';
    const phone = phoneMatch?.[1] ?? '600 000 000';
    const plate = plateMatch?.[1]?.toUpperCase() ?? '0000-AAA';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const date = tomorrow.toISOString().split('T')[0];

    return {
      message: `¡Perfecto, **${name}**! He registrado tu cita correctamente. Te esperamos en el taller.`,
      appointmentData: {
        clientName: name,
        clientPhone: phone,
        carPlate: plate,
        carModel: 'Audi',
        serviceType,
        serviceDescription: `${serviceLabel.charAt(0).toUpperCase() + serviceLabel.slice(1)} solicitado por el cliente`,
        date,
        time: '10:00',
      },
    };
  }

  // Fallback
  return {
    message: 'Entendido. Para gestionar tu cita necesito: tu **nombre**, **teléfono**, **matrícula** del vehículo y **fecha** preferida. ¿Cuándo te viene bien?',
    appointmentData: null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    try {
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

      return NextResponse.json({ message: textContent, appointmentData, stopReason: response.stop_reason });

    } catch (apiError: unknown) {
      // If API fails (no credits, etc.) fall back to mock responses for demo
      const errMsg = apiError instanceof Error ? apiError.message : '';
      const isCreditsError = errMsg.includes('credit balance') || errMsg.includes('invalid_request_error');

      if (isCreditsError) {
        const mock = getMockResponse(messages);
        return NextResponse.json({ ...mock, mock: true });
      }
      throw apiError;
    }

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chat error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
