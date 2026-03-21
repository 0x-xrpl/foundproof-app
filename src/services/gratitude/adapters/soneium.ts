import {
  GratitudePaymentAdapter,
  GratitudePaymentIntentInput
} from "@/services/gratitude/types";

export const soneiumGratitudeAdapter: GratitudePaymentAdapter = {
  id: "soneium",
  label: "Soneium",
  getAvailability() {
    return {
      enabled: false,
      chain: "soneium",
      reason:
        "Disabled by default. Future-only adapter; no wallet integration or token transfer is implemented."
    };
  },
  async createIntent(_input: GratitudePaymentIntentInput) {
    return {
      adapter: "soneium",
      status: "disabled",
      message:
        "Soneium gratitude payments are not implemented in the current MVP."
    };
  }
};
