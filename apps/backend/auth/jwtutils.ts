// src/auth/jwtUtils.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "24h";

export interface JwtPayload {
  id: string;
}

export interface DecodedJWT extends JwtPayload {
  iat: number;
  exp: number;
}

/**
 * Creates a signed JWT with 24h expiry
 */
export function createJWT(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verifies a JWT string and returns [isValid, userId|null]
 */
export function verifyJWT(token: string): [true, string] | [false, null] {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedJWT;
    return [true, decoded.id];
  } catch (err) {
    return [false, null];
  }
}
