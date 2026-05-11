// app/providers.tsx
'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'

console.log('🔵 Cargando módulo providers.tsx')

export function Providers({ children }: { children: React.ReactNode }) {
  console.log('🟢 [Providers] Inicializando...')
  
  const [queryClient] = useState(() => {
    console.log('📦 [Providers] Creando nuevo QueryClient')
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    })
  })

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </SessionProvider>
  )
}