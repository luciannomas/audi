'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CheckCircle, Calendar, Phone, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { saveAppointment, initStorage } from '@/lib/storage';
import { Appointment, ServiceType } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SERVICE_LABELS: Record<ServiceType, string> = {
  revision: 'Revisión',
  reparacion: 'Reparación',
  mantenimiento: 'Mantenimiento',
  lavado: 'Lavado',
};

const SERVICE_COLORS: Record<ServiceType, string> = {
  revision: 'bg-blue-100 text-blue-800',
  reparacion: 'bg-red-100 text-red-800',
  mantenimiento: 'bg-yellow-100 text-yellow-800',
  lavado: 'bg-green-100 text-green-800',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AppointmentCard({ data }: { data: any }) {
  const serviceType = data.serviceType as ServiceType;
  return (
    <div className="mt-3 bg-white border border-green-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="font-semibold text-green-700 text-sm">Cita confirmada</span>
      </div>
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span>{data.clientName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{data.clientPhone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-gray-400" />
          <span>{data.carModel} · {data.carPlate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>
            {format(new Date(data.date + 'T00:00:00'), "d 'de' MMMM yyyy", { locale: es })} a las {data.time}
          </span>
        </div>
        <div className="pt-1">
          <Badge className={SERVICE_COLORS[serviceType]}>
            {SERVICE_LABELS[serviceType]}
          </Badge>
          <p className="mt-1 text-gray-600">{data.serviceDescription}</p>
        </div>
      </div>
    </div>
  );
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '¡Hola! Soy **Alex**, el asistente virtual de **Audi Hercos Parayas**. Estoy aquí para ayudarte a gestionar la cita de tu vehículo. ¿En qué puedo ayudarte hoy? Ofrecemos servicios de revisión, reparación, mantenimiento y lavado.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appointments, setAppointments] = useState<{ msgId: string; data: any }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    initStorage();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const getApiMessages = (): ApiMessage[] => {
    return messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }));
  };

  function renderContent(content: string) {
    // Simple markdown-like rendering for bold text
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = [...getApiMessages(), { role: 'user' as const, content: text }];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMsgId = (Date.now() + 1).toString();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: data.message || (data.appointmentData ? '¡Perfecto! He registrado tu cita correctamente.' : 'Entendido.'),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (data.appointmentData) {
        const apt: Appointment = {
          id: 'apt-' + Date.now(),
          clientName: data.appointmentData.clientName,
          clientPhone: data.appointmentData.clientPhone,
          clientEmail: data.appointmentData.clientEmail,
          carPlate: data.appointmentData.carPlate,
          carModel: data.appointmentData.carModel,
          serviceType: data.appointmentData.serviceType,
          serviceDescription: data.appointmentData.serviceDescription,
          date: data.appointmentData.date,
          time: data.appointmentData.time,
          status: 'pendiente',
          notes: data.appointmentData.notes,
          createdAt: new Date().toISOString(),
        };
        saveAppointment(apt);
        setAppointments(prev => [...prev, { msgId: assistantMsgId, data: data.appointmentData }]);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      console.error(err);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  msg.role === 'user' ? 'bg-gray-700' : 'bg-[#bb0a14]'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gray-900 text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'
                  }`}
                >
                  {renderContent(msg.content)}
                </div>
                <span className="text-xs text-gray-400 mt-1 px-1">
                  {format(msg.timestamp, 'HH:mm')}
                </span>
                {/* Appointment card if this message triggered one */}
                {appointments.find(a => a.msgId === msg.id) && (
                  <AppointmentCard data={appointments.find(a => a.msgId === msg.id)!.data} />
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#bb0a14] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje... (Enter para enviar)"
            className="resize-none min-h-[44px] max-h-32 flex-1 border-gray-200 focus:border-gray-400 rounded-xl text-sm"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-[#bb0a14] hover:bg-[#9a0811] text-white rounded-xl h-11 w-11 p-0 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Asistente virtual de Audi Hercos Parayas · Powered by Claude AI
        </p>
      </div>
    </div>
  );
}
