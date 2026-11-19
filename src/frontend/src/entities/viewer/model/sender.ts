export type SenderInput = {
  senderName: string | null;
  street: string | null;
  postalCode: string | null;
  city: string | null;
  country: string;
};

export type Sender = SenderInput & {
  email: string | null;
  complete: boolean;
};
