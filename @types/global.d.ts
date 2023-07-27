import { User as AppUser } from './../src/types';

declare global {
  namespace Express {
    interface User {
      id: string;
    }
  }
}
