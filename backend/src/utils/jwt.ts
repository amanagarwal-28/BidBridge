import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { AuthPayload } from '../types';

export const signToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as AuthPayload;
};
