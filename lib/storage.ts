import { User, Car, Appointment } from './types';

const KEYS = {
  USER: 'audi_hercos_user',
  CARS: 'audi_hercos_cars',
  APPOINTMENTS: 'audi_hercos_appointments',
  AUTH: 'audi_hercos_auth',
};

export const SUPERADMIN: User = {
  id: 'user-1',
  name: 'Admin Hercos',
  email: 'admin@audihercos.com',
  password: 'hercos2024',
  role: 'superadmin',
};

export const SAMPLE_CARS: Car[] = [
  { id: 'car-1', brand: 'Audi', model: 'A4', year: 2022, plate: '1234-ABC', color: 'Negro', ownerName: 'Carlos Martínez', ownerPhone: '+34 612 345 678' },
  { id: 'car-2', brand: 'Audi', model: 'Q5', year: 2021, plate: '5678-DEF', color: 'Blanco', ownerName: 'María García', ownerPhone: '+34 698 765 432' },
  { id: 'car-3', brand: 'Audi', model: 'A3', year: 2023, plate: '9012-GHI', color: 'Gris', ownerName: 'Pedro López', ownerPhone: '+34 654 321 987' },
  { id: 'car-4', brand: 'Audi', model: 'Q3', year: 2020, plate: '3456-JKL', color: 'Rojo', ownerName: 'Ana Ruiz', ownerPhone: '+34 677 890 123' },
  { id: 'car-5', brand: 'Audi', model: 'A6', year: 2022, plate: '7890-MNO', color: 'Azul', ownerName: 'Luis Torres', ownerPhone: '+34 645 678 901' },
  { id: 'car-6', brand: 'Audi', model: 'e-tron', year: 2023, plate: '2345-PQR', color: 'Plateado', ownerName: 'Elena Sánchez', ownerPhone: '+34 689 012 345' },
  { id: 'car-7', brand: 'Audi', model: 'TT', year: 2019, plate: '6789-STU', color: 'Naranja', ownerName: 'Roberto Jiménez', ownerPhone: '+34 631 234 567' },
];

const today = new Date();
const addDays = (d: Date, n: number) => {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd.toISOString().split('T')[0];
};

export const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    clientName: 'Carlos Martínez',
    clientPhone: '+34 612 345 678',
    carPlate: '1234-ABC',
    carModel: 'Audi A4',
    serviceType: 'mantenimiento',
    serviceDescription: 'Cambio de aceite y filtros',
    date: addDays(today, 2),
    time: '10:00',
    status: 'confirmada',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt-2',
    clientName: 'María García',
    clientPhone: '+34 698 765 432',
    carPlate: '5678-DEF',
    carModel: 'Audi Q5',
    serviceType: 'revision',
    serviceDescription: 'Revisión pre-ITV',
    date: addDays(today, 3),
    time: '11:30',
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt-3',
    clientName: 'Pedro López',
    clientPhone: '+34 654 321 987',
    carPlate: '9012-GHI',
    carModel: 'Audi A3',
    serviceType: 'lavado',
    serviceDescription: 'Lavado completo interior y exterior',
    date: addDays(today, 1),
    time: '09:00',
    status: 'confirmada',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt-4',
    clientName: 'Ana Ruiz',
    clientPhone: '+34 677 890 123',
    carPlate: '3456-JKL',
    carModel: 'Audi Q3',
    serviceType: 'reparacion',
    serviceDescription: 'Reparación de frenos delanteros',
    date: addDays(today, 0),
    time: '14:00',
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt-5',
    clientName: 'Luis Torres',
    clientPhone: '+34 645 678 901',
    carPlate: '7890-MNO',
    carModel: 'Audi A6',
    serviceType: 'mantenimiento',
    serviceDescription: 'Revisión periódica 60.000 km',
    date: addDays(today, 5),
    time: '09:30',
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  },
];

export function initStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(KEYS.CARS)) {
    localStorage.setItem(KEYS.CARS, JSON.stringify(SAMPLE_CARS));
  }
  if (!localStorage.getItem(KEYS.APPOINTMENTS)) {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(SAMPLE_APPOINTMENTS));
  }
}

export function getAuth(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(KEYS.AUTH);
  return data ? JSON.parse(data) : null;
}

export function setAuth(user: User) {
  localStorage.setItem(KEYS.AUTH, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(KEYS.AUTH);
}

export function login(email: string, password: string): User | null {
  if (email === SUPERADMIN.email && password === SUPERADMIN.password) {
    setAuth(SUPERADMIN);
    return SUPERADMIN;
  }
  return null;
}

export function getCars(): Car[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.CARS);
  return data ? JSON.parse(data) : SAMPLE_CARS;
}

export function saveCars(cars: Car[]) {
  localStorage.setItem(KEYS.CARS, JSON.stringify(cars));
}

export function getAppointments(): Appointment[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.APPOINTMENTS);
  return data ? JSON.parse(data) : SAMPLE_APPOINTMENTS;
}

export function saveAppointment(apt: Appointment) {
  const apts = getAppointments();
  const idx = apts.findIndex(a => a.id === apt.id);
  if (idx >= 0) apts[idx] = apt;
  else apts.push(apt);
  localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(apts));
}

export function deleteAppointment(id: string) {
  const apts = getAppointments().filter(a => a.id !== id);
  localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(apts));
}

export function updateAppointmentStatus(id: string, status: Appointment['status']) {
  const apts = getAppointments();
  const apt = apts.find(a => a.id === id);
  if (apt) {
    apt.status = status;
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(apts));
  }
}
