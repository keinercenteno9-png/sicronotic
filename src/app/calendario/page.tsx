// src/app/calendario/page.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Bell,
  X,
  Trash2,
  CalendarDays,
  ListOrdered,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sun,
  Moon,
  Coffee,
  Briefcase,
  Home,
  Video,
  Music,
  Heart,
  Star,
  Zap,
  CloudSun,
  Sparkles,
  Gift,
  Trophy,
  BookOpen,
  Dumbbell,
  Plane,
  ShoppingBag,
  Phone,
  MessageCircle,
  Loader2,
  RefreshCw,
  TrendingUp,
  AlarmClock,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { toast, Toaster } from 'sonner'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

// Tipos
interface Evento {
  id: string
  titulo: string
  fecha: Date
  horaInicio: string
  horaFin: string
  ubicacion: string | null
  descripcion: string | null
  invitados: string[]
  notificar: boolean
  color: string
  textColor: string
  bold: boolean
  italic: boolean
  underline: boolean
  textAlign: 'left' | 'center' | 'right'
  icono: string | null
}

interface HoraData {
  hora: string
  horaNum: number
  periodo: string
  eventos: Evento[]
}

interface ColorDisponible {
  nombre: string
  bg: string
  text: string
}

interface IconoDisponible {
  nombre: string
  icono: React.ComponentType<{ className?: string }>
}

interface NuevoEventoState {
  titulo: string
  fecha: string
  horaInicio: string
  horaFin: string
  ubicacion: string
  descripcion: string
  invitados: string
  notificar: boolean
  color: string
  textColor: string
  bold: boolean
  italic: boolean
  underline: boolean
  textAlign: 'left' | 'center' | 'right'
  icono: string
}

// Constantes tipadas - COLORES ORIGINALES DE LAS NOTAS
const coloresDisponibles: ColorDisponible[] = [
  { nombre: 'Blanco', bg: '#FFFFFF', text: '#000000' },
  { nombre: 'Azul Claro', bg: '#DBEAFE', text: '#1E3A8A' },
  { nombre: 'Verde Claro', bg: '#D1FAE5', text: '#064E3B' },
  { nombre: 'Amarillo', bg: '#FEF3C7', text: '#78350F' },
  { nombre: 'Rojo Claro', bg: '#FEE2E2', text: '#7F1D1D' },
  { nombre: 'Morado Claro', bg: '#F3E8FF', text: '#4C1D95' },
  { nombre: 'Rosa Claro', bg: '#FCE7F3', text: '#9D174D' },
  { nombre: 'Naranja Claro', bg: '#FFEDD5', text: '#9A3412' },
  { nombre: 'Celeste', bg: '#E0F2FE', text: '#0C4A6E' },
  { nombre: 'Verde Menta', bg: '#CCFBF1', text: '#134E4A' },
  { nombre: 'Lavanda', bg: '#E9D5FF', text: '#4C1D95' },
  { nombre: 'Durazno', bg: '#FEE2E2', text: '#7F1D1D' }
]

const iconosDisponibles: IconoDisponible[] = [
  { nombre: 'Trabajo', icono: Briefcase },
  { nombre: 'Reunión', icono: Users },
  { nombre: 'Casa', icono: Home },
  { nombre: 'Video llamada', icono: Video },
  { nombre: 'Música', icono: Music },
  { nombre: 'Corazón', icono: Heart },
  { nombre: 'Estrella', icono: Star },
  { nombre: 'Rayo', icono: Zap },
  { nombre: 'Sol', icono: CloudSun },
  { nombre: 'Brillante', icono: Sparkles },
  { nombre: 'Regalo', icono: Gift },
  { nombre: 'Trofeo', icono: Trophy },
  { nombre: 'Libro', icono: BookOpen },
  { nombre: 'Ejercicio', icono: Dumbbell },
  { nombre: 'Viaje', icono: Plane },
  { nombre: 'Compras', icono: ShoppingBag },
  { nombre: 'Teléfono', icono: Phone },
  { nombre: 'Mensaje', icono: MessageCircle },
  { nombre: 'Café', icono: Coffee }
]

