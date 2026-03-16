export interface User {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'client';
  password: string;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  ownerId?: string;
  ownerName?: string;
  ownerPhone?: string;
}

export type ServiceType = 'revision' | 'reparacion' | 'mantenimiento' | 'lavado';

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  carPlate: string;
  carModel: string;
  serviceType: ServiceType;
  serviceDescription: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // HH:MM
  status: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  notes?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
