import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { UserModel } from "../model/UserModel";

const SECRET_KEY = process.env.JWT_SECRET_TOKEN || "SECURE-DEFAULT_SECRET;."

export const extractAuthToken = (req): string => {
  const authorization = req.headers.authorization || "";
  return authorization.split(" ")[1];
};

export const generateToken = (user: UserModel ): string => {
  return jwt.sign({ user }, SECRET_KEY);
}

const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY) as JwtPayload 
};

const validateToken = (req: any, res: Response, next: NextFunction, isAdminValidation: boolean) => {
  const token = extractAuthToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Please Login.' });
  }

  try {
    const decoded = verifyToken(token);
    if (isAdminValidation && !decoded.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    req.user = decoded.user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Unauthorized. Invalid token.' });
  }
};

export const validateAdmin = (req, res: Response, next: NextFunction) => {
  validateToken(req, res, next, true);
  };

export const validateUser = (req: any, res: Response, next: NextFunction) => {
  validateToken(req, res, next, false);
};