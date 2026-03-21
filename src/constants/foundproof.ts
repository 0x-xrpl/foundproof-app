export const APP_NAME = "FoundProof";
export const PROOF_VERSION = "1";
export const PROOF_CHAIN = "symbol";
export const SYMBOL_TESTNET_NODE = "https://sym-test-01.opening-line.jp:3001";
export const SYMBOL_TESTNET_EXPLORER = "https://testnet.symbol.fyi";
export const SYMBOL_LOCAL_BOOTSTRAP_NODE = "http://127.0.0.1:3000";
export const SYMBOL_LOCAL_BOOTSTRAP_EXPLORER = "http://127.0.0.1:90";
export const SYMBOL_PROOF_MESSAGE_PREFIX = "FOUNDPROOF";

export const REQUIRED_COPY = {
  en: {
    network: "FoundProof is a proof network for lost-and-found records.",
    noPeer: "FoundProof is not a peer-to-peer exchange or resale platform.",
    institution:
      "The app helps document a finding event and supports handoff to the appropriate institution.",
    ownership: "Ownership is not determined by the app.",
    ai: "AI assists input and discovery, but does not make legal or moral judgments.",
    symbol: "Symbol is used as the proof layer."
  },
  ja: {
    network: "FoundProof は、落とし物の拾得記録を証明可能にするアプリです。",
    noPeer: "個人間の受け渡しや売買を仲介するものではありません。",
    institution: "適切な機関への引き渡しを支援するための記録基盤です。",
    ownership: "所有権判定は行いません。",
    ai: "AI は入力補助と探索補助に限定されます。",
    symbol: "Symbol は proof layer として使用されます。"
  }
} as const;
