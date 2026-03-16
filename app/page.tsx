import ChatInterface from '@/components/ChatInterface';
import { MessageSquare, Phone, MapPin, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white shadow-lg flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Audi-inspired logo rings */}
            <div className="flex -space-x-1.5">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white/90 bg-transparent"
                />
              ))}
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-wide">AUDI HERCOS PARAYAS</h1>
              <p className="text-gray-400 text-xs">Concesionario Oficial Audi</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>+34 942 123 456</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Parayas, Cantabria</span>
            </div>
          </div>
        </div>

        {/* Red accent bar */}
        <div className="h-0.5 bg-[#bb0a14]" />
      </header>

      {/* Hero section */}
      <div className="bg-black text-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#bb0a14]/20 border border-[#bb0a14]/40 rounded-full px-4 py-1.5 text-sm text-[#ff6b6b] mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            Asistente Virtual disponible 24/7
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Reserve su cita fácilmente
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            Nuestro asistente <span className="text-white font-medium">Alex</span> le ayudará a gestionar
            su cita en pocos minutos. Revisiones, mantenimiento, reparaciones y lavado.
          </p>
        </div>
      </div>

      {/* Services bar */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap justify-center gap-4 md:gap-8">
          {[
            { label: 'Revisión', desc: 'Inspección y pre-ITV' },
            { label: 'Reparación', desc: 'Mecánica y carrocería' },
            { label: 'Mantenimiento', desc: 'Aceite, frenos, filtros' },
            { label: 'Lavado', desc: 'Exterior e interior' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-white text-xs font-semibold">{s.label}</p>
              <p className="text-gray-500 text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-col" style={{ minHeight: '500px', maxHeight: 'calc(100vh - 320px)' }}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
            <div className="w-8 h-8 bg-[#bb0a14] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">Alex · Asistente Virtual</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-500">En línea</span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#bb0a14]" />
              <h3 className="font-semibold text-sm text-gray-800">Horario</h3>
            </div>
            <p className="text-xs text-gray-600">Lun–Vie: 8:00 – 19:00</p>
            <p className="text-xs text-gray-600">Sábado: 9:00 – 14:00</p>
            <p className="text-xs text-gray-400">Domingo: Cerrado</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-[#bb0a14]" />
              <h3 className="font-semibold text-sm text-gray-800">Contacto</h3>
            </div>
            <p className="text-xs text-gray-600">+34 942 123 456</p>
            <p className="text-xs text-gray-600">taller@audihercos.com</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-[#bb0a14]" />
              <h3 className="font-semibold text-sm text-gray-800">Ubicación</h3>
            </div>
            <p className="text-xs text-gray-600">Calle Principal 42</p>
            <p className="text-xs text-gray-600">Parayas, Cantabria</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-gray-500 text-xs text-center py-4 mt-4">
        <p>© 2024 Audi Hercos Parayas · Concesionario Oficial Audi</p>
        <p className="mt-1">
          <a href="/login" className="hover:text-gray-300 transition-colors">Acceso administración</a>
        </p>
      </footer>
    </div>
  );
}
