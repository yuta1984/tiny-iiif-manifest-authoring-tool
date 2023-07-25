declare global {
  namespace Express {
    interface User {
      id: string;
    }
  }
}

export type User = {
  id: string;
  hash?: string;
  salt?: string;
  createdAt: number;
};
