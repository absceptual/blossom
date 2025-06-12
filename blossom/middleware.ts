import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { decrypt } from '@/lib/session'

const protectedRoutes = ['/dashboard', '/editor']
const publicRoutes = ['/portal']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route)) || publicRoutes.includes(path)

  if (isPublicRoute) 
    return NextResponse.next();
  
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  if (isProtectedRoute && !session?.username) {
    return NextResponse.redirect(new URL('/portal', req.nextUrl))
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}