export type Guest = {
  id: number;
  name: string;
  email: string | null;
  createdAt: string;
};

export type GuestInput = {
  name: string;
  email: string | null;
};
