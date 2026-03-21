import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_ANCHOR_TX_KEY = "foundproof:last-anchor-txhash";

export async function setLastAnchorTxHash(txHash?: string) {
  if (!txHash) {
    return;
  }

  await AsyncStorage.setItem(LAST_ANCHOR_TX_KEY, txHash);
}

export async function getLastAnchorTxHash() {
  return AsyncStorage.getItem(LAST_ANCHOR_TX_KEY);
}
