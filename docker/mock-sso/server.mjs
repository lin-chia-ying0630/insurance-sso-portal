import { createServer } from 'node:http'
import { generateKeyPairSync, randomUUID, sign, verify } from 'node:crypto'

const issuer = process.env.SSO_ISSUER ?? 'http://192.168.1.104:8083'
const portalUrl = process.env.PORTAL_URL ?? 'http://192.168.1.104:5174/'
const allowedPorts = new Set(['5173', '5174', '5175'])
const keyId = randomUUID()
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const publicJwk = publicKey.export({ format: 'jwk' })

function base64Url(value) {
  return Buffer.from(value).toString('base64url')
}

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(JSON.stringify(body))
}

function issueToken() {
  const now = Math.floor(Date.now() / 1000)
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: keyId }))
  const payload = base64Url(JSON.stringify({
    sub: 'admin', iss: issuer, aud: ['NEW_CONTRACT', 'POLICY_SERVICE'],
    roles: ['ADMIN', 'MAKER', 'REVIEWER', 'USER'], iat: now, exp: now + 300, jti: randomUUID(),
  }))
  const signature = sign('RSA-SHA256', Buffer.from(`${header}.${payload}`), privateKey).toString('base64url')
  return `${header}.${payload}.${signature}`
}

function readToken(request) {
  const cookie = request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('SSO_ACCESS_TOKEN='))
  return cookie ? decodeURIComponent(cookie.slice('SSO_ACCESS_TOKEN='.length)) : ''
}

function validClaims(request) {
  const token = readToken(request)
  const parts = token.split('.')
  if (parts.length !== 3 || !verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), publicKey, Buffer.from(parts[2], 'base64url'))) return null
  const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
  return claims.iss === issuer && claims.exp > Math.floor(Date.now() / 1000) ? claims : null
}

function safeReturnUrl(value, request) {
  try {
    const target = new URL(value ?? portalUrl)
    const requestHost = (request.headers['x-forwarded-host'] ?? request.headers.host ?? '').toString().split(':')[0]
    return target.protocol === 'http:' && target.hostname === requestHost && allowedPorts.has(target.port) ? target.toString() : portalUrl
  } catch {
    return portalUrl
  }
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', issuer)
  if (url.pathname === '/health') return json(response, 200, { status: 'UP' })
  if (url.pathname === '/.well-known/jwks.json') return json(response, 200, { keys: [{ ...publicJwk, kid: keyId, alg: 'RS256', use: 'sig' }] })
  if (url.pathname === '/api/auth/login') {
    response.writeHead(302, {
      Location: safeReturnUrl(url.searchParams.get('returnUrl'), request),
      'Set-Cookie': `SSO_ACCESS_TOKEN=${encodeURIComponent(issueToken())}; Path=/; HttpOnly; SameSite=Strict; Max-Age=300`,
      'Cache-Control': 'no-store',
    })
    return response.end()
  }
  if (url.pathname === '/api/auth/logout') {
    response.writeHead(302, { Location: portalUrl, 'Set-Cookie': 'SSO_ACCESS_TOKEN=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0' })
    return response.end()
  }
  if (url.pathname === '/api/auth/me') {
    const claims = validClaims(request)
    if (!claims) return json(response, 401, { authenticated: false, user: null })
    return json(response, 200, { authenticated: true, user: { userId: claims.sub, displayName: '本機管理員', department: '本機 SSO', applicationKeys: claims.aud } })
  }
  return json(response, 404, { errorMessage: '資源不存在' })
}).listen(8080, '0.0.0.0')
