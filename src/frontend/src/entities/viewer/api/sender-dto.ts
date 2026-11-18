import type { Sender, SenderInput } from "../model/sender";

export type SenderDto = {
  email: string | null;
  sender_name: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  sender_complete: boolean;
};

export function toSender(dto: SenderDto): Sender {
  return {
    email: dto.email,
    senderName: dto.sender_name,
    street: dto.street,
    postalCode: dto.postal_code,
    city: dto.city,
    country: dto.country,
    complete: dto.sender_complete,
  };
}

export function toSenderBody(input: SenderInput) {
  return {
    sender_name: input.senderName,
    street: input.street,
    postal_code: input.postalCode,
    city: input.city,
    country: input.country,
  };
}
