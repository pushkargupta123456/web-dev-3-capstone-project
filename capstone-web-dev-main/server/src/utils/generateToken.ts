import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { jwtConfig } from '../config/jwt';
import RefreshToken from '../models/RefreshToken';
import mongoose from 'mongoose';

export const generateAccessToken = (payload: { id: string; email: string; role: string; name: string }): string => {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions);
};

export const generateRefreshToken = async (userId: string): Promise<string> => {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    token,
    userId: new mongoose.Types.ObjectId(userId),
    expiresAt,
  });

  return token;
};
