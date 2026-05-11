'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { 
  Search, 
  Clock, 
  X, 
  Grid3x3, 
  List, 
  Eye,
  Trash2,
  Calendar,
  Award,
  AlertTriangle,
  Megaphone,
  Users,
  Mail,
  Plus,
  RefreshCw,
  ArrowLeft,
  Newspaper,
  Flame,
  ChevronRight,
  ChevronLeft,
  Upload,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from 'next/image'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'

// Categorías disponibles
const categorias = [
  { id: 'todas', nombre: 'Todas', icono: Newspaper, color: 'gray' },
  { id: 'evento', nombre: 'Eventos', icono: Calendar, color: 'green' },
  { id: 'imprevisto', nombre: 'Contingencias', icono: AlertTriangle, color: 'amber' },
  { id: 'logro', nombre: 'Logros', icono: Award, color: 'emerald' },
  { id: 'aviso', nombre: 'Avisos', icono: Megaphone, color: 'teal' },
  { id: 'actividad', nombre: 'Actividades', icono: Users, color: 'blue' },
  { id: 'convocatoria', nombre: 'Convocatorias', icono: Mail, color: 'purple' }
]

type Noticia = {
  id: string
  titulo: string
  resumen: string
  contenido: string
  fecha: string
  autor?: string
  imagen?: string
  categoria: string
  destacada?: boolean
  vistas?: number
  colorTexto?: string
  fotos?: any[]
}

// Función para obtener URL de imagen desde el sistema de archivos
const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath
  if (imagePath.startsWith('/uploads/noticias/')) {
    const filename = imagePath.replace('/uploads/noticias/', '')
    return `/api/fotos/${filename}`
  }
  return imagePath
}

// Variantes de animación
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100
    }
  }
}

const headerVariants: Variants = {
  hidden: { y: -50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 120
    }
  }
}

// Componente de tarjeta con efecto 3D
const Tarjeta3D = ({ children, className, onClick, isActive }: { children: React.ReactNode; className?: string; onClick?: () => void; isActive?: boolean }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    const rotateXValue = (mouseY / (rect.height / 2)) * -6
    const rotateYValue = (mouseX / (rect.width / 2)) * 6
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)'
      }}
      className={className}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Modal para subir fotos
function SubirFotoModal({ 
  noticia, 
  open, 
  onClose, 
  onSuccess 
}: { 
  noticia: Noticia | null; 
  open: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona una imagen válida')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const subirFoto = async () => {
    if (!selectedFile || !noticia) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('nombre', `Foto para ${noticia.titulo}`)
      formData.append('noticiaId', noticia.id)

      const response = await fetch('/api/fotos', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Foto subida correctamente')
        setSelectedFile(null)
        setPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || 'Error al subir')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de conexión')
    } finally {
      setUploading(false)
    }
  }

  if (!open || !noticia) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-green-400" />
          Subir foto para: {noticia.titulo}
        </h2>

        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
          />
        </div>

        {preview && (
          <div className="relative w-32 h-32 mx-auto mb-4">
            <Image src={preview} alt="Preview" fill className="object-cover rounded-lg" />
            <button
              onClick={() => {
                setSelectedFile(null)
                setPreview(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={subirFoto}
            disabled={!selectedFile || uploading}
            className="flex-1 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Subiendo...' : 'Subir foto'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Modal para ver galería de fotos
function GaleriaFotosModal({ 
  noticia, 
  open, 
  onClose 
}: { 
  noticia: Noticia | null; 
  open: boolean; 
  onClose: () => void;
}) {
  const [fotos, setFotos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && noticia) {
      const cargarFotos = async () => {
        setLoading(true)
        try {
          const res = await fetch(`/api/fotos?noticiaId=${noticia.id}`)
          const data = await res.json()
          if (data.success) {
            setFotos(data.data || [])
          }
        } catch (error) {
          console.error('Error cargando fotos:', error)
        } finally {
          setLoading(false)
        }
      }
      cargarFotos()
    }
  }, [open, noticia])

  const eliminarFoto = async (fotoId: string) => {
    if (!confirm('¿Eliminar esta foto?')) return

    try {
      const response = await fetch(`/api/fotos?id=${fotoId}`, {
        method: 'DELETE'
      })
      const result = await response.json()

      if (result.success) {
        setFotos(fotos.filter(f => f.id !== fotoId))
        toast.success('Foto eliminada')
      } else {
        toast.error(result.error || 'Error al eliminar')
      }
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }

  if (!open || !noticia) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-green-400" />
            Galería de fotos: {noticia.titulo}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          </div>
        ) : fotos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No hay fotos para esta noticia</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto) => (
              <div key={foto.id} className="relative group aspect-square bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={getImageUrl(foto.url) || ''}
                  alt={foto.nombre}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => eliminarFoto(foto.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function NoticiasPage() {
  const router = useRouter()
  const { role } = useCurrentUser()
  const isAdmin = role === 'ADMIN'
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState<Noticia | null>(null)
  const [vista, setVista] = useState<'grid' | 'lista'>('grid')
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [noticiaAEliminar, setNoticiaAEliminar] = useState<string | null>(null)
  const [subirFotoModalOpen, setSubirFotoModalOpen] = useState(false)
  const [galeriaModalOpen, setGaleriaModalOpen] = useState(false)
  const [noticiaParaFotos, setNoticiaParaFotos] = useState<Noticia | null>(null)
  const swiperRef = useRef<any>(null)

  // Cargar noticias desde la API
  const cargarNoticias = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (categoriaSeleccionada !== 'todas') {
        params.append('categoria', categoriaSeleccionada)
      }
      if (busqueda) {
        params.append('busqueda', busqueda)
      }
      params.append('limit', '50')

      const url = `/api/noticias?${params.toString()}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setNoticias(result.data)
        if (result.data.length === 0 && !showRefresh) {
          toast.info('No hay noticias disponibles')
        }
      } else {
        throw new Error(result.error || 'Error al cargar las noticias')
      }
    } catch (error) {
      console.error('Error al cargar noticias:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión con el servidor'
      setError(errorMessage)
      toast.error('Error al cargar las noticias')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Cargar noticias al inicio y cuando cambian filtros
  useEffect(() => {
    cargarNoticias()
  }, [categoriaSeleccionada, busqueda])

  // Verificar si hay nueva noticia creada
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('creada') === 'true') {
      toast.success('¡Noticia creada exitosamente!')
      cargarNoticias()
      router.replace('/noticias')
    }
  }, [router])

  // Abrir diálogo de confirmación para eliminar
  const handleEliminarClick = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setNoticiaAEliminar(id)
    setAlertDialogOpen(true)
  }

  // Confirmar eliminación
  const confirmarEliminacion = async () => {
    if (!noticiaAEliminar) return
    
    try {
      const response = await fetch(`/api/noticias?id=${noticiaAEliminar}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Noticia eliminada exitosamente')
        await cargarNoticias()
        if (noticiaSeleccionada?.id === noticiaAEliminar) {
          setNoticiaSeleccionada(null)
        }
      } else {
        toast.error(result.error || 'Error al eliminar la noticia')
      }
    } catch (error) {
      console.error('Error al eliminar:', error)
      toast.error('Error de conexión al eliminar')
    } finally {
      setAlertDialogOpen(false)
      setNoticiaAEliminar(null)
    }
  }

  // Ver noticia
  const handleVerNoticia = async (noticia: Noticia) => {
    setNoticiaSeleccionada(noticia)
    
    try {
      await fetch(`/api/noticias?id=${noticia.id}`, { method: 'GET' })
    } catch (error) {
      console.error('Error al incrementar vistas:', error)
    }
    
    setNoticias(prev => prev.map(n => 
      n.id === noticia.id ? { ...n, vistas: (n.vistas || 0) + 1 } : n
    ))
  }

  // Abrir modal para subir fotos
  const abrirSubirFotos = (noticia: Noticia, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setNoticiaParaFotos(noticia)
    setSubirFotoModalOpen(true)
  }

  // Abrir galería de fotos
  const abrirGaleria = (noticia: Noticia, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setNoticiaParaFotos(noticia)
    setGaleriaModalOpen(true)
  }

  // Formatear fecha
  const formatFecha = (fecha: string | Date): string => {
    try {
      const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
      const ahora = new Date()
      const diff = ahora.getTime() - fechaObj.getTime()
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (dias === 0) return 'Hoy'
      if (dias === 1) return 'Ayer'
      if (dias < 7) return `Hace ${dias} días`
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return 'Fecha inválida'
    }
  }

  // Obtener estilos de categoría
  const getTagStyles = (categoriaId: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      evento: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
      imprevisto: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
      logro: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      aviso: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30' },
      actividad: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      convocatoria: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' }
    }
    return styles[categoriaId] || { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
  }

  // Obtener nombre de categoría
  const getCategoriaNombre = (id: string) => {
    const cat = categorias.find(c => c.id === id)
    return cat ? cat.nombre : 'Sin categoría'
  }

  // Noticias destacadas reordenadas
  const noticiasDestacadas = useMemo(() => {
    const destacadasBase = noticias.filter(n => n.destacada);
    if (destacadasBase.length === 0) return [];

    const ordenadasPorFecha = [...destacadasBase].sort((a, b) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

    const resultadoReordenado: Noticia[] = [];
    
    ordenadasPorFecha.forEach((noticia, index) => {
      if (index % 2 === 0) {
        resultadoReordenado.push(noticia);
      } else {
        resultadoReordenado.unshift(noticia);
      }
    });

    return resultadoReordenado;
  }, [noticias]);

  const noiseBackgroundUrl = `url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.08%22/%3E%3C/svg%3E')`;

  // Pantalla de carga
  if (loading) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-white bg-black">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: noiseBackgroundUrl }} />
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-medium animate-pulse">Cargando noticias...</p>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla de error
  if (error) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-white bg-black">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: noiseBackgroundUrl }} />
        </div>
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-white/10"
          >
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Error al cargar noticias</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => cargarNoticias()}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Reintentar</span>
              </button>
              <Link href="/">
                <button className="w-full border border-white/20 text-gray-300 px-6 py-3 rounded-lg hover:bg-white/5 transition-all">
                  Volver al inicio
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-white">
      {/* Fondo Dinámico */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: noiseBackgroundUrl }} />
        <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 via-transparent to-transparent" />
      </div>

      <Toaster position="top-right" richColors />

      {/* AlertDialog de confirmación */}
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-red-500/20">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-white">
                Eliminar Noticia
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-400 text-base">
              ¿Estás seguro de que quieres eliminar esta noticia? 
              Esta acción no se puede deshacer y la noticia será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-all">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmarEliminacion}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-lg shadow-red-600/20"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modales de fotos */}
      <SubirFotoModal
        noticia={noticiaParaFotos}
        open={subirFotoModalOpen}
        onClose={() => {
          setSubirFotoModalOpen(false)
          setNoticiaParaFotos(null)
          cargarNoticias()
        }}
        onSuccess={() => cargarNoticias()}
      />

      <GaleriaFotosModal
        noticia={noticiaParaFotos}
        open={galeriaModalOpen}
        onClose={() => {
          setGaleriaModalOpen(false)
          setNoticiaParaFotos(null)
        }}
      />

      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10"
        >
          <div className="flex items-center space-x-4">
            <Link href="/">
              <motion.button 
                whileHover={{ x: -5 }}
                className="group flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-all border border-white/10"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Volver</span>
              </motion.button>
            </Link>
            <div>
              <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 bg-clip-text text-transparent">
                SICRO NOTICIAS
              </h1>
              <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">
                Portal Informativo
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => cargarNoticias(true)}
              disabled={refreshing}
              className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
              title="Refrescar noticias"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>

            {isAdmin && (
              <Link href="/noticias/crear">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2 rounded-full flex items-center space-x-2 font-bold shadow-lg shadow-green-600/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>CREAR</span>
                </motion.button>
              </Link>
            )}
            
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-400 transition-colors" />
              <input
                type="text"
                placeholder="Buscar noticias..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-64 pl-10 pr-10 py-2 rounded-full bg-white/5 border border-white/10 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all placeholder:text-gray-500 text-sm"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVista('grid')}
                className={`p-2 rounded-full transition-all ${vista === 'grid' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                title="Vista en cuadrícula"
              >
                <Grid3x3 className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVista('lista')}
                className={`p-2 rounded-full transition-all ${vista === 'lista' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                title="Vista en lista"
              >
                <List className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Categorías */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categorias.map((cat) => {
            const Icono = cat.icono
            const isSelected = categoriaSeleccionada === cat.id
            return (
              <motion.button
                key={cat.id}
                variants={itemVariants}
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategoriaSeleccionada(cat.id)}
                className={`px-5 py-2 rounded-full border transition-all flex items-center space-x-2 text-sm font-bold ${
                  isSelected
                    ? 'bg-green-600 border-green-400 text-white shadow-xl shadow-green-600/30'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                }`}
              >
                <Icono className="w-4 h-4" />
                <span>{cat.nombre}</span>
                {isSelected && noticias.length > 0 && (
                  <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                    {noticias.length}
                  </span>
                )}
              </motion.button>
            )
          })}
        </motion.div>

        {/* Noticias Destacadas - Coverflow 3D */}
        {noticiasDestacadas.length > 0 && !busqueda && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 w-full"
          >
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex items-center gap-3">
                <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                <h2 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent uppercase">
                  Noticias Destacadas
                </h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {noticiasDestacadas.length}/10 destacadas
              </div>
            </div>

            <div className="relative px-4">
              <Swiper
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                effect={'coverflow'}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={'auto'}
                loop={false}
                initialSlide={Math.floor(noticiasDestacadas.length / 2)}
                speed={800}
                autoplay={{
                  delay: 10000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                coverflowEffect={{
                  rotate: 0,
                  stretch: -80,
                  depth: 300,
                  modifier: 1,
                  slideShadows: false,
                }}
                modules={[EffectCoverflow, Pagination, Autoplay]}
                className="tranding-slider-container w-full !py-12"
              >
                {noticiasDestacadas.map((noticia) => (
                  <SwiperSlide 
                    key={noticia.id} 
                    className="tranding-slide !w-[280px] sm:!w-[350px] md:!w-[400px] lg:!w-[450px]"
                  >
                    {({ isActive }) => (
                      <Tarjeta3D
                        isActive={isActive}
                        className={`relative h-[450px] md:h-[550px] rounded-3xl overflow-hidden border-2 transition-all duration-700 cursor-pointer group ${
                          isActive 
                            ? 'border-green-500/60 shadow-2xl shadow-green-500/30 scale-105 z-50 opacity-100' 
                            : 'border-white/10 scale-90 opacity-40 blur-[1px] grayscale-[0.3]'
                        }`}
                        onClick={() => handleVerNoticia(noticia)}
                      >
                        {/* Imagen de fondo */}
                        <div className="absolute inset-0">
                          <img 
                            src={getImageUrl(noticia.imagen) || 'https://placehold.co/800x600/1a1a1a/ffffff?text=Imagen+no+disponible'} 
                            className="w-full h-full object-cover" 
                            alt={noticia.titulo}
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/800x600/1a1a1a/ffffff?text=Imagen+no+disponible'
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                        </div>
                        
                        {/* Badge Categoría */}
                        <div className="absolute top-5 left-5 z-10">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${getTagStyles(noticia.categoria).bg} ${getTagStyles(noticia.categoria).text} ${getTagStyles(noticia.categoria).border}`}>
                            {getCategoriaNombre(noticia.categoria)}
                          </span>
                        </div>

                        {/* Badge Destacada */}
                        <div className="absolute top-5 right-5 z-10">
                          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-500/90 backdrop-blur-sm text-white border border-orange-400/50 shadow-lg">
                            <Flame className="w-3 h-3" />
                            Destacada
                          </span>
                        </div>

                        {/* Contenido */}
                        <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-8 transition-all duration-500 ${
                          isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                        }`}>
                          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 line-clamp-2 leading-tight drop-shadow-lg">
                            {noticia.titulo}
                          </h3>
                          
                          <p className="text-gray-300 text-sm line-clamp-2 mb-4 drop-shadow-md">
                            {noticia.resumen}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-gray-300 text-xs">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {formatFecha(noticia.fecha)}
                              </span>
                              <span className="flex items-center gap-1.5 text-green-400">
                                <Eye className="w-3.5 h-3.5" />
                                {noticia.vistas || 0}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                              <span className="hidden sm:inline">Leer más</span>
                              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 group-hover:bg-green-500/40 transition-all">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Tarjeta3D>
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Flechas de navegación */}
              <button
                onClick={(e) => { e.stopPropagation(); swiperRef.current?.slidePrev(); }}
                className="nav-btn-custom left-4 lg:left-10"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); swiperRef.current?.slideNext(); }}
                className="nav-btn-custom right-4 lg:right-10"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="swiper-pagination-custom !mt-10"></div>
            </div>

            <style jsx global>{`
              .tranding-slider-container {
                overflow: visible !important;
              }
              
              .tranding-slide {
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
              }
              
              .nav-btn-custom {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                z-index: 50;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                cursor: pointer;
              }
              
              .nav-btn-custom:hover {
                background: #22c55e;
                border-color: #22c55e;
                transform: translateY(-50%) scale(1.1);
              }
              
              .swiper-pagination-custom {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 8px;
                margin-top: 20px;
                position: relative;
                bottom: 0;
              }
              
              .swiper-pagination-custom .swiper-pagination-bullet {
                background: rgba(255, 255, 255, 0.4);
                opacity: 0.7;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                transition: all 0.3s ease;
                cursor: pointer;
              }
              
              .swiper-pagination-custom .swiper-pagination-bullet-active {
                background: #22c55e;
                width: 28px;
                border-radius: 4px;
                opacity: 1;
              }
              
              @media (max-width: 768px) {
                .nav-btn-custom {
                  width: 40px;
                  height: 40px;
                }
                .nav-btn-custom.left-4 {
                  left: 0 !important;
                }
                .nav-btn-custom.right-4 {
                  right: 0 !important;
                }
              }
            `}</style>
          </motion.div>
        )}

        {/* Lista de noticias - Otras noticias */}
        {noticias.filter(n => !n.destacada).length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-300">
                {busqueda ? 'Resultados de búsqueda' : 'Otras noticias'}
              </h2>
              <span className="text-sm text-gray-500">
                {noticias.filter(n => !n.destacada).length} noticia{noticias.filter(n => !n.destacada).length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid ${vista === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}
            >
              <AnimatePresence mode="popLayout">
                {noticias.filter(n => !n.destacada).map((noticia) => {
                  const tagStyles = getTagStyles(noticia.categoria)
                  return (
                    <motion.div
                      key={noticia.id}
                      variants={itemVariants}
                      layout
                      whileHover={{ y: -8 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Tarjeta3D
                        isActive={true}
                        className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden cursor-pointer transition-all hover:border-green-500/50 h-full"
                        onClick={() => handleVerNoticia(noticia)}
                      >
                        <div className={`${vista === 'lista' ? 'md:flex' : ''} h-full`}>
                          <div className={`${vista === 'lista' ? 'md:w-48' : 'w-full'} h-48 overflow-hidden relative`}>
                            <img
                              src={getImageUrl(noticia.imagen) || 'https://placehold.co/400x300/1a1a1a/ffffff?text=Sin+imagen'}
                              alt={noticia.titulo}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              onError={(e) => {
                                e.currentTarget.src = 'https://placehold.co/400x300/1a1a1a/ffffff?text=Sin+imagen'
                              }}
                            />
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tagStyles.bg} ${tagStyles.text} ${tagStyles.border}`}>
                                {getCategoriaNombre(noticia.categoria)}
                              </span>
                            </div>
                            <h3 
                              className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-green-400 transition-colors text-white"
                              style={{ color: noticia.colorTexto }}
                            >
                              {noticia.titulo}
                            </h3>
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2 flex-1">
                              {noticia.resumen}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatFecha(noticia.fecha)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {noticia.vistas}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => abrirSubirFotos(noticia, e)}
                                  className="p-1 hover:bg-green-500/20 rounded-lg transition-colors"
                                  title="Subir foto"
                                >
                                  <Upload className="w-3.5 h-3.5 text-green-400" />
                                </button>
                                <button
                                  onClick={(e) => abrirGaleria(noticia, e)}
                                  className="p-1 hover:bg-blue-500/20 rounded-lg transition-colors"
                                  title="Ver galería"
                                >
                                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                                </button>
                                <button
                                  onClick={(e) => handleEliminarClick(noticia.id, e)}
                                  className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                                  title="Eliminar noticia"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                                <span className="flex items-center gap-1 text-green-400 group-hover:translate-x-1 transition-transform">
                                  Leer más <ChevronRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Tarjeta3D>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          </>
        ) : noticias.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
          >
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No hay noticias disponibles</h3>
            <p className="text-gray-400 mb-6">
              {busqueda 
                ? `No se encontraron resultados para "${busqueda}"`
                : 'Comparte información importante con la comunidad escolar'}
            </p>
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="text-green-400 hover:text-green-300 font-medium mb-4 transition-colors"
              >
                Limpiar búsqueda
              </button>
            )}
            <div>
              {isAdmin ? (
                <Link href="/noticias/crear">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full flex items-center space-x-2 mx-auto shadow-lg shadow-green-600/30"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Crear Primera Noticia</span>
                  </motion.button>
                </Link>
              ) : (
                <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white/70">
                  <Plus className="w-5 h-5 opacity-50" />
                  Solo admins pueden crear
                </div>
              )}
            </div>
          </motion.div>
        ) : null}

        {/* Modal de noticia completa */}
        <AnimatePresence>
          {noticiaSeleccionada && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto"
              onClick={() => setNoticiaSeleccionada(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="bg-zinc-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={getImageUrl(noticiaSeleccionada.imagen) || 'https://placehold.co/800x400/1a1a1a/ffffff?text=Sin+imagen'}
                    alt={noticiaSeleccionada.titulo}
                    className="w-full h-80 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/800x400/1a1a1a/ffffff?text=Sin+imagen'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setNoticiaSeleccionada(null)}
                    className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                  <div className="absolute bottom-6 left-8">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTagStyles(noticiaSeleccionada.categoria).bg} ${getTagStyles(noticiaSeleccionada.categoria).text} ${getTagStyles(noticiaSeleccionada.categoria).border}`}>
                      {getCategoriaNombre(noticiaSeleccionada.categoria)}
                    </span>
                  </div>
                </div>
                
                <div className="p-8">
                  <h2 
                    className="text-3xl md:text-4xl font-bold mb-6 text-white"
                    style={{ color: noticiaSeleccionada.colorTexto || '#ffffff' }}
                  >
                    {noticiaSeleccionada.titulo}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-8 pb-6 border-b border-white/10">
                    <span className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center text-xs font-bold">
                        {noticiaSeleccionada.autor?.charAt(0) || 'A'}
                      </div>
                      <span className="text-white font-medium">{noticiaSeleccionada.autor || 'Admin'}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatFecha(noticiaSeleccionada.fecha)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {noticiaSeleccionada.vistas || 0} vistas
                    </span>
                  </div>
                  
                  <div className="bg-green-500/10 border-l-4 border-green-500 p-5 mb-8 rounded-r-xl">
                    <p className="italic text-gray-300">"{noticiaSeleccionada.resumen}"</p>
                  </div>
                  
                  <div className="prose prose-invert prose-green max-w-none">
                    <div 
                      className="text-gray-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: noticiaSeleccionada.contenido }}
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setNoticiaSeleccionada(null)}
                      className="px-6 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      Cerrar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setNoticiaSeleccionada(null)
                        handleEliminarClick(noticiaSeleccionada.id)
                      }}
                      className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2 border border-red-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}