import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { prisma } from '../config/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

async function resolveUser(token: string): Promise<JwtPayload | null> {
  try {
    const payload = verifyToken(token);
    const exists = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true },
    });
    return exists ? payload : null;
  } catch {
    return null;
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token as string | undefined;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const payload = await resolveUser(token);
  if (!payload) {
    res.clearCookie('token');
    res.status(401).json({ error: 'Session expired — please log in again' });
    return;
  }
  req.user = payload;
  next();
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token as string | undefined;
  if (token) {
    const payload = await resolveUser(token);
    if (payload) req.user = payload;
    // stale token → silently continue as guest (cookie cleared on next authenticated request)
  }
  next();
}
