import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../auth/jwtutils";

// Use res.locals to attach the user ID without TypeScript issues
export function verifyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token" });
    return;
  }

  const [valid, decoded] = verifyJWT(token);

  if (!valid || !decoded?.id) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }

  res.locals.user_id = decoded.id; // ✅ Clean and safe
  next();
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return next();

  const [valid, decoded] = verifyJWT(token);
  if (valid && decoded?.id) {
    res.locals.user_id = decoded.id;
  }

  next();
}
