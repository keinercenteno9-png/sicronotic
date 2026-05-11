// src/hooks/useNotificaciones.ts
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export function useNotificaciones() {
  const notificadosRef = useRef<Set<string>>(new Set())
  
  useEffect(() => {
    // Verificar notificaciones cada minuto
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/notificaciones/check')
        const result = await response.json()
        
        if (result.success && result.eventos.length > 0) {
          result.eventos.forEach((evento: any) => {
            // Evitar notificar el mismo evento múltiples veces
            if (!notificadosRef.current.has(evento.id)) {
              notificadosRef.current.add(evento.id)
              
              // Mostrar notificación
              toast.info(`🔔 ¡Recordatorio!`, {
                description: `"${evento.titulo}" comienza a las ${evento.horaInicio}`,
                duration: 10000,
                action: {
                  label: 'Ver',
                  onClick: () => {
                    // Aquí puedes redirigir al calendario
                    window.location.href = '/calendario'
                  }
                }
              })
              
              // También intentar con notificaciones del navegador si están permitidas
              if (Notification.permission === 'granted') {
                new Notification('Recordatorio de evento', {
                  body: `"${evento.titulo}" comienza a las ${evento.horaInicio}`,
                  icon: '/favicon.ico'
                })
              }
            }
          })
        }
      } catch (error) {
        console.error('Error checking notifications:', error)
      }
    }, 60000) // Cada minuto
    
    // Solicitar permiso para notificaciones del navegador
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    return () => clearInterval(interval)
  }, [])
}