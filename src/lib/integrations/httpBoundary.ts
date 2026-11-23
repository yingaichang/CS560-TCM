export class BoundaryError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export async function readBoundedBody(request: Request, maximum = 16_384) {
  const length = request.headers.get('content-length')
  if (length && (!/^\d+$/.test(length) || Number(length) > maximum)) throw new BoundaryError(413, 'Request is too large.')
  if (!request.body) throw new BoundaryError(400, 'A JSON body is required.')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > maximum) { await reader.cancel(); throw new BoundaryError(413, 'Request is too large.') }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length }
  try { return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(body) } catch { throw new BoundaryError(400, 'Invalid UTF-8.') }
}

export function parseJson(body: string): unknown {
  try { return JSON.parse(body) } catch { throw new BoundaryError(400, 'Invalid JSON.') }
}

export function requireSameOrigin(request: Request) {
  // Next.js can use its internal bind hostname in request.url. Host retains the
  // browser-facing host through the configured Caddy proxy and SSH tunnel.
  // Never accept an arbitrary X-Forwarded-Host as an origin allowlist.
  const host = request.headers.get('host')
  const url = new URL(request.url)
  let expected = url.origin
  try { if (host) expected = new URL(url.protocol + '//' + host).origin } catch { throw new BoundaryError(403, 'A same-origin request is required.') }
  if (request.headers.get('origin') !== expected) throw new BoundaryError(403, 'A same-origin request is required.')
}
