'use client';

import { CalendarDays, Newspaper, LogIn, Menu, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function LandingPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-green-950/20 to-black">
      {/* Fondo con imagen y overlay elegante */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-50"
          style={{ backgroundImage: "url('/image/FondoLogin.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Header con navegación */}
      <header className="sticky top-0 z-50 w-full border-b border-green-500/20 bg-black/40 backdrop-blur-xl supports-[backdrop-filter]:bg-black/30">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          {/* Logo y nombre - versión pequeña para header */}
          <Link href="/" className="group flex items-center gap-2 transition-all hover:scale-105">
            <div className="rounded-full bg-gradient-to-br from-green-600 to-emerald-800 p-1.5 shadow-lg shadow-green-900/30">
              <Image 
                src="/image/LogoS.png" 
                alt="Logo SICRONOTIC" 
                width={28} 
                height={28} 
                className="h-7 w-7 object-contain"
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-white md:text-xl">
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">SICRONOTIC</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Menú Noticias */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-white/80 hover:text-white data-[state=open]:text-white">
                    <Newspaper className="mr-2 h-4 w-4" />
                    Noticias
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-64 gap-2 p-3 bg-black/90 backdrop-blur-md border border-green-500/30 rounded-xl">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/noticias"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-green-900/40 hover:text-green-300"
                          >
                            <div className="text-sm font-medium leading-none text-white">Últimas Noticias</div>
                            <p className="line-clamp-2 text-xs leading-snug text-white/60">
                              Entérate de los eventos y novedades del sistema.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Menú Calendario */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-white/80 hover:text-white data-[state=open]:text-white">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Calendario
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-64 gap-2 p-3 bg-black/90 backdrop-blur-md border border-green-500/30 rounded-xl">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/calendario"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-green-900/40 hover:text-green-300"
                          >
                            <div className="text-sm font-medium leading-none text-white">Calendario Académico</div>
                            <p className="line-clamp-2 text-xs leading-snug text-white/60">
                              Fechas de eventos y actividades.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

            
             
              </NavigationMenuList>
            </NavigationMenu> 

            {/* Botón Iniciar Sesión Profesor / Cerrar sesión admin */}
            {isAdmin ? (
              <Button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="group relative overflow-hidden rounded-full border border-red-500/50 bg-gradient-to-r from-red-700/80 to-red-600/80 px-6 py-2 text-white shadow-lg shadow-red-900/30 backdrop-blur-sm transition-all hover:scale-105 hover:border-red-400 hover:shadow-red-500/40"
              >
                <span className="font-medium">Cerrar sesión</span>
                <span className="absolute inset-0 -z-10 bg-gradient-to-r from-red-600 to-red-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>
            ) : (
              <Link href="/login">
                <Button className="group relative overflow-hidden rounded-full border border-green-500/50 bg-gradient-to-r from-green-800/80 to-emerald-900/80 px-6 py-2 text-white shadow-lg shadow-green-900/30 backdrop-blur-sm transition-all hover:scale-105 hover:border-green-400 hover:shadow-green-500/40">
                  <LogIn className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                  <span className="font-medium">Profesor</span>
                  <span className="absolute inset-0 -z-10 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] border-l border-green-500/30 bg-black/95 backdrop-blur-xl">
              <div className="flex flex-col gap-6 pt-12">
                <Link href="/noticias" className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/80 transition-colors hover:bg-green-900/40 hover:text-white">
                  <Newspaper className="h-5 w-5" />
                  <span>Noticias</span>
                </Link>
                <Link href="/calendario" className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/80 transition-colors hover:bg-green-900/40 hover:text-white">
                  <CalendarDays className="h-5 w-5" />
                  <span>Calendario</span>
                </Link>
                
                <div className="my-2 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
                {!isAdmin ? (
                  <Link href="/login" className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/80 transition-colors hover:bg-green-900/40 hover:text-white">
                    <LogIn className="h-5 w-5" />
                    <span>Iniciar Sesión (Profesor)</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-white/80 transition-colors hover:bg-red-900/40 hover:text-white"
                  >
                    <LogIn className="h-5 w-5 rotate-180" />
                    <span>Cerrar Sesión</span>
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero Section con animaciones */}
      <main className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center overflow-hidden px-4 py-12">
        {/* Elementos decorativos animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-green-600/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-700/20 blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto flex max-w-5xl flex-col items-center text-center space-y-8">
          {/* Logo GRANDE y destacado */}
          <div className="animate-fade-up group relative">
            {/* Efecto de brillo detrás del logo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-700" />
            
            {/* Contenedor del logo con animación de flotación */}
            <div className="relative animate-float">
              <div className="rounded-full bg-gradient-to-br from-green-600/30 to-emerald-800/30 p-4 backdrop-blur-sm shadow-2xl shadow-green-900/50">
                <div className="rounded-full bg-gradient-to-br from-green-600 to-emerald-800 p-6 shadow-inner">
                  <Image 
                    src="/image/LogoS.png" 
                    alt="Logo SICRONOTIC" 
                    width={140} 
                    height={140} 
                    className="h-32 w-32 md:h-40 md:w-40 object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Badge elegante */}
          <div className="inline-flex animate-fade-up items-center rounded-full border border-green-500/30 bg-white/5 px-3 py-1 text-sm text-green-300 backdrop-blur-sm">
            <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-green-400" />
            U.E.N Cuatricentenaria
          </div>

          {/* Título principal */}
          <h1 className="animate-slide-up text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-7xl">
            Bienvenidos a{' '}
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-300 bg-clip-text text-transparent">
              SICRONOTIC
            </span>
          </h1>

          {/* Descripción */}
          <p className="animate-slide-up animation-delay-200 max-w-2xl text-base text-white/70 sm:text-lg md:text-xl">
           La agenda de eventos de la Unidad Educativa Cuatricentenaria, donde podrás encontrar las últimas noticias y el calendario académico actualizado.
          </p>

          {/* Call to action rápida */}
          <div className="flex animate-slide-up animation-delay-400 flex-wrap items-center justify-center gap-4">
            <Link href="/noticias">
              <Button variant="outline" className="border-green-500/50 bg-black/30 text-white backdrop-blur-sm transition-all duration-300 hover:border-green-400 hover:bg-green-900/40">
                Ver Noticias
              </Button>
            </Link>
            <Link href="/calendario">
              <Button className="bg-gradient-to-r from-green-700 to-emerald-800 text-white shadow-lg shadow-green-900/40 transition-all duration-300 hover:scale-105">
                Calendario Escolar
              </Button>
            </Link>
          
          </div>
        </div>

        {/* Footer con olas decorativas */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative h-16 w-full text-black/20">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white/10" />
          </svg>
        </div>
      </main>

      {/* Estilos de animación con CSS-in-JS usando Tailwind */}
      <style jsx global>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-fade-up {
          animation: fade-up 0.8s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}