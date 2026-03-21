import { categories } from "@/data/categories";

type AiSuggestion = {
  category: string;
  description: string;
};

const keywordMap: Record<string, AiSuggestion> = {
  earbud: {
    category: "wireless_earbuds",
    description: "Small wireless earbuds case documented near the reported area."
  },
  earbuds: {
    category: "wireless_earbuds",
    description: "Wireless earbuds recorded as a found item awaiting institutional handoff."
  },
  wallet: {
    category: "wallet",
    description: "Wallet-like item documented for lost-and-found processing."
  },
  bag: {
    category: "bag",
    description: "Bag or pouch recorded as a found item."
  },
  key: {
    category: "keys",
    description: "Keys documented for handoff to an authorized desk."
  },
  phone: {
    category: "phone",
    description: "Phone-sized device documented without ownership claims."
  },
  umbrella: {
    category: "umbrella",
    description: "Umbrella recorded as a found item for institutional handoff."
  }
};

export async function suggestFromImage(imageUri: string): Promise<AiSuggestion> {
  const lower = imageUri.toLowerCase();
  const matchedEntry = Object.entries(keywordMap).find(([keyword]) => lower.includes(keyword));

  if (matchedEntry) {
    return matchedEntry[1];
  }

  return {
    category: categories[categories.length - 1],
    description: "Found item documented with AI-assisted neutral labeling."
  };
}

export async function refineDescription(category: string, existingDescription: string) {
  if (existingDescription.trim().length > 0) {
    return existingDescription.trim();
  }

  return `Found item categorized as ${category.replaceAll("_", " ")} and prepared for handoff.`;
}
