import {
  GratitudePaymentChain,
  GratitudePaymentFeatureState
} from "@/services/gratitude/types";

const enabled = process.env.EXPO_PUBLIC_GRATITUDE_PAYMENTS_ENABLED === "true";
const configuredAdapter = process.env.EXPO_PUBLIC_GRATITUDE_PAYMENT_ADAPTER;

function parseAdapter(value?: string): GratitudePaymentChain | "none" {
  if (value === "soneium" || value === "astar") {
    return value;
  }

  return "none";
}

export function getGratitudePaymentFeatureState(): GratitudePaymentFeatureState {
  return {
    enabled,
    defaultAdapter: enabled ? parseAdapter(configuredAdapter) : "none"
  };
}
