'use client';

import { useState, useEffect } from 'react';
import { getCars, saveCars, initStorage } from '@/lib/storage';
import { Car } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Search, Pencil, Trash2, Car as CarIcon, Phone, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS: Record<string, string> = {
  Negro: 'bg-gray-800',
  Blanco: 'bg-gray-100 border border-gray-300',
  Gris: 'bg-gray-400',
  Rojo: 'bg-red-500',
  Azul: 'bg-blue-500',
  Plateado: 'bg-gray-300',
  Naranja: 'bg-orange-500',
  Verde: 'bg-green-500',
  Amarillo: 'bg-yellow-400',
};

const EMPTY_CAR: Omit<Car, 'id'> = {
  brand: 'Audi',
  model: '',
  year: new Date().getFullYear(),
  plate: '',
  color: 'Negro',
  ownerName: '',
  ownerPhone: '',
};

export default function VehiculosPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [search, setSearch] = useState('');
  const [editCar, setEditCar] = useState<Car | null>(null);
  const [newCar, setNewCar] = useState<Omit<Car, 'id'> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    initStorage();
    setCars(getCars());
  }, []);

  function reload() {
    setCars(getCars());
  }

  function handleSaveNew() {
    if (!newCar) return;
    const car: Car = { ...newCar, id: 'car-' + Date.now() };
    const updated = [...getCars(), car];
    saveCars(updated);
    reload();
    setNewCar(null);
  }

  function handleSaveEdit() {
    if (!editCar) return;
    const all = getCars();
    const idx = all.findIndex(c => c.id === editCar.id);
    if (idx >= 0) all[idx] = editCar;
    saveCars(all);
    reload();
    setEditCar(null);
  }

  function handleDelete(id: string) {
    const updated = getCars().filter(c => c.id !== id);
    saveCars(updated);
    reload();
    setDeleteConfirm(null);
  }

  const filtered = cars.filter(c => {
    const q = search.toLowerCase();
    return !q ||
      c.model.toLowerCase().includes(q) ||
      c.plate.toLowerCase().includes(q) ||
      (c.ownerName?.toLowerCase().includes(q) ?? false);
  });

  const CarForm = ({
    data,
    onChange,
  }: {
    data: Partial<Car>;
    onChange: (d: Partial<Car>) => void;
  }) => (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Marca</label>
          <Input value={data.brand || ''} onChange={e => onChange({ ...data, brand: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Modelo *</label>
          <Input value={data.model || ''} onChange={e => onChange({ ...data, model: e.target.value })} required />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Año</label>
          <Input
            type="number"
            min="1990"
            max={new Date().getFullYear() + 1}
            value={data.year || ''}
            onChange={e => onChange({ ...data, year: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Matrícula *</label>
          <Input
            value={data.plate || ''}
            onChange={e => onChange({ ...data, plate: e.target.value.toUpperCase() })}
            className="font-mono uppercase"
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Color</label>
          <Input value={data.color || ''} onChange={e => onChange({ ...data, color: e.target.value })} />
        </div>
      </div>
      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Propietario</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
            <Input value={data.ownerName || ''} onChange={e => onChange({ ...data, ownerName: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Teléfono</label>
            <Input value={data.ownerPhone || ''} onChange={e => onChange({ ...data, ownerPhone: e.target.value })} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehículos</h1>
          <p className="text-gray-500 text-sm mt-1">{cars.length} vehículos registrados</p>
        </div>
        <Button
          className="bg-[#bb0a14] hover:bg-[#9a0811] text-white flex items-center gap-2"
          onClick={() => setNewCar({ ...EMPTY_CAR })}
        >
          <Plus className="w-4 h-4" />
          Añadir vehículo
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por modelo, matrícula o propietario..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Cars grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            <CarIcon className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm">No se encontraron vehículos</p>
          </div>
        ) : (
          filtered.map(car => (
            <Card key={car.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Color strip */}
              <div className={cn('h-1.5 w-full', COLORS[car.color] ?? 'bg-gray-400')} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{car.brand} {car.model}</h3>
                    <p className="text-xs text-gray-500">{car.year}</p>
                  </div>
                  <Badge className="font-mono text-xs bg-gray-100 text-gray-600 border-0">
                    {car.plate}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className={cn('w-3 h-3 rounded-full flex-shrink-0', COLORS[car.color] ?? 'bg-gray-400')} />
                    <span>{car.color}</span>
                  </div>
                  {car.ownerName && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{car.ownerName}</span>
                    </div>
                  )}
                  {car.ownerPhone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span>{car.ownerPhone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-7"
                    onClick={() => setEditCar(car)}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => setDeleteConfirm(car.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add car dialog */}
      <Dialog open={!!newCar} onOpenChange={open => !open && setNewCar(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#bb0a14]" />
              Añadir vehículo
            </DialogTitle>
          </DialogHeader>
          {newCar && <CarForm data={newCar} onChange={d => setNewCar(d as Omit<Car, 'id'>)} />}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setNewCar(null)}>
              <X className="w-3.5 h-3.5 mr-1" />
              Cancelar
            </Button>
            <Button
              size="sm"
              className="bg-[#bb0a14] hover:bg-[#9a0811] text-white"
              onClick={handleSaveNew}
              disabled={!newCar?.model || !newCar?.plate}
            >
              Guardar vehículo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit car dialog */}
      <Dialog open={!!editCar} onOpenChange={open => !open && setEditCar(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#bb0a14]" />
              Editar vehículo
            </DialogTitle>
          </DialogHeader>
          {editCar && <CarForm data={editCar} onChange={d => setEditCar(d as Car)} />}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditCar(null)}>
              <X className="w-3.5 h-3.5 mr-1" />
              Cancelar
            </Button>
            <Button
              size="sm"
              className="bg-[#bb0a14] hover:bg-[#9a0811] text-white"
              onClick={handleSaveEdit}
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={open => !open && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
