// app/login/page.tsx
'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { Mail, Lock, ArrowRight, Clock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { status } = useSession()
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [formData, setFormData] = useState<{ email: string; password: string }>({
    email: '',
    password: ''
  })
  const [isMounted, setIsMounted] = useState<boolean>(() => typeof window !== 'undefined')

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.')
        setIsLoading(false)
      } else if (result?.ok) {
        // Redirigir al dashboard después de login exitoso
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Error en login:', error)
      setError('Ocurrió un error al iniciar sesión. Intenta nuevamente.')
      setIsLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, email: e.target.value })
    setError('')
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, password: e.target.value })
    setError('')
  }

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword)
  }

  const handleGoBack = (): void => {
    router.push('/')
  }

  // Mostrar loading mientras se verifica autenticación
  if (!isMounted || status === 'loading') {
    return (
      <div className="min-h-screen overflow-hidden relative">
        <div 
          className="fixed inset-0 -z-30 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/image/FondoLogin.jpg')" }}
        />
        <div className="fixed inset-0 -z-20 bg-black/40 backdrop-blur-sm" />
        <div className="container mx-auto px-4 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No mostrar el formulario si ya está autenticado
  if (status === 'authenticated') {
    return null
  }

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Botón de volver */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleGoBack}
        className="fixed top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-105 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Volver</span>
      </motion.button>

      {/* Imagen de fondo */}
      <div 
        className="fixed inset-0 -z-30 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image/FondoLogin.jpg')" }}
      />
      
      {/* Capa de superposición con gradiente y desenfoque */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div 
          className="absolute w-[800px] h-[800px] rounded-full bg-green-300/20 blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-400/20 blur-3xl"
          style={{
            transform: `translate(${-mousePosition.x * 0.015}px, ${-mousePosition.y * 0.015}px)`,
          }}
        />
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl w-full">
          {/* Lado izquierdo - Información */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl opacity-20" />
                <Clock className="w-20 h-20 text-green-600 mb-8" />
              </div>
            </motion.div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-white to-black bg-clip-text text-transparent" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Bienvenido a SICRONOTIC
            </h1>
            <p className="text-xl mb-8 leading-relaxed text-white drop-shadow-lg" style={{ textShadow: '1px 1px 2px black', color: 'white' }}>
              La plataforma todo-en-uno que combina un calendario inteligente con noticias personalizadas para maximizar tu productividad.
            </p>
            <div className="space-y-4">
              {[
                '📅 Calendario interactivo estilo Google',
                '📰 Noticias personalizadas en tiempo real',
                '🎨 Diseño moderno con animaciones fluidas',
                '⚡ Sincronización en tiempo real'
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-center space-x-3"
                  style={{ color: 'white', textShadow: '1px 1px 1px black' }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Lado derecho - Formulario de login */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
          >
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Iniciar Sesión</h2>
                <p className="text-gray-600">Accede a tu cuenta para continuar</p>
              </motion.div>

              {/* Mensaje de error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg bg-red-100 border border-red-400 text-red-700 text-sm flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="relative transition-all duration-300 hover:scale-105 hover:bg-green-50/50 rounded-lg">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-hover:text-green-500" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Correo Electrónico"
                      className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/50 border border-green-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all hover:bg-green-50/30"
                      value={formData.email}
                      onChange={handleEmailChange}
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="relative transition-all duration-300 hover:scale-105 hover:bg-green-50/50 rounded-lg">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Contraseña"
                      className="w-full pl-10 pr-10 py-2 rounded-lg bg-white/50 border border-green-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all hover:bg-green-50/30"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-between text-sm"
                >
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-green-300 text-green-600 focus:ring-green-500 cursor-pointer" />
                    <span className="text-gray-600">Recordarme</span>
                  </label>
                  <a href="#" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                      />
                    ) : (
                      <div className="flex items-center justify-center">
                        Iniciar Sesión
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    )}
                  </button>
                </motion.div>
              </form>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center mt-8 text-sm text-gray-600"
              >
                ¿No tienes una cuenta?{' '}
                <a href="#" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                  Regístrate gratis
                </a>
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer decorativo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-0 left-0 right-0 text-center py-4 text-gray-500 text-sm z-10"
      >
        <p>© 2026 SICRONOTIC - Tu plataforma inteligente de gestión</p>
      </motion.div>
    </div>
  )
}