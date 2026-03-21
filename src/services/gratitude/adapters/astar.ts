import {
  GratitudePaymentAdapter,
  GratitudePaymentIntentInput
} from "@/services/gratitude/types";

export const astarGratitudeAdapter: GratitudePaymentAdapter = {
  id: "astar",
  label: "Astar",
  getAvailability() {
    return {
      enabled: false,
      chain: "astar",
      reason:
        "Disabled by default. Future-only adapter; no wallet integration or token transfer is implemented."
    };
  },
  async createIntent(_input: GratitudePaymentIntentInput) {
    return {
      adapter: "astar",
      status: "disabled",
      message:
        "Astar gratitude payments are not implemented in the current MVP."
    };
  }
};
