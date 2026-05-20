import jwt from 'jsonwebtoken';

const fallbackSecret = 'development-only-team-task-manager-secret';

export const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production.');
  }

  return fallbackSecret;
};

export const signAuthToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const verifyAuthToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};
