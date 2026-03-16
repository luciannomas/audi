'use client';

import { useState, useEffect } from 'react';
import { getAppointments, saveAppointment, updateAppointmentStatus, deleteAppointment, initStorage } from '@/lib/storage';
import { Appointment, ServiceType } from '@/lib/types';
import AppointmentCalendar from '@/components/AppointmentCalendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, List, Search, Phone, Car, Clock, Trash2, CheckCircle, X, Edit } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const SERVICE_LABELS: Record<ServiceType, string> = {
  revision: 'Revisión',
  reparacion: 'Reparación',
  mantenimiento: 'Mantenimiento',
  lavado: 'Lavado',
};

const SERVICE_COLORS: Record<ServiceType, string> = {
  revision: 'bg-blue-100 text-blue-700',
  reparacion: 'bg-red-100 text-red-700',
  mantenimiento: 'bg-yellow-100 text-yellow-700',
  lavado: 'bg-green-100 text-green-700',
};

const STATUS_COLORS: Record<Appointment['status'], string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmada: 'bg-green-100 text-green-800 border-green-200',
  completada: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelada: 'bg-red-100 text-red-800 border-red-200',
};

export default function CitasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [editApt, setEditApt] = useState<Appointment | null>(null);

  useEffect(() => {
    initStorage();
    setAppointments(getAppointments());
  }, []);

  function reload() {
    setAppointments(getAppointments());
  }

  function handleStatusChange(id: string, status: Appointment['status']) {
    updateAppointmentStatus(id, status);
    reload();
    if (selected?.id === id) {
      setSelected(prev => prev ? { ...prev, status } : null);
    }
  }

  function handleDelete(id: string) {
    deleteAppointment(id);
    reload();
    if (selected?.id === id) setSelected(null);
  }

  function handleSaveEdit() {
    if (!editApt) return;
    saveAppointment(editApt);
    reload();
    setSelected(editApt);
    setEditApt(null);
  }

  const filtered = appointments.filter(a => {
    const matchSearch = search === '' ||
      a.clientName.toLowerCase().includes(search.toLowerCase()) ||
      a.carPlate.toLowerCase().includes(search.toLowerCase()) ||
      a.carModel.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchService = filterService === 'all' || a.serviceType === filterService;
    return matchSearch && matchStatus && matchService;
  });

  const sortedFiltered = [...filtered].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.time.localeCompare(b.time);
  });

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
        <p className="text-gray-500 text-sm mt-1">Visualiza y gestiona todas las citas del taller</p>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList className="mb-4 bg-gray-100">
          <TabsTrigger value="calendar" className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-1.5">
            <List className="w-4 h-4" />
            Lista ({appointments.length})
          </TabsTrigger>
        </TabsList>

        {/* Calendar tab */}
        <TabsContent value="calendar">
          <AppointmentCalendar
            appointments={appointments}
            onSelect={apt => setSelected(apt)}
          />
        </TabsContent>

        {/* List tab */}
        <TabsContent value="list">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente, matrícula o modelo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={v => setFilterStatus(v ?? 'all')}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterService} onValueChange={v => setFilterService(v ?? 'all')}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los servicios</SelectItem>
                <SelectItem value="revision">Revisión</SelectItem>
                <SelectItem value="reparacion">Reparación</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="lavado">Lavado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Cliente</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Vehículo</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Servicio</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Fecha</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Estado</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                        No se encontraron citas
                      </td>
                    </tr>
                  ) : (
                    sortedFiltered.map(apt => (
                      <tr
                        key={apt.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelected(apt)}
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-800">{apt.clientName}</p>
                          <p className="text-xs text-gray-400">{apt.clientPhone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{apt.carModel}</p>
                          <p className="text-xs font-mono text-gray-400">{apt.carPlate}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn('text-xs', SERVICE_COLORS[apt.serviceType])}>
                            {SERVICE_LABELS[apt.serviceType]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">
                            {format(parseISO(apt.date), 'd MMM yyyy', { locale: es })}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">{apt.time}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn('text-xs border', STATUS_COLORS[apt.status])}>
                            {apt.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditApt(apt)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {apt.status === 'pendiente' && (
                              <button
                                onClick={() => handleStatusChange(apt.id, 'confirmada')}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Confirmar"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {(apt.status === 'pendiente' || apt.status === 'confirmada') && (
                              <button
                                onClick={() => handleStatusChange(apt.id, 'completada')}
                                className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                title="Marcar completada"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(apt.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#bb0a14]" />
              Detalle de la cita
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Cliente</p>
                  <p className="font-medium text-gray-800">{selected.clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Teléfono</p>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <p className="text-gray-700">{selected.clientPhone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Vehículo</p>
                  <div className="flex items-center gap-1">
                    <Car className="w-3 h-3 text-gray-400" />
                    <p className="text-gray-700">{selected.carModel}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Matrícula</p>
                  <p className="font-mono text-gray-700">{selected.carPlate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Fecha</p>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <p className="text-gray-700">
                      {format(parseISO(selected.date), "d MMM yyyy", { locale: es })} · {selected.time}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Servicio</p>
                  <Badge className={cn('text-xs', SERVICE_COLORS[selected.serviceType])}>
                    {SERVICE_LABELS[selected.serviceType]}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Descripción</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{selected.serviceDescription}</p>
              </div>
              {selected.notes && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Notas</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{selected.notes}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Estado actual</p>
                <div className="flex flex-wrap gap-2">
                  {(['pendiente', 'confirmada', 'completada', 'cancelada'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selected.id, s)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                        selected.status === s
                          ? STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                if (selected) {
                  handleDelete(selected.id);
                  setSelected(null);
                }
              }}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Eliminar
            </Button>
            <Button size="sm" onClick={() => setSelected(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editApt} onOpenChange={open => !open && setEditApt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-[#bb0a14]" />
              Editar cita
            </DialogTitle>
          </DialogHeader>
          {editApt && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nombre cliente</label>
                  <Input
                    value={editApt.clientName}
                    onChange={e => setEditApt({ ...editApt, clientName: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Teléfono</label>
                  <Input
                    value={editApt.clientPhone}
                    onChange={e => setEditApt({ ...editApt, clientPhone: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fecha</label>
                  <Input
                    type="date"
                    value={editApt.date}
                    onChange={e => setEditApt({ ...editApt, date: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Hora</label>
                  <Input
                    type="time"
                    value={editApt.time}
                    onChange={e => setEditApt({ ...editApt, time: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Estado</label>
                <Select
                  value={editApt.status}
                  onValueChange={v => v && setEditApt({ ...editApt, status: v as Appointment['status'] })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditApt(null)}>
              <X className="w-3.5 h-3.5 mr-1" />
              Cancelar
            </Button>
            <Button size="sm" className="bg-[#bb0a14] hover:bg-[#9a0811] text-white" onClick={handleSaveEdit}>
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
