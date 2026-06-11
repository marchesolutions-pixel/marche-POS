import 'dotenv/config'
import { Hono } from 'hono'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from './router'

const app = new Hono()

app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Headers', '*')
  c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  if (c.req.method === 'OPTIONS') return c.text('ok')
  return await next()
})

app.get('/api/oauth/callback', async (c) => {
  const code = c.req.query('code')
  if (!code) return c.text('Missing authorization code', 400)

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return c.text('Google OAuth is not configured on the server', 500)
  }

  const host = c.req.header('host')
  const proto = c.req.header('x-forwarded-proto') || 'http'
  const origin = process.env.GOOGLE_REDIRECT_URI
    ? new URL(process.env.GOOGLE_REDIRECT_URI).origin
    : host
    ? `${proto}://${host}`
    : 'http://localhost:3000'
  const redirectUri = process.env.GOOGLE_REDIRECT_URI
    ? process.env.GOOGLE_REDIRECT_URI
    : `${origin}/api/oauth/callback`

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const tokenData = await tokenResponse.json()
  if (!tokenData.access_token) {
    return c.text('Unable to exchange authorization code', 500)
  }

  const profileResponse = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    }
  )

  const profile = await profileResponse.json()
  const googleName = profile.name || ''
  const googleEmail = profile.email || ''

  if (!googleEmail) {
    return c.text('Unable to read Google user email', 500)
  }

  const redirectUrl = new URL('/login', origin)
  redirectUrl.searchParams.set('googleName', googleName)
  redirectUrl.searchParams.set('googleEmail', googleEmail)

  return c.redirect(redirectUrl.toString())
})

app.all('/api/trpc/:path*', async (c) => {
  return await fetchRequestHandler({
    endpoint: '/api/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: () => ({}),
  })
})

app.get('/', (c) => c.text('Hono API is running'))

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

export default app
