import { Jwt } from "jsonwebtoken"; 
import { sign, verify } from "jsonwebtoken";

export const generateToken = (payload: object): string => {
  const token = sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '1h',
  });
  return token;
};

export const verifyToken = (token: string): object | null => {
  try {
    const decoded = verify(token, process.env.JWT_SECRET as string);
    return decoded as object;
  } catch (error) {
    return null;
  }
};