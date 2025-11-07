import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        id: string;
        email: string;
        role: string;
        college?: string;
        name?: string;
        [key: string]: any;
      };
    }
  }
}

export {};
