export type GratitudePaymentChain = "soneium" | "astar";

export type GratitudePaymentFeatureState = {
  enabled: boolean;
  defaultAdapter: GratitudePaymentChain | "none";
};

export type GratitudePaymentAvailability = {
  enabled: boolean;
  chain: GratitudePaymentChain;
  reason: string;
};

export type GratitudePaymentIntentInput = {
  recordId: string;
  returnReferenceId: string;
  amountMinor: number;
  currencyCode: string;
  payoutRoute: "institution" | "platform_managed";
};

export type GratitudePaymentIntent = {
  adapter: GratitudePaymentChain;
  status: "disabled" | "planned";
  message: string;
};

export interface GratitudePaymentAdapter {
  id: GratitudePaymentChain;
  label: string;
  getAvailability(): GratitudePaymentAvailability;
  createIntent(input: GratitudePaymentIntentInput): Promise<GratitudePaymentIntent>;
}
