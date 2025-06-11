import 'server-only'
 
import { cookies } from 'next/headers'
import { decrypt } from '@/app/lib/session'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL);
export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)
 
  if (!session?.username) {
    redirect('/portal')
  }

  const user = await sql`SELECT id FROM users WHERE username = ${session?.username as string}`;
  if (user.length === 0)
    redirect('/portal');

  return { isAuth: true, username: session?.username, permissions: session?.permissions } as const;
})