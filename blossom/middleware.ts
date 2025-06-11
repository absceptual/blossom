import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/app/lib/session'
import { cookies } from 'next/headers'
 

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/editor']
const publicRoutes = ['/portal']
export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route)) || publicRoutes.includes(path)
  if (isPublicRoute) 
    return NextResponse.next();
  

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.username) {
    return NextResponse.redirect(new URL('/portal', req.nextUrl))
  }
 
  // 5. Redirect to /dashboard if the user is authenticated
  
  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}