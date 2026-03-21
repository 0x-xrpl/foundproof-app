import { astarGratitudeAdapter } from "@/services/gratitude/adapters/astar";
import { soneiumGratitudeAdapter } from "@/services/gratitude/adapters/soneium";
import { getGratitudePaymentFeatureState } from "@/services/gratitude/config";
import {
  GratitudePaymentAdapter,
  GratitudePaymentChain,
  GratitudePaymentIntentInput
} from "@/services/gratitude/types";

const adapters: Record<GratitudePaymentChain, GratitudePaymentAdapter> = {
  soneium: soneiumGratitudeAdapter,
  astar: astarGratitudeAdapter
};

export function listGratitudePaymentAdapters() {
  return Object.values(adapters).map((adapter) => ({
    id: adapter.id,
    label: adapter.label,
    availability: adapter.getAvailability()
  }));
}

export async function createGratitudePaymentIntent(
  adapterId: GratitudePaymentChain,
  input: GratitudePaymentIntentInput
) {
  const feature = getGratitudePaymentFeatureState();

  if (!feature.enabled) {
    return {
      adapter: adapterId,
      status: "disabled" as const,
      message:
        "Gratitude payments are disabled by default in the current MVP."
    };
  }

  return adapters[adapterId].createIntent(input);
}
