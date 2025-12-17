import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "123123";

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
  role?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  // ✅ Must be: Authorization: Bearer <token>
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authorization token missing" });
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || !parts[1]) {
    res.status(401).json({ message: "Malformed authorization header" });
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      userId: string;
      username: string;
      role: string;
    };

    req.userId = decoded.userId;
    req.username = decoded.username;
    req.role = decoded.role;

    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
}