const diasSemana: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// COMPONENTE STICKY NOTE ORIGINAL
const StickyNote = ({ evento, onClick, className = '' }: { 
  evento: Evento; 
  onClick?: () => void; 
  className?: string 
}): React.ReactElement => {
  const iconoEncontrado = iconosDisponibles.find(i => i.nombre === evento.icono)
  const IconComponent = iconoEncontrado?.icono || CalendarIcon
  
  return (
    <div
      onClick={onClick}
      className={`relative rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden ${className}`}
      style={{
        backgroundColor: evento.color,
        color: evento.textColor,
        fontWeight: evento.bold ? 'bold' : 'normal',
        fontStyle: evento.italic ? 'italic' : 'normal',
        textDecoration: evento.underline ? 'underline' : 'none',
        textAlign: evento.textAlign
      }}
    >
      <div 
        className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px]"
        style={{
          borderTopColor: evento.color,
          borderRightColor: 'rgba(0,0,0,0.1)',
          borderLeftColor: 'transparent',
          borderBottomColor: 'transparent'
        }}
      />
      <div className="p-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <IconComponent className="w-3 h-3 opacity-80" />
            <span className="font-mono text-[10px] opacity-90">{evento.horaInicio.substring(0, 5)}</span>
          </div>
          {evento.notificar && <Bell className="w-3 h-3 opacity-60" />}
        </div>
        <div className="font-medium text-sm truncate">{evento.titulo}</div>
        {evento.ubicacion && (
          <div className="flex items-center gap-1 mt-1 text-[10px] opacity-70">
            <MapPin className="w-2.5 h-2.5" />
            <span className="truncate">{evento.ubicacion}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// COMPONENTE STICKY NOTE MES ORIGINAL
const StickyNoteMes = ({ evento, onClick }: { 
  evento: Evento; 
  onClick?: () => void 
}): React.ReactElement => {
  const iconoEncontrado = iconosDisponibles.find(i => i.nombre === evento.icono)
  const IconComponent = iconoEncontrado?.icono || CalendarIcon
  
  return (
    <div
      onClick={onClick}
      className="relative rounded-md shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden text-[10px]"
      style={{
        backgroundColor: evento.color,
        color: evento.textColor,
        fontWeight: evento.bold ? 'bold' : 'normal',
        fontStyle: evento.italic ? 'italic' : 'normal',
        textDecoration: evento.underline ? 'underline' : 'none',
        textAlign: evento.textAlign
      }}
    >
      <div 
        className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-r-[12px]"
        style={{
          borderTopColor: evento.color,
          borderRightColor: 'rgba(0,0,0,0.15)',
          borderLeftColor: 'transparent',
          borderBottomColor: 'transparent'
        }}
      />
      <div className="p-1.5">
        <div className="flex items-center justify-between gap-1">
          <IconComponent className="w-2.5 h-2.5 opacity-70" />
          <span className="font-mono text-[9px] font-bold opacity-90">{evento.horaInicio.substring(0, 5)}</span>
          {evento.notificar && <Bell className="w-2.5 h-2.5 opacity-70" />}
        </div>
        <div className="font-medium truncate text-[11px] mt-0.5">{evento.titulo}</div>
      </div>
    </div>
  )
}

// Componente de actividad (gráfico de barras)
const ActivityChart = ({ eventos }: { eventos: Evento[] }) => {
  const actividadPorDia = useMemo(() => {
    const dias = Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - (6 - i))
      const count = eventos.filter(e => isSameDay(e.fecha, fecha)).length
      return { fecha, count, label: format(fecha, 'EEE', { locale: es }).toUpperCase() }
    })
    return dias
  }, [eventos])

  const maxCount = Math.max(...actividadPorDia.map(d => d.count), 1)

  return (
    <div className="space-y-3">
      {actividadPorDia.map((dia, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center gap-3 group"
        >
          <span className="text-xs text-white/40 w-8 font-mono">{dia.label}</span>
          <div className="flex-1 h-8 bg-white/5 rounded-xl overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(dia.count / maxCount) * 100}%` }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="h-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
            </motion.div>
          </div>
          <span className="text-xs text-white/60 font-mono w-6 text-right">
            {dia.count}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

// Hook de notificaciones
function useNotificaciones() {
  const notificadosRef = useRef<Set<string>>(new Set())
  
  useEffect(() => {
    // Verificar notificaciones cada minuto
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/notificaciones/check')
        const result = await response.json()
        
        if (result.success && result.eventos && result.eventos.length > 0) {
          for (const evento of result.eventos) {
            if (!notificadosRef.current.has(evento.id)) {
              notificadosRef.current.add(evento.id)
              
              // Mostrar notificación con sonner
              toast.info(`🔔 ¡Recordatorio!`, {
                description: `"${evento.titulo}" comienza a las ${evento.horaInicio}`,
                duration: 10000,
                action: {
                  label: 'Ver',
                  onClick: () => {
                    window.location.href = '/calendario'
                  }
                }
              })
              
              // Notificación del navegador
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('📅 Recordatorio de evento', {
                  body: `"${evento.titulo}" comienza a las ${evento.horaInicio}`,
                  icon: '/favicon.ico',
                  silent: false
                })
              }
            }
          }
        }
      } catch (error) {
        console.error('Error verificando notificaciones:', error)
      }
    }, 60000) // Cada minuto
    
    // Solicitar permiso para notificaciones del navegador
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    return () => clearInterval(interval)
  }, [])
}

// Componente principal
export default function CalendarioPage(): React.ReactElement {
  const { role } = useCurrentUser()
  const isAdmin = role === 'ADMIN'
  const [fechaActual, setFechaActual] = useState<Date>(new Date())
  const [mostrarModal, setMostrarModal] = useState<boolean>(false)
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null)
  const [eventosDelDiaSeleccionados, setEventosDelDiaSeleccionados] = useState<Evento[] | null>(null)
  const [vista, setVista] = useState<'mes' | 'dias'>('mes')
  const [fechaHoras, setFechaHoras] = useState<Date>(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return hoy
  })
  const [eventos, setEventos] = useState<Evento[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [horaActual, setHoraActual] = useState<Date>(new Date())
  
  const [nuevoEvento, setNuevoEvento] = useState<NuevoEventoState>({
    titulo: '',
    fecha: '',
    horaInicio: '09:00',
    horaFin: '10:00',
    ubicacion: '',
    descripcion: '',
    invitados: '',
    notificar: false,
    color: '#FFFFFF',
    textColor: '#000000',
    bold: false,
    italic: false,
    underline: false,
    textAlign: 'left',
    icono: 'Trabajo'
  })

  // Activar notificaciones
  useNotificaciones()

  // Actualizar hora actual cada minuto
  useEffect(() => {
    const interval = setInterval(() => setHoraActual(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Cargar eventos desde la API
  const cargarEventos = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setIsLoading(true)
    
    try {
      const response = await fetch('/api/eventos')
      const result = await response.json()
      
      if (result.success) {
        const eventosConvertidos: Evento[] = result.data.map((evento: any) => {
          const fechaUTC = new Date(evento.fecha)
          const fechaLocal = new Date(fechaUTC.getFullYear(), fechaUTC.getMonth(), fechaUTC.getDate())
          return {
            id: evento.id,
            titulo: evento.titulo,
            fecha: fechaLocal,
            horaInicio: evento.horaInicio,
            horaFin: evento.horaFin,
            ubicacion: evento.ubicacion,
            descripcion: evento.descripcion,
            invitados: evento.invitados?.map((i: any) => i.nombre) || [],
            notificar: evento.notificar,
            color: evento.color,
            textColor: evento.textColor,
            bold: evento.bold,
            italic: evento.italic,
            underline: evento.underline,
            textAlign: evento.textAlign,
            icono: evento.icono
          }
        })
        setEventos(eventosConvertidos)
      } else {
        toast.error('Error al cargar eventos')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de conexión')
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [])

  const obtenerEventosDelDia = useCallback((fecha: Date): Evento[] => {
    return eventos.filter(evento => isSameDay(evento.fecha, fecha))
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  }, [eventos])

  const obtenerEventosPorHora = useCallback((fecha: Date): HoraData[] => {
    const horas: HoraData[] = []
    const eventosDelDia = obtenerEventosDelDia(fecha)
    
    for (let i = 0; i < 24; i++) {
      const horaNum = i % 12 || 12
      const periodo = i < 12 ? 'AM' : 'PM'
      
      const eventosEnHora = eventosDelDia.filter((evento: Evento) => {
        const [hEvento] = evento.horaInicio.split(':')
        return parseInt(hEvento) === i
      })
      
      horas.push({
        hora: `${horaNum.toString().padStart(2, '0')}:00 ${periodo}`,
        horaNum: i,
        periodo,
        eventos: eventosEnHora
      })
    }
    
    return horas
  }, [obtenerEventosDelDia])

  const obtenerDiasDelMes = useCallback((fecha: Date): Date[] => {
    const start = startOfWeek(startOfMonth(fecha), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(fecha), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [])

  const obtenerNombreMes = useCallback((fecha: Date): string => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return meses[fecha.getMonth()]
  }, [])

  const formatearFechaParaInput = useCallback((fecha: Date): string => {
    const year = fecha.getFullYear()
    const month = String(fecha.getMonth() + 1).padStart(2, '0')
    const day = String(fecha.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  const cambiarMes = useCallback((direccion: 'prev' | 'next') => {
    setFechaActual(prev => direccion === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1))
  }, [])

  const cambiarFechaHoras = useCallback((direccion: 'prev' | 'next') => {
    setFechaHoras(prev => {
      const nuevaFecha = new Date(prev)
      if (direccion === 'prev') {
        nuevaFecha.setDate(prev.getDate() - 1)
      } else {
        nuevaFecha.setDate(prev.getDate() + 1)
      }
      return nuevaFecha
    })
  }, [])

  const irAHoy = useCallback((): void => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    setFechaHoras(hoy)
    cargarEventos()
  }, [cargarEventos])

  const agregarEvento = useCallback(async () => {
    if (!nuevoEvento.titulo || !nuevoEvento.fecha) {
      toast.error('Complete título y fecha')
      return
    }
    
    setIsSaving(true)
    
    try {
      const invitadosList = nuevoEvento.invitados.split(',').map(i => i.trim()).filter(i => i !== '')
      
      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: nuevoEvento.titulo,
          fecha: nuevoEvento.fecha,
          horaInicio: nuevoEvento.horaInicio,
          horaFin: nuevoEvento.horaFin,
          ubicacion: nuevoEvento.ubicacion || null,
          descripcion: nuevoEvento.descripcion || null,
          notificar: nuevoEvento.notificar,
          color: nuevoEvento.color,
          textColor: nuevoEvento.textColor,
          bold: nuevoEvento.bold,
          italic: nuevoEvento.italic,
          underline: nuevoEvento.underline,
          textAlign: nuevoEvento.textAlign,
          icono: nuevoEvento.icono,
          invitados: invitadosList
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Evento "${nuevoEvento.titulo}" creado`)
        setMostrarModal(false)
        setNuevoEvento({
          titulo: '',
          fecha: '',
          horaInicio: '09:00',
          horaFin: '10:00',
          ubicacion: '',
          descripcion: '',
          invitados: '',
          notificar: false,
          color: '#FFFFFF',
          textColor: '#000000',
          bold: false,
          italic: false,
          underline: false,
          textAlign: 'left',
          icono: 'Trabajo'
        })
        await cargarEventos()
      } else {
        toast.error(result.error || 'Error al crear')
      }
    } catch (error) {
      toast.error('Error al crear evento')
    } finally {
      setIsSaving(false)
    }
  }, [nuevoEvento, cargarEventos])

  // FUNCIÓN ELIMINAR CORREGIDA
  const eliminarEvento = useCallback(async (id: string) => {
    const eventoEliminado = eventos.find((e: Evento) => e.id === id)
    
    console.log('🗑️ Intentando eliminar evento:', id, eventoEliminado?.titulo)
    
    if (!eventoEliminado) {
      toast.error('Evento no encontrado')
      return
    }
    
    try {
      const response = await fetch(`/api/eventos/${id}`, {
        method: 'DELETE',
      })
      
      console.log('📡 Respuesta DELETE status:', response.status)
      
      const result = await response.json()
      console.log('📦 Respuesta DELETE body:', result)
      
      if (result.success) {
        setEventoSeleccionado(null)
        setEventosDelDiaSeleccionados(null)
        await cargarEventos()
        toast.success(`Evento "${eventoEliminado.titulo}" eliminado correctamente`)
      } else {
        toast.error(result.error || 'Error al eliminar el evento')
      }
    } catch (error) {
      console.error('❌ Error al eliminar:', error)
      toast.error('Error de conexión al eliminar el evento')
    }
  }, [eventos, cargarEventos])

  const manejarClickEventoDia = useCallback((eventosDia: Evento[]): void => {
    if (eventosDia.length === 1) {
      setEventoSeleccionado(eventosDia[0])
    } else {
      setEventosDelDiaSeleccionados(eventosDia)
    }
  }, [])

  useEffect(() => {
    cargarEventos()
  }, [cargarEventos])

  const eventosHoy = obtenerEventosDelDia(fechaHoras)
  const totalEventosHoy = eventosHoy.length
  const eventosConNotificacion = eventosHoy.filter((e: Evento) => e.notificar).length
  const esHoy = isToday(fechaHoras)
  const horasDelDia = obtenerEventosPorHora(fechaHoras)
  const diasDelMes = obtenerDiasDelMes(fechaActual)

  // Estadísticas sidebar
  const eventosEsteMes = eventos.filter(e => isSameMonth(e.fecha, fechaActual)).length
  const eventosHoySidebar = obtenerEventosDelDia(new Date()).length
  const proximosEventos = eventos
    .filter(e => e.fecha >= new Date())
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
    .slice(0, 3)

  if (isLoading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0A0A0A] to-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0A0A0A] to-[#0D0D0D]">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header con glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-white/60 hover:text-white transition-all rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Volver
                </motion.button>
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-50" />
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                    <CalendarDays className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Calendario De Eventos
                  </h1>
                  <p className="text-xs text-white/40">Organiza tus eventos con estilo</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => cargarEventos(true)}
                disabled={refreshing}
                className="p-2 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>

              <div className="flex bg-white/5 backdrop-blur-sm rounded-2xl p-1">
                <button
                  onClick={() => setVista('mes')}
                  className={`px-5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    vista === 'mes' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30' 
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span className="text-sm font-medium">Mes</span>
                </button>
                <button
                  onClick={() => setVista('dias')}
                  className={`px-5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    vista === 'dias' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30' 
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  <ListOrdered className="w-4 h-4" />
                  <span className="text-sm font-medium">Días</span>
                </button>
              </div>

              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setNuevoEvento(prev => ({ ...prev, fecha: format(new Date(), 'yyyy-MM-dd') }))
                    setMostrarModal(true)
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Nuevo Evento</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Indicador de eventos */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${totalEventosHoy > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-xs text-white/40">
              {totalEventosHoy} evento{totalEventosHoy !== 1 ? 's' : ''} para hoy
            </span>
          </div>
          {totalEventosHoy > 0 && (
            <span className="text-xs text-green-500 font-medium">✓ Eventos cargados</span>
          )}
        </div>

        {/* Grid principal: Calendario + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Columna principal del calendario */}
          <div className="flex-1">
            {/* Vista de Días */}
            {vista === 'dias' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => cambiarFechaHoras('prev')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-white/60" />
                      </button>
                      
                      <div className="text-center">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-green-500" />
                          <span className="text-xl font-semibold text-white">
                            {fechaHoras.toLocaleDateString('es-ES', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long' 
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">
                          {fechaHoras.toLocaleDateString('es-ES', { year: 'numeric' })}
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => cambiarFechaHoras('next')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-white/60" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      {!esHoy && (
                        <button
                          onClick={irAHoy}
                          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Hoy
                        </button>
                      )}
                      
                      <div className="flex gap-3">
                        <div className="bg-green-500/10 rounded-xl px-3 py-2 text-center">
                          <div className="text-2xl font-bold text-green-400">{totalEventosHoy}</div>
                          <div className="text-[10px] text-white/40">Eventos</div>
                        </div>
                        <div className="bg-amber-500/10 rounded-xl px-3 py-2 text-center">
                          <div className="text-2xl font-bold text-amber-400">{eventosConNotificacion}</div>
                          <div className="text-[10px] text-white/40">Recordatorios</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
                  <div className="relative">
                    {horasDelDia.map((horaData, idx) => {
                      const esHoraActual = esHoy && horaActual.getHours() === horaData.horaNum
                      const tieneEventos = horaData.eventos.length > 0
                      
                      return (
                        <div
                          key={idx}
                          className={`group transition-all duration-200 border-b border-white/10 last:border-b-0 ${
                            esHoraActual ? 'bg-green-500/5' : ''
                          } ${tieneEventos ? 'hover:bg-white/5' : ''}`}
                        >
                          <div className="flex">
                            <div className={`w-28 p-3 text-center border-r border-white/10 flex-shrink-0 relative ${
                              esHoraActual ? 'bg-green-500/10' : ''
                            }`}>
                              <div className="flex flex-col items-center gap-1">
                                <span className={`font-mono font-bold text-base ${
                                  esHoraActual ? 'text-green-400' : 'text-white/60'
                                }`}>
                                  {horaData.hora}
                                </span>
                                {esHoraActual && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-full animate-pulse" />
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-1 p-3 min-h-[85px]">
                              {tieneEventos ? (
                                <div className="flex flex-wrap gap-2">
                                  {horaData.eventos.map((evento) => (
                                    <StickyNote
                                      key={evento.id}
                                      evento={evento}
                                      onClick={() => setEventoSeleccionado(evento)}
                                      className="w-64"
                                    />
                                  ))}
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    const horaInicioStr = `${horaData.horaNum.toString().padStart(2, '0')}:00`
                                    const horaFinStr = `${(horaData.horaNum + 1).toString().padStart(2, '0')}:00`
                                    setNuevoEvento(prev => ({ 
                                      ...prev, 
                                      fecha: formatearFechaParaInput(fechaHoras),
                                      horaInicio: horaInicioStr,
                                      horaFin: horaFinStr
                                    }))
                                    setMostrarModal(true)
                                  }}
                                  className="w-full h-full min-h-[60px] flex items-center justify-center gap-2 border-2 border-dashed border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:border-green-500/50 hover:bg-green-500/10"
                                >
                                  <Plus className="w-4 h-4 text-white/40" />
                                  <span className="text-xs text-white/40">Agregar evento</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Vista de Mes */}
            {vista === 'mes' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => cambiarMes('prev')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-white/60" />
                  </motion.button>
                  
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">
                      {obtenerNombreMes(fechaActual)} {fechaActual.getFullYear()}
                    </h2>
                    <p className="text-xs text-white/40 mt-1">
                      {eventosEsteMes} eventos este mes
                    </p>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => cambiarMes('next')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-white/60" />
                  </motion.button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {diasSemana.map((dia, idx) => (
                    <div key={idx} className="text-center py-2">
                      <span className="text-xs font-medium text-white/40 tracking-wider">{dia}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {diasDelMes.map((fecha, idx) => {
                    const esMesActual = isSameMonth(fecha, fechaActual)
                    const esHoy = isToday(fecha)
                    const eventosDia = obtenerEventosDelDia(fecha)
                    const primerEvento = eventosDia[0]
                    const otrosEventos = eventosDia.slice(1)
                    
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className={`min-h-32 p-2 rounded-xl transition-all cursor-pointer relative ${
                          esMesActual ? 'bg-[#0D0D0D]/80' : 'bg-[#0A0A0A]/40'
                        } border border-white/5 hover:border-white/15 hover:shadow-lg hover:shadow-green-500/10`}
                        onClick={() => {
                          setNuevoEvento(prev => ({ ...prev, fecha: formatearFechaParaInput(fecha) }))
                          setMostrarModal(true)
                        }}
                      >
                        {esHoy && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                            <span className="text-white text-xs font-bold">{fecha.getDate()}</span>
                          </div>
                        )}
                        
                        {!esHoy && (
                          <div className={`text-right mb-2 text-sm ${
                            esMesActual ? 'text-white/60' : 'text-white/30'
                          }`}>
                            {fecha.getDate()}
                          </div>
                        )}
                        
                        <div className="space-y-1 mt-6">
                          {primerEvento && (
                            <StickyNoteMes
                              evento={primerEvento}
                              onClick={() => manejarClickEventoDia(eventosDia)}
                            />
                          )}
                          {otrosEventos.length > 0 && (
                            <div
                              onClick={(e) => { e.stopPropagation(); manejarClickEventoDia(eventosDia) }}
                              className="text-xs p-1.5 bg-green-500/20 text-green-400 rounded-lg text-center cursor-pointer hover:bg-green-500/30 transition-colors font-medium"
                            >
                              +{otrosEventos.length} más
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar derecho con estadísticas y actividad */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 space-y-6"
          >
            {/* Tarjeta de resumen */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 p-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-white/60">Resumen</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {eventosHoySidebar}
                </div>
                <p className="text-xs text-white/40">
                  eventos para hoy
                </p>
              </div>
            </div>

            {/* Actividad semanal */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <h3 className="text-white font-medium text-sm">Actividad semanal</h3>
              </div>
              <ActivityChart eventos={eventos} />
            </div>

            {/* Próximos eventos */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlarmClock className="w-4 h-4 text-green-400" />
                <h3 className="text-white font-medium text-sm">Próximos eventos</h3>
              </div>
              
              <div className="space-y-3">
                {proximosEventos.length > 0 ? (
                  proximosEventos.map((evento, idx) => (
                    <motion.div
                      key={evento.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ x: 4 }}
                      onClick={() => setEventoSeleccionado(evento)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: evento.color }} />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{evento.titulo}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-white/40" />
                            <span className="text-xs text-white/40">{evento.horaInicio}</span>
                            <span className="text-white/20">•</span>
                            <CalendarIcon className="w-3 h-3 text-white/40" />
                            <span className="text-xs text-white/40">
                              {isToday(evento.fecha) ? 'Hoy' : format(evento.fecha, 'd MMM', { locale: es })}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-white/20" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-xs text-white/40">No hay próximos eventos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{eventosEsteMes}</div>
                <p className="text-xs text-white/40 mt-1">Eventos este mes</p>
              </div>
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {eventos.filter(e => e.notificar).length}
                </div>
                <p className="text-xs text-white/40 mt-1">Recordatorios</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal de evento seleccionado con botón eliminar funcionando */}
      <AnimatePresence>
        {eventoSeleccionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEventoSeleccionado(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl max-w-md w-full overflow-hidden"
              style={{
                background: `${eventoSeleccionado.color}15`,
                borderColor: `${eventoSeleccionado.color}40`,
                backdropFilter: 'blur(20px)',
                border: '1px solid'
              }}
            >
              <div 
                className="relative p-5"
                style={{
                  background: `linear-gradient(135deg, ${eventoSeleccionado.color}40, transparent)`
                }}
              >
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => eliminarEvento(eventoSeleccionado.id)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-red-500/40 transition-all group"
                  >
                    <Trash2 className="w-4 h-4 text-white/80 group-hover:text-red-400 transition-colors" />
                  </button>
                  <button
                    onClick={() => setEventoSeleccionado(null)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <X className="w-4 h-4 text-white/80" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: eventoSeleccionado.color }}
                  >
                    {(() => {
                      const iconoEncontrado = iconosDisponibles.find(i => i.nombre === eventoSeleccionado.icono)
                      const IconComponent = iconoEncontrado?.icono || CalendarIcon
                      return <IconComponent className="w-6 h-6 text-white" />
                    })()}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{eventoSeleccionado.titulo}</h3>
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{eventoSeleccionado.horaInicio} - {eventoSeleccionado.horaFin}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {eventoSeleccionado.ubicacion && (
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{eventoSeleccionado.ubicacion}</span>
                  </div>
                )}
                
                {eventoSeleccionado.descripcion && (
                  <div className="text-white/60 text-sm leading-relaxed">
                    {eventoSeleccionado.descripcion}
                  </div>
                )}
                
                {eventoSeleccionado.invitados.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-white/60 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {eventoSeleccionado.invitados.map((invitado, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                          {invitado}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {eventoSeleccionado.notificar && (
                  <div className="flex items-center gap-2 text-amber-400/80 text-sm">
                    <Bell className="w-4 h-4" />
                    <span>Recordatorio activado</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de múltiples eventos */}
      <AnimatePresence>
        {eventosDelDiaSeleccionados && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEventosDelDiaSeleccionados(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0D0D0D] rounded-2xl border border-white/10 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-white/10 p-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-white font-bold text-lg">
                    Eventos del día
                  </h2>
                  <button
                    onClick={() => setEventosDelDiaSeleccionados(null)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {eventosDelDiaSeleccionados.map((evento) => (
                  <StickyNote
                    key={evento.id}
                    evento={evento}
                    onClick={() => {
                      setEventosDelDiaSeleccionados(null)
                      setEventoSeleccionado(evento)
                    }}
                    className="w-full"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de nuevo evento */}
      <AnimatePresence>
        {mostrarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setMostrarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0D0D0D] rounded-2xl border border-white/10 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-white/10 p-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-white font-bold text-lg">Crear nuevo evento</h2>
                  <button
                    onClick={() => setMostrarModal(false)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Título</label>
                  <input
                    type="text"
                    value={nuevoEvento.titulo}
                    onChange={(e) => setNuevoEvento(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Nombre del evento"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1 block">Fecha</label>
                  <input
                    type="date"
                    value={nuevoEvento.fecha}
                    onChange={(e) => setNuevoEvento(prev => ({ ...prev, fecha: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Inicio</label>
                    <input
                      type="time"
                      value={nuevoEvento.horaInicio}
                      onChange={(e) => setNuevoEvento(prev => ({ ...prev, horaInicio: e.target.value }))}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Fin</label>
                    <input
                      type="time"
                      value={nuevoEvento.horaFin}
                      onChange={(e) => setNuevoEvento(prev => ({ ...prev, horaFin: e.target.value }))}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1 block">Ubicación</label>
                  <input
                    type="text"
                    value={nuevoEvento.ubicacion}
                    onChange={(e) => setNuevoEvento(prev => ({ ...prev, ubicacion: e.target.value }))}
                    placeholder="Lugar del evento"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1 block">Descripción</label>
                  <textarea
                    value={nuevoEvento.descripcion}
                    onChange={(e) => setNuevoEvento(prev => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Descripción del evento"
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-green-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1 block">Invitados (separados por coma)</label>
                  <input
                    type="text"
                    value={nuevoEvento.invitados}
                    onChange={(e) => setNuevoEvento(prev => ({ ...prev, invitados: e.target.value }))}
                    placeholder="ej: Juan, María, Pedro"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-2 block">Color del evento</label>
                  <div className="flex gap-2 flex-wrap">
                    {coloresDisponibles.map((color) => (
                      <button
                        key={color.nombre}
                        onClick={() => setNuevoEvento(prev => ({ ...prev, color: color.bg, textColor: color.text }))}
                        className={`w-8 h-8 rounded-full transition-all ${
                          nuevoEvento.color === color.bg ? 'ring-2 ring-white scale-110' : ''
                        }`}
                        style={{ background: color.bg }}
                        title={color.nombre}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-2 block">Icono</label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconosDisponibles.slice(0, 12).map((icono) => {
                      const IconComp = icono.icono
                      return (
                        <button
                          key={icono.nombre}
                          onClick={() => setNuevoEvento(prev => ({ ...prev, icono: icono.nombre }))}
                          className={`p-2 rounded-xl transition-all ${
                            nuevoEvento.icono === icono.nombre
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                              : 'bg-white/5 text-white/40 hover:bg-white/10'
                          }`}
                        >
                          <IconComp className="w-4 h-4 mx-auto" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-2 block">Estilos de texto</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNuevoEvento(prev => ({ ...prev, bold: !prev.bold }))}
                      className={`p-2 rounded-xl transition-all ${
                        nuevoEvento.bold ? 'bg-green-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setNuevoEvento(prev => ({ ...prev, italic: !prev.italic }))}
                      className={`p-2 rounded-xl transition-all ${
                        nuevoEvento.italic ? 'bg-green-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setNuevoEvento(prev => ({ ...prev, underline: !prev.underline }))}
                      className={`p-2 rounded-xl transition-all ${
                        nuevoEvento.underline ? 'bg-green-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-2 block">Alineación</label>
                  <div className="flex gap-2">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => setNuevoEvento(prev => ({ ...prev, textAlign: align }))}
                        className={`p-2 rounded-xl transition-all ${
                          nuevoEvento.textAlign === align ? 'bg-green-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {align === 'left' && <AlignLeft className="w-4 h-4" />}
                        {align === 'center' && <AlignCenter className="w-4 h-4" />}
                        {align === 'right' && <AlignRight className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nuevoEvento.notificar}
                    onChange={(e) => setNuevoEvento(prev => ({ ...prev, notificar: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-white/80 text-sm">Activar recordatorio</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setMostrarModal(false)}
                    className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={agregarEvento}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Creando...' : 'Crear evento'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}