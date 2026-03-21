#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import YAML from "yaml";

const candidates = [
  process.argv[2],
  path.join(process.cwd(), "target", "addresses.yml"),
  path.join(process.cwd(), "target", "addresses.yaml")
].filter(Boolean);

const sourceFile = candidates.find((candidate) => existsSync(candidate));

if (!sourceFile) {
  throw new Error("Could not find addresses.yml. Start symbol-bootstrap first, then rerun this command.");
}

const document = YAML.parse(readFileSync(sourceFile, "utf8"));
const discovered = [];

function visit(node, trail = []) {
  if (Array.isArray(node)) {
    node.forEach((value, index) => visit(value, [...trail, String(index)]));
    return;
  }

  if (!node || typeof node !== "object") {
    return;
  }

  const privateKey = typeof node.privateKey === "string" ? node.privateKey : undefined;
  const publicKey = typeof node.publicKey === "string" ? node.publicKey : undefined;
  const address = typeof node.address === "string" ? node.address : undefined;
  const name = typeof node.name === "string" ? node.name : undefined;

  if (privateKey || publicKey || address) {
    discovered.push({
      path: trail.join("."),
      name,
      address,
      publicKey,
      privateKey
    });
  }

  Object.entries(node).forEach(([key, value]) => {
    visit(value, [...trail, key]);
  });
}

visit(document);

const unique = [];
const seen = new Set();

for (const entry of discovered) {
  const key = [entry.path, entry.privateKey, entry.publicKey, entry.address].join("|");
  if (seen.has(key)) {
    continue;
  }

  seen.add(key);
  unique.push(entry);
}

unique.sort((left, right) => {
  const leftPriority = /nemesis|faucet/i.test(left.path) ? 0 : 1;
  const rightPriority = /nemesis|faucet/i.test(right.path) ? 0 : 1;
  return leftPriority - rightPriority;
});

console.log(JSON.stringify({ sourceFile, accounts: unique }, null, 2));
