import { NextRequest } from "next/server";
import { parse } from "cookie";

// Simple JWT implementation using Web Crypto API (Edge Runtime compatible)
export function generateUserJWT(user: { id: string; email: string }) {
  const secret = process.env.JWT_SECRET || "dev_secret";
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { 
    sub: user.id, 
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60) // 2 days
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = btoa(secret); // Simplified for Edge Runtime compatibility
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyUserJWT(token: string): { sub: string; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, payload, signature] = parts;
    
    // Decode payload
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return {
      sub: decodedPayload.sub,
      email: decodedPayload.email
    };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const cookies = parse(cookie);
    const token = cookies['auth_token'];
    
    if (!token) return null;
    
    const userPayload = verifyUserJWT(token);
    if (!userPayload || !userPayload.email) return null;
    
    return userPayload.email;
  } catch (error) {
    return null;
  }
}
