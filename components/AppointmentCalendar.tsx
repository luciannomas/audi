'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment, ServiceType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SERVICE_COLORS: Record<ServiceType, string> = {
  revision: 'bg-blue-500',
  reparacion: 'bg-red-500',
  mantenimiento: 'bg-yellow-500',
  lavado: 'bg-green-500',
};

const SERVICE_LABELS: Record<ServiceType, string> = {
  revision: 'Revisión',
  reparacion: 'Reparación',
  mantenimiento: 'Mantenimiento',
  lavado: 'Lavado',
};

const STATUS_COLORS: Record<Appointment['status'], string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmada: 'bg-green-100 text-green-800 border-green-200',
  completada: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelada: 'bg-red-100 text-red-800 border-red-200',
};

interface Props {
  appointments: Appointment[];
  onSelect?: (apt: Appointment) => void;
}

export default function AppointmentCalendar({ appointments, onSelect }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    rows.push(week);
  }

  function getAppointmentsForDay(date: Date): Appointment[] {
    return appointments.filter(apt => {
      try {
        return isSameDay(parseISO(apt.date), date);
      } catch {
        return false;
      }
    });
  }

  const selectedDayApts = selectedDate ? getAppointmentsForDay(selectedDate) : [];

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Calendar */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-sm capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div>
          {rows.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-gray-50 last:border-b-0">
              {week.map((day, di) => {
                const dayApts = getAppointmentsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

                return (
                  <div
                    key={di}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'min-h-[60px] p-1 border-r border-gray-50 last:border-r-0 cursor-pointer transition-colors',
                      !isCurrentMonth && 'bg-gray-50/50',
                      isSelected && 'bg-blue-50',
                      !isSelected && isCurrentMonth && 'hover:bg-gray-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 mx-auto',
                        isTodayDate && 'bg-[#bb0a14] text-white',
                        !isTodayDate && isCurrentMonth && 'text-gray-700',
                        !isTodayDate && !isCurrentMonth && 'text-gray-300'
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {dayApts.slice(0, 2).map(apt => (
                        <div
                          key={apt.id}
                          className={cn(
                            'w-full h-1.5 rounded-full',
                            SERVICE_COLORS[apt.serviceType]
                          )}
                        />
                      ))}
                      {dayApts.length > 2 && (
                        <p className="text-xs text-gray-400 text-center leading-none">+{dayApts.length - 2}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap gap-3">
          {Object.entries(SERVICE_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={cn('w-2.5 h-2.5 rounded-full', SERVICE_COLORS[key as ServiceType])} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day detail panel */}
      <div className="w-full lg:w-72 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-900 text-white">
          <h3 className="font-semibold text-sm">
            {selectedDate
              ? format(selectedDate, "d 'de' MMMM", { locale: es })
              : 'Selecciona un día'}
          </h3>
          <p className="text-gray-400 text-xs mt-0.5">
            {selectedDayApts.length} cita{selectedDayApts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="overflow-y-auto max-h-[400px]">
          {selectedDayApts.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Sin citas para este día
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {selectedDayApts
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => onSelect?.(apt)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800 truncate">{apt.clientName}</span>
                      <span className="text-xs font-mono text-gray-500 flex-shrink-0">{apt.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{apt.carModel} · {apt.carPlate}</p>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', SERVICE_COLORS[apt.serviceType])} />
                      <span className="text-xs text-gray-600">{SERVICE_LABELS[apt.serviceType]}</span>
                      <Badge
                        className={cn(
                          'text-xs px-1.5 py-0 border ml-auto',
                          STATUS_COLORS[apt.status]
                        )}
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
