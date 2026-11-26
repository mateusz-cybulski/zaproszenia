export type EventReadiness = {
  guests: number;
  unverified: number;
  withoutAddress: number;
  invitationTemplate: boolean;
  envelopeTemplate: boolean;
  senderComplete: boolean;
};
