'use client';

import { useEffect, useState } from 'react';
import { getAppointments, getCars, getAuth } from '@/lib/storage';
import { Appointment, Car, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Car as CarIcon, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { format, isToday, parseISO, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const SERVICE_LABELS: Record<string, string> = {
  revision: 'Revisión',
  reparacion: 'Reparación',
  mantenimiento: 'Mantenimiento',
  lavado: 'Lavado',
};

const SERVICE_COLORS: Record<string, string> = {
  revision: 'bg-blue-100 text-blue-700',
  reparacion: 'bg-red-100 text-red-700',
  mantenimiento: 'bg-yellow-100 text-yellow-700',
  lavado: 'bg-green-100 text-green-700',
};

const STATUS_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmada: 'bg-green-100 text-green-800 border-green-200',
  completada: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelada: 'bg-red-100 text-red-800 border-red-200',
};

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setAppointments(getAppointments());
    setCars(getCars());
    setUser(getAuth());
  }, []);

  const todayApts = appointments.filter(a => {
    try { return isToday(parseISO(a.date)); } catch { return false; }
  });
  const pendingApts = appointments.filter(a => a.status === 'pendiente');
  const confirmedApts = appointments.filter(a => a.status === 'confirmada');
  const tomorrowApts = appointments.filter(a => {
    try { return isTomorrow(parseISO(a.date)); } catch { return false; }
  });

  const upcomingApts = appointments
    .filter(a => {
      try {
        const d = parseISO(a.date);
        return d >= new Date(new Date().setHours(0, 0, 0, 0)) && a.status !== 'cancelada' && a.status !== 'completada';
      } catch { return false; }
    })
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
    })
    .slice(0, 5);

  const stats = [
    {
      title: 'Total citas',
      value: appointments.length,
      icon: CalendarDays,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      desc: `${tomorrowApts.length} mañana`,
    },
    {
      title: 'Hoy',
      value: todayApts.length,
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      desc: `${todayApts.filter(a => a.status === 'confirmada').length} confirmadas`,
    },
    {
      title: 'Pendientes',
      value: pendingApts.length,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      desc: 'Requieren atención',
    },
    {
      title: 'Confirmadas',
      value: confirmedApts.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      desc: 'Listas para hoy',
    },
    {
      title: 'Vehículos',
      value: cars.length,
      icon: CarIcon,
      color: 'text-gray-600',
      bg: 'bg-gray-100',
      desc: 'En el sistema',
    },
    {
      title: 'Tasa activa',
      value: appointments.length > 0
        ? Math.round((confirmedApts.length / appointments.length) * 100) + '%'
        : '0%',
      icon: TrendingUp,
      color: 'text-[#bb0a14]',
      bg: 'bg-red-50',
      desc: 'Citas confirmadas',
    },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}, {user?.name ?? 'Admin'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.desc}</p>
                  </div>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
                    <Icon className={cn('w-5 h-5', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming appointments */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#bb0a14]" />
              Próximas citas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingApts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin citas próximas</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {upcomingApts.map(apt => (
                  <div key={apt.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{apt.clientName}</p>
                        <p className="text-xs text-gray-500">{apt.carModel} · {apt.carPlate}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{apt.serviceDescription}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-mono text-gray-700 font-medium">{apt.time}</p>
                        <p className="text-xs text-gray-400">
                          {isToday(parseISO(apt.date))
                            ? 'Hoy'
                            : isTomorrow(parseISO(apt.date))
                            ? 'Mañana'
                            : format(parseISO(apt.date), 'd MMM', { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={cn('text-xs px-1.5 py-0', SERVICE_COLORS[apt.serviceType])}>
                        {SERVICE_LABELS[apt.serviceType]}
                      </Badge>
                      <Badge className={cn('text-xs px-1.5 py-0 border', STATUS_COLORS[apt.status])}>
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's appointments */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#bb0a14]" />
              Citas de hoy
              {todayApts.length > 0 && (
                <span className="ml-auto bg-[#bb0a14] text-white text-xs rounded-full px-2 py-0.5">
                  {todayApts.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {todayApts.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Sin citas para hoy</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {todayApts
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(apt => (
                    <div key={apt.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-center w-12 flex-shrink-0">
                          <p className="text-sm font-bold font-mono text-gray-800">{apt.time}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{apt.clientName}</p>
                          <p className="text-xs text-gray-500">{apt.carModel} · {SERVICE_LABELS[apt.serviceType]}</p>
                        </div>
                        <Badge className={cn('text-xs px-1.5 py-0 border flex-shrink-0', STATUS_COLORS[apt.status])}>
                          {apt.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
