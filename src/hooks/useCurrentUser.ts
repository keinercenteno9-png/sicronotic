// hooks/useCurrentUser.ts
import { useSession } from "next-auth/react"

export function useCurrentUser() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    role: session?.user?.role ?? 'VISITOR',
    nombres: session?.user?.nombres,
    apellidos: session?.user?.apellidos,
    cedula: session?.user?.cedula,
  }
}