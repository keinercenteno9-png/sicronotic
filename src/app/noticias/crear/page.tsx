'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { toast, Toaster } from 'sonner'
import { 
  ArrowLeft, 
  Save, 
  Calendar,
  AlertTriangle,
  Award,
  Megaphone,
  Users,
  Mail,
  X,
  Upload,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Sparkles,
  ImageIcon,
  Trash2,
  Loader2,
  Camera
} from 'lucide-react'
import Image from 'next/image'

const categorias = [
  { id: 'evento', nombre: 'Eventos', icono: Calendar, color: 'green' },
  { id: 'imprevisto', nombre: 'Contingencias', icono: AlertTriangle, color: 'amber' },
  { id: 'logro', nombre: 'Logros', icono: Award, color: 'green' },
  { id: 'aviso', nombre: 'Avisos', icono: Megaphone, color: 'teal' },
  { id: 'actividad', nombre: 'Actividades', icono: Users, color: 'blue' },
  { id: 'convocatoria', nombre: 'Convocatorias', icono: Mail, color: 'purple' }
]

const coloresTexto = [
  { nombre: 'Blanco', valor: '#FFFFFF' },
  { nombre: 'Rojo', valor: '#EF4444' },
  { nombre: 'Verde', valor: '#10B981' },
  { nombre: 'Azul', valor: '#3B82F6' },
  { nombre: 'Morado', valor: '#8B5CF6' },
  { nombre: 'Naranja', valor: '#F97316' },
  { nombre: 'Rosa', valor: '#EC4899' },
  { nombre: 'Gris', valor: '#9CA3AF' },
  { nombre: 'Cian', valor: '#06B6D4' }
]

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null

  return (
    <div className="border-b border-gray-700 bg-gray-800/50 p-2 flex flex-wrap gap-1 sticky top-0 z-10 backdrop-blur-sm">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-700 transition-all duration-200 ${
          editor.isActive('bold') ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
        }`}
        title="Negrita (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-700 transition-all duration-200 ${
          editor.isActive('italic') ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
        }`}
        title="Cursiva (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-gray-700 transition-all duration-200 ${
          editor.isActive('underline') ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
        }`}
        title="Subrayado (Ctrl+U)"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-700 mx-1" />
      
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded hover:bg-gray-700 transition-all duration-200 ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
        }`}
        title="Alinear izquierda"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded hover:bg-gray-700 transition-all duration-200 ${
          editor.isActive({ textAlign: 'center' }) ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
        }`}
        title="Centrar"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded hover:bg-gray-700 transition-all duration-200 ${
          editor.isActive({ textAlign: 'right' }) ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
        }`}
        title="Alinear derecha"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={`p-2 rounded hover:bg-gray-700 transition-all duration-200 ${
          editor.isActive({ textAlign: 'justify' }) ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
        }`}
        title="Justificar"
      >
        <AlignJustify className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-700 mx-1" />
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-700 transition-all duration-200 ${
          editor.isActive('bulletList') ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
        }`}
        title="Lista con viñetas"
      >
        <List className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-700 transition-all duration-200 ${
          editor.isActive('orderedList') ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
        }`}
        title="Lista numerada"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-700 mx-1" />
      
      <select
        onChange={(e) => {
          const color = e.target.value
          if (color) {
            editor.chain().focus().setColor(color).run()
          } else {
            editor.chain().focus().unsetColor().run()
          }
        }}
        className="p-1 text-sm bg-gray-900 border border-gray-700 rounded hover:bg-gray-800 text-white cursor-pointer transition-all duration-200"
        title="Color del texto seleccionado"
      >
        <option value="">Color de texto</option>
        {coloresTexto.map(color => (
          <option key={color.valor} value={color.valor} style={{ color: color.valor }}>
            {color.nombre}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function CrearNoticiaPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [destacadasCount, setDestacadasCount] = useState(0)
  
  // Estados para la imagen
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    titulo: '',
    resumen: '',
    contenido: '',
    categoria: 'evento',
    autor: '',
    destacada: false,
    colorTexto: '#FFFFFF'
  })

  const [errores, setErrores] = useState<Record<string, string>>({})

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setFormData(prev => ({ ...prev, contenido: html }))
      if (errores.contenido) {
        setErrores(prev => ({ ...prev, contenido: '' }))
      }
    },
  })

  useEffect(() => {
    const fetchDestacadasCount = async () => {
      try {
        const response = await fetch('/api/noticias/count?destacadas=true')
        const result = await response.json()
        if (result.success) {
          setDestacadasCount(result.count)
        }
      } catch (error) {
        console.error('Error al cargar conteo de destacadas:', error)
      }
    }
    fetchDestacadasCount()
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== handleFileChange INICIADO ===')
    const file = e.target.files?.[0]
    
    if (!file) {
      console.log('❌ No se seleccionó ningún archivo')
      return
    }

    console.log('📁 Archivo seleccionado:', {
      nombre: file.name,
      tipo: file.type,
      tamaño: `${(file.size / 1024).toFixed(2)} KB`,
      tamañoBytes: file.size
    })

    if (!file.type.startsWith('image/')) {
      console.log('❌ Tipo de archivo inválido:', file.type)
      toast.error('Por favor, selecciona una imagen válida')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ Archivo muy grande:', file.size, 'bytes (máximo 5MB)')
      toast.error('La imagen no debe superar los 5MB')
      return
    }

    console.log('✅ Archivo válido, guardando en estado...')
    setSelectedFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      console.log('✅ Preview generada correctamente')
      setImagePreview(e.target?.result as string)
    }
    reader.onerror = (error) => {
      console.error('❌ Error al leer el archivo:', error)
      toast.error('Error al cargar la vista previa')
    }
    reader.readAsDataURL(file)
    
    // Limpiar error de imagen si existe
    if (errores.imagen) {
      setErrores(prev => ({ ...prev, imagen: '' }))
    }
    
    console.log('=== handleFileChange FINALIZADO ===')
    console.log('selectedFile actual:', selectedFile ? 'Hay archivo' : 'No hay archivo')
  }

  const limpiarImagen = () => {
    console.log('=== limpiarImagen ===')
    console.log('Limpiando imagen seleccionada')
    setSelectedFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const validarFormulario = (): boolean => {
    console.log('=== validarFormulario ===')
    const nuevosErrores: Record<string, string> = {}
    
    if (!formData.titulo.trim()) {
      nuevosErrores.titulo = 'El título es obligatorio'
    } else if (formData.titulo.length < 5) {
      nuevosErrores.titulo = 'El título debe tener al menos 5 caracteres'
    } else if (formData.titulo.length > 100) {
      nuevosErrores.titulo = 'El título no puede exceder los 100 caracteres'
    }
    
    if (!formData.resumen.trim()) {
      nuevosErrores.resumen = 'El resumen es obligatorio'
    } else if (formData.resumen.length < 10) {
      nuevosErrores.resumen = 'El resumen debe tener al menos 10 caracteres'
    } else if (formData.resumen.length > 200) {
      nuevosErrores.resumen = 'El resumen no puede exceder los 200 caracteres'
    }
    
    const textoPlano = stripHtml(formData.contenido)
    if (!textoPlano.trim()) {
      nuevosErrores.contenido = 'El contenido es obligatorio'
    } else if (textoPlano.length < 20) {
      nuevosErrores.contenido = 'El contenido debe tener al menos 20 caracteres'
    }
    
    if (!formData.autor.trim()) {
      nuevosErrores.autor = 'El autor es obligatorio'
    }
    
    console.log('Validando imagen - selectedFile:', selectedFile ? `✅ Hay archivo: ${selectedFile.name}` : '❌ NO hay archivo')
    if (!selectedFile) {
      nuevosErrores.imagen = 'La imagen es obligatoria'
      console.log('❌ Error: No hay imagen seleccionada')
    } else {
      console.log('✅ Imagen válida encontrada')
    }
    
    if (formData.destacada && destacadasCount >= 10) {
      nuevosErrores.destacada = 'No se puede marcar como destacada. Ya existen 10 noticias destacadas. Desmarca alguna primero.'
    }
    
    setErrores(nuevosErrores)
    const isValid = Object.keys(nuevosErrores).length === 0
    console.log('validarFormulario resultado:', isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO', nuevosErrores)
    return isValid
  }

  const handleSubmit = async () => {
    console.log('=== handleSubmit INICIADO ===')
    console.log('Estado actual:')
    console.log('- selectedFile:', selectedFile ? `✅ ${selectedFile.name} (${selectedFile.size} bytes)` : '❌ null')
    console.log('- imagePreview:', imagePreview ? '✅ Hay preview' : '❌ null')
    console.log('- titulo:', formData.titulo || '❌ vacío')
    console.log('- resumen:', formData.resumen || '❌ vacío')
    console.log('- autor:', formData.autor || '❌ vacío')
    
    if (!validarFormulario()) {
      console.log('❌ Formulario inválido, cancelando envío')
      return
    }
    
    if (!selectedFile) {
      console.log('❌ Error crítico: No hay imagen seleccionada a pesar de validación')
      toast.error('Por favor, selecciona una imagen para la noticia')
      return
    }
    
    console.log('✅ Validación pasada, procediendo a enviar...')
    setIsLoading(true)

    try {
      // PASO 1: Crear la noticia
      console.log('📝 PASO 1: Creando noticia en la BD...')
      const noticiaResponse = await fetch('/api/noticias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: formData.titulo.trim(),
          resumen: formData.resumen.trim(),
          contenido: formData.contenido,
          categoria: formData.categoria,
          autor: formData.autor.trim(),
          destacada: formData.destacada,
          colorTexto: formData.colorTexto
        })
      })

      const noticiaResult = await noticiaResponse.json()
      console.log('Respuesta creación noticia:', noticiaResult)

      if (!noticiaResult.success) {
        throw new Error(noticiaResult.error || 'Error al crear la noticia')
      }

      const noticiaId = noticiaResult.data.id
      console.log(`✅ Noticia creada con ID: ${noticiaId}`)

      // PASO 2: Subir la foto
      console.log('📸 PASO 2: Subiendo imagen...')
      const formDataImage = new FormData()
      formDataImage.append('file', selectedFile)
      formDataImage.append('nombre', `Foto para ${formData.titulo}`)
      formDataImage.append('noticiaId', noticiaId)

      console.log('FormData creado:')
      console.log('- file:', selectedFile.name)
      console.log('- nombre:', `Foto para ${formData.titulo}`)
      console.log('- noticiaId:', noticiaId)

      const imageResponse = await fetch('/api/fotos', {
        method: 'POST',
        body: formDataImage,
      })

      const imageResult = await imageResponse.json()
      console.log('Respuesta subida imagen:', imageResult)

      if (!imageResult.success) {
        console.warn('⚠️ Noticia creada pero error al subir la foto:', imageResult.error)
        toast.warning('Noticia creada, pero hubo un error al subir la foto')
      } else {
        console.log('✅ Foto subida exitosamente!')
        toast.success('¡Noticia creada con foto exitosamente!')
      }
      
      console.log('🔄 Redirigiendo a la página de noticias...')
      setTimeout(() => {
        router.push('/noticias?creada=true')
      }, 500)

    } catch (error) {
      console.error('❌ Error en handleSubmit:', error)
      toast.error(error instanceof Error ? error.message : 'Error de conexión al servidor')
    } finally {
      setIsLoading(false)
      console.log('=== handleSubmit FINALIZADO ===')
    }
  }

  // Función para debug - mostrar estado actual
  const mostrarEstadoActual = () => {
    console.log('=== ESTADO ACTUAL DEL COMPONENTE ===')
    console.log('selectedFile:', selectedFile)
    console.log('imagePreview:', imagePreview ? 'Presente' : 'Ausente')
    console.log('formData:', formData)
    console.log('errores:', errores)
    console.log('isLoading:', isLoading)
    console.log('=====================================')
  }

  if (!isMounted) {
    return null
  }

  return (
    <>
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(-10%, 5%); }
          30% { transform: translate(5%, -10%); }
          40% { transform: translate(-5%, 15%); }
          50% { transform: translate(-15%, 5%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 10%); }
          80% { transform: translate(-10%, -5%); }
          90% { transform: translate(5%, 15%); }
        }
        .animate-gradient {
          animation: gradient 20s linear infinite;
          background-size: 200% 200%;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .grain-overlay::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 200px;
          opacity: 0.08;
          pointer-events: none;
          z-index: 1;
        }
        .glass-effect {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .ProseMirror {
          min-height: 300px;
          color: #E5E7EB;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror p {
          margin-bottom: 1rem;
        }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          color: #F3F4F6;
          margin-bottom: 1rem;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
      `}</style>
      
      <div className="relative min-h-screen overflow-hidden grain-overlay">
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(34, 197, 94, 0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
          
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '-6s' }} />
        </div>

        <Toaster position="top-right" richColors />
        
        <div className="relative z-10 container mx-auto px-4 max-w-4xl py-8">
          <div className="mb-8 animate-fade-in">
            <Link href="/noticias">
              <button className="group flex items-center space-x-2 text-gray-300 hover:text-green-400 transition-all duration-300 mb-4">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Volver a Noticias</span>
              </button>
            </Link>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="w-8 h-8 text-green-500 animate-pulse-slow" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent animate-gradient">
                  Crear Nueva Noticia
                </h1>
                <Sparkles className="w-8 h-8 text-green-500 animate-pulse-slow" />
              </div>
              <p className="text-gray-400 mt-2">
                Comparte información importante con la comunidad escolar
              </p>
            </div>
          </div>

          <div className="glass-effect rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-green-900/20">
            <div className="p-8 space-y-6">
              {/* Título */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Título de la noticia *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ej: Gran Feria Cultural 2024"
                  className={`w-full px-4 py-2 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-white placeholder-gray-500 ${
                    errores.titulo 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-700 focus:ring-green-500 focus:border-transparent'
                  }`}
                />
                {errores.titulo && (
                  <p className="text-red-500 text-sm mt-1 animate-shake">{errores.titulo}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Mínimo 5 caracteres - Actual: {formData.titulo.length}
                </p>
              </div>

              {/* Categoría y Destacada */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-300 cursor-pointer transition-all duration-300"
                  >
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer group mt-7">
                    <input
                      type="checkbox"
                      name="destacada"
                      checked={formData.destacada}
                      onChange={handleChange}
                      disabled={destacadasCount >= 10 && !formData.destacada}
                      className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-gray-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    />
                    <span className={`text-sm font-semibold transition-colors duration-200 ${
                      destacadasCount >= 10 && !formData.destacada 
                        ? 'text-gray-500' 
                        : 'text-gray-300 group-hover:text-green-400'
                    }`}>
                      Marcar como noticia destacada
                    </span>
                  </label>
                  <p className={`text-xs mt-1 transition-colors duration-200 ${
                    destacadasCount >= 10 ? 'text-amber-500 font-medium' : 'text-gray-500'
                  }`}>
                    {destacadasCount >= 10 
                      ? '⚠️ Límite de 10 noticias destacadas alcanzado. Desmarca alguna primero.'
                      : `📌 ${destacadasCount}/10 noticias destacadas actualmente`}
                  </p>
                  {errores.destacada && (
                    <p className="text-red-500 text-sm mt-1">{errores.destacada}</p>
                  )}
                </div>
              </div>

              {/* Color del texto general */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Color del texto (Título y Resumen)
                </label>
                <div className="flex flex-wrap gap-3">
                  {coloresTexto.map(color => (
                    <button
                      key={color.valor}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, colorTexto: color.valor }))}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-300 transform hover:scale-110 ${
                        formData.colorTexto === color.valor 
                          ? 'border-green-500 scale-110 shadow-lg shadow-green-500/50' 
                          : 'border-gray-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.valor }}
                      title={color.nombre}
                    />
                  ))}
                </div>
              </div>

              {/* Resumen */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Resumen *
                </label>
                <textarea
                  name="resumen"
                  value={formData.resumen}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Breve descripción de la noticia (mínimo 10 caracteres)..."
                  className={`w-full px-4 py-2 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 resize-none text-gray-100 placeholder-gray-500 ${
                    errores.resumen 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-700 focus:ring-green-500 focus:border-transparent'
                  }`}
                  style={{ color: formData.colorTexto }}
                />
                {errores.resumen && (
                  <p className="text-red-500 text-sm mt-1">{errores.resumen}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Mínimo 10 caracteres - Actual: {formData.resumen.length}
                </p>
              </div>

              {/* Contenido */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Contenido completo * 
                  <span className="text-xs font-normal text-gray-500 ml-2">
                    (Selecciona texto para darle formato)
                  </span>
                </label>
                <div className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                  errores.contenido ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'
                }`}>
                  <MenuBar editor={editor} />
                  <EditorContent editor={editor} className="min-h-[300px] p-4 prose prose-invert max-w-none bg-gray-900/30" />
                </div>
                {errores.contenido && (
                  <p className="text-red-500 text-sm mt-1">{errores.contenido}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Mínimo 20 caracteres - Actual: {stripHtml(formData.contenido).length}
                </p>
              </div>

              {/* Autor */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Autor *
                </label>
                <input
                  type="text"
                  name="autor"
                  value={formData.autor}
                  onChange={handleChange}
                  placeholder="Tu nombre o el del departamento"
                  className={`w-full px-4 py-2 bg-gray-900/50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-gray-100 placeholder-gray-500 ${
                    errores.autor 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-700 focus:ring-green-500 focus:border-transparent'
                  }`}
                />
                {errores.autor && (
                  <p className="text-red-500 text-sm mt-1">{errores.autor}</p>
                )}
              </div>

              {/* SECCIÓN DE IMAGEN */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Imagen de la noticia *
                </label>
                
                <div className="border-2 border-dashed border-green-500/30 rounded-lg p-6 text-center hover:border-green-500 transition-all duration-300 bg-gray-900/30">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Camera className="w-12 h-12 text-gray-500 group-hover:text-green-500 transition-colors duration-300" />
                    <span className="text-gray-400">
                      Haz clic para seleccionar una imagen
                    </span>
                    <span className="text-gray-600 text-sm">
                      PNG, JPG, GIF, WEBP hasta 5MB
                    </span>
                  </label>
                </div>

                {imagePreview && (
                  <div className="mt-4 relative animate-fade-in">
                    <div className="relative h-48 rounded-lg overflow-hidden bg-gray-900/50">
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={limpiarImagen}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-all duration-200 transform hover:scale-110"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {errores.imagen && (
                  <p className="text-red-500 text-sm mt-1">{errores.imagen}</p>
                )}
              </div>

              {/* Botón de debug */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={mostrarEstadoActual}
                  className="text-xs text-gray-500 hover:text-gray-300 underline"
                >
                  Debug: Mostrar estado en consola
                </button>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Crear Noticia</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Consejos */}
          <div className="mt-8 bg-gray-900/50 border border-green-500/20 rounded-lg p-4 backdrop-blur-sm animate-fade-in">
            <h3 className="font-semibold text-green-400 mb-2 flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>💡 Consejos para una buena noticia:</span>
            </h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Usa un título claro y llamativo (mínimo 5 caracteres)</li>
              <li>• El resumen debe ser conciso (mínimo 10 caracteres)</li>
              <li>• Incluye una imagen de alta calidad relacionada con el contenido</li>
              <li>• Organiza el contenido en párrafos cortos para facilitar la lectura</li>
              <li>• Revisa la ortografía antes de publicar</li>
              <li>• <strong className="text-green-400">Selecciona el texto</strong> en el editor para aplicar negrita, cursiva, colores, etc.</li>
              <li>• <strong className="text-amber-400">Máximo 10 noticias destacadas</strong> pueden existir simultáneamente</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}