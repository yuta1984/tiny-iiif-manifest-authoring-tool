declare global {
  namespace Express {
    interface User {
      id: string;
    }
  }
}

export interface User {
  id: string;
  hash?: string;
  salt?: string;
  createdAt: number;
}

export interface Manifest {
  id: string;
  uid: string;
  label: string;
  description: string;
  attribution: string;
  viewingHint: string;
  viewingDirection: string;
  logo: string;
  license: string;
  seeAlso: string;
  updatedAt: number;
  createdAt: number;
  metadata:
    | {
        label: string;
        value: string;
      }[]
    | string;
}

export interface Image {
  id: string;
  name: string;
  uid: string;
  size: number;
  width: number;
  height: number;
  manifestId: string;
  status: string;
  createdAt: number;
}
