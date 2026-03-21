# Future Gratitude Payment Adapters

## Scope

Gratitude payments are not part of the current FoundProof MVP.

Current rule:

- Symbol remains the only proof chain
- off-chain storage remains the discovery and search layer
- gratitude payments are future-only and disabled by default

## Design constraints

Any future gratitude-payment feature must keep these rules:

- no person-to-person messaging
- no direct contact flow
- no wallet integration in the MVP
- no token transfer in the MVP
- only optional post-return gratitude flow

## Extension points in the codebase

Placeholder adapter interfaces and registry are defined here:

- [types.ts](/Users/mee/projects/FoundProof/src/services/gratitude/types.ts)
- [config.ts](/Users/mee/projects/FoundProof/src/services/gratitude/config.ts)
- [registry.ts](/Users/mee/projects/FoundProof/src/services/gratitude/registry.ts)
- [soneium.ts](/Users/mee/projects/FoundProof/src/services/gratitude/adapters/soneium.ts)
- [astar.ts](/Users/mee/projects/FoundProof/src/services/gratitude/adapters/astar.ts)

These adapters are intentionally:

- disabled by default
- non-transactional
- placeholder-only

## Candidate future chains

- Soneium
- Astar

## JPYC note

JPYC compatibility should not be assumed on Soneium unless officially verified.

At the time of writing:

- Soneium official docs describe network and builder integration, but this repository does not assume JPYC support there.
- JPYC official SDK docs list supported chains including Astar, but not Soneium in that supported-chain list.

Therefore, if JPYC is considered later, the adapter layer should allow:

- Soneium as one future route
- Astar as a separate possible JPYC-compatible route

## What is intentionally not implemented

- wallet connection
- token transfer
- payout UI
- return confirmation logic
- institution settlement logic
