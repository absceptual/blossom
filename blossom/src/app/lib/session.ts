'use server'

import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { SessionPayload, UserPermissions } from '@/app/lib/definitions'
 
const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
 
export async function createSession(username: string, permissions: UserPermissions[]) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ username, expiresAt, permissions });
    const cookieStore = await cookies();

    cookieStore.set('session', session, {
        httpOnly: true,
        secure: false,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
}

export async function updateSession() {
  const session = (await cookies()).get('session')?.value
  const payload = await decrypt(session)
 
  if (!session || !payload) {
    return null
  }
 
  
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const newSession: SessionPayload = {
    username: payload.username as string,
    expiresAt: expires as Date,
    permissions: payload.permissions as UserPermissions[],
  };


  const cookieStore = await cookies()
  cookieStore.set('session', await encrypt(newSession), {
    httpOnly: true,
    secure: false,
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}
 
export async function decrypt(session: string | undefined = '') {

  if (!session) {
    console.log('No session provided for decryption')
    return null
  }

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    console.log(`Failed to verify session: ${error}`)
  }
}