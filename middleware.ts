// middleware.ts (en la raíz del proyecto)
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Si no está autenticado, redirigir al login
    if (!token && path !== '/login' && path !== '/') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/calendario/:path*',
    '/noticias/:path*',
    '/configuracion/:path*',
    // Excluir rutas públicas
    '/((?!api|_next/static|_next/image|favicon.ico|image).*)',
  ]
}