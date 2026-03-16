'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { login, getAuth } from '@/lib/storage';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = getAuth();
    if (user) {
      router.replace('/admin');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 400)); // Brief delay for UX

    const user = login(email, password);
    if (user) {
      router.push('/admin');
    } else {
      setError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white/80 bg-transparent"
                />
              ))}
            </div>
          </div>
          <h1 className="text-white font-bold text-2xl tracking-widest uppercase">Audi Hercos</h1>
          <p className="text-gray-400 text-sm mt-1">Parayas · Panel de Administración</p>
          <div className="h-0.5 bg-[#bb0a14] mt-4 mx-8 rounded" />
        </div>

        <Card className="bg-gray-900 border-gray-700 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg">Acceso restringido</CardTitle>
            <CardDescription className="text-gray-400">
              Introduce tus credenciales de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@audihercos.com"
                    className="pl-9 bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-[#bb0a14] focus:ring-[#bb0a14]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-[#bb0a14] focus:ring-[#bb0a14]"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#bb0a14] hover:bg-[#9a0811] text-white font-semibold py-2.5 transition-colors"
              >
                {isLoading ? 'Verificando...' : 'Iniciar sesión'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-gray-600 text-xs text-center">
                Demo: admin@audihercos.com / hercos2024
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-6">
          <Link href="/" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
            ← Volver al chat de clientes
          </Link>
        </p>
      </div>
    </div>
  );
}
