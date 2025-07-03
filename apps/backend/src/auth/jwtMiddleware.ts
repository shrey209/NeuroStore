// src/middleware/verifyAuth.ts
import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "./jwtutils"; 

export function verifyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token" });
  }

  const [valid, userId] = verifyJWT(token);

  if (!valid || !userId) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  // Attach user_id to request object if needed in downstream routes
  (req as any).user_id = userId;

  next();
}
