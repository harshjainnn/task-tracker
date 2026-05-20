import prisma from '../config/db.js';
import { verifyAuthToken } from '../utils/jwt.js';

/**
 * Middleware: Verify JWT Token
 * Decrypts the token and attaches the authenticated user object to the request.
 */
export const verifyToken = async (req, res, next) => {
  try {
    let token;

    // Retrieve token from Authorization header (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    // Verify token signature
    const decoded = verifyAuthToken(token);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. The active user profile no longer exists.',
      });
    }

    // Attach user profile to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Verification failed:', error.message);
    
    // Explicit responses for expiration vs invalid signatures
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid token signature.',
    });
  }
};

/**
 * Middleware: Protect Route
 * Enforces that req.user is set (user must be authenticated).
 */
export const protectRoute = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. You must be authenticated to access this resource.',
    });
  }
  next();
};

/**
 * Middleware: Admin Role Gate
 * Restricts access to users with the 'ADMIN' role only.
 */
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Permission denied. This resource is restricted to system administrators.',
    });
  }
  next();
};
