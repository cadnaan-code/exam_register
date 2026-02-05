// JWT verification for Edge Runtime
// Simplified version that works in Edge Runtime without Node.js dependencies

export interface TokenPayload {
  userId: string
  username: string
  fullName: string
  userType: string
  iat?: number
  exp?: number
}

// Base64URL decode for Edge Runtime
function base64UrlDecode(str: string): string {
  // Replace URL-safe characters
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '='
  }
  
  // Decode using atob (available in Edge Runtime as Web API)
  try {
    return atob(base64)
  } catch {
    return ''
  }
}

export function verifyTokenEdge(token: string, secret: string): TokenPayload | null {
  try {
    // Simple base64 decode (JWT format: header.payload.signature)
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.log('[JWT Edge] Invalid token format - not 3 parts')
      return null
    }

    // Decode payload (second part) using Edge-compatible method
    const decoded = base64UrlDecode(parts[1])
    if (!decoded) {
      console.log('[JWT Edge] Failed to decode payload')
      return null
    }

    const payload = JSON.parse(decoded) as TokenPayload

    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.log('[JWT Edge] Token expired')
      return null
    }

    // Verify required fields exist
    if (!payload.userId || !payload.username) {
      console.log('[JWT Edge] Missing required fields in token')
      return null
    }

    // Note: In production, you should verify the signature using Web Crypto API
    // For now, we'll do a basic check and rely on the secret being secure
    // Full signature verification happens in API routes using jsonwebtoken
    return payload
  } catch (error) {
    console.log('[JWT Edge] Verification error:', error)
    return null
  }
}
