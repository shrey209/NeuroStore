// src/middleware/verifyAuth.ts
import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../auth/jwtutils"; 

export function verifyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
     res.status(401).json({ message: "Unauthorized: No token" });
     return;
  }

  const [valid, userId] = verifyJWT(token);

  if (!valid || !userId) {
     res.status(401).json({ message: "Unauthorized: Invalid token" });
     return;
  }

  
  (req as any).user_id = userId;

  next();
}
