# FoundProof Demo Script

## 60-second version

At a station platform, someone finds a pair of wireless earbuds. They open FoundProof, take a photo, and the app records the time and location immediately. AI suggests the category and a short description, but it does not decide ownership.

They choose `station_counter` as the handoff destination and save the record. FoundProof generates an `imageHash`, then a `recordHash`, and anchors that proof on Symbol Testnet. The proof screen shows the record ID, record hash, transaction hash, and explorer link.

Now switch to the search flow. A person who lost earbuds searches by keyword, station area, and recent time. FoundProof returns the matching record, and the detail page shows the proof reference plus the institution handoff type. The value is clear: a good-faith finding event becomes verifiable proof, and the lost item becomes discoverable without direct person-to-person contact.

## 3-minute version

### 1. Problem

Lost-and-found information is fragmented across stations, hotels, airports, venues, and facilities. A person who loses something has to guess where to ask. A person who finds something may also struggle to prove when and where they acted in good faith.

### 2. Product

FoundProof turns the moment of finding into proof. It records a finding event, stores the searchable data off-chain, and anchors a verifiable proof on Symbol. It is not a peer-to-peer exchange, resale, or direct handoff platform.

### 3. Capture flow

Here is the Capture screen. I take a photo of the found earbuds, and the app shows the preview. I fetch location and timestamp, then use the AI assist action to suggest a category like `wireless_earbuds` and a short neutral description. Next I choose the handoff institution, in this case `station_counter`.

When I save, the app stores the image off-chain, generates `imageHash`, builds a normalized record payload, and computes `recordHash`.

### 4. Proof flow

Now I create proof. FoundProof sends only the minimum proof payload to Symbol Testnet. The image itself is never placed on-chain. What goes on-chain is the record hash inside a self-transfer transaction message. The result screen confirms that this record is anchored on Symbol Testnet and shows the transaction hash for verification.

### 5. Search flow

On the Search screen, a person who lost earbuds enters a keyword, filters by category, date, and area, and runs the query. The Results screen lists candidates from the off-chain discovery layer. When we open the detail page, we can inspect the summary, handoff type, proof status, and the Symbol reference.

### 6. Why this matters

FoundProof does not claim ownership. It does not create a marketplace. It creates a trustworthy record of a finding event and makes that record discoverable across institutions. Symbol is used only as the proof layer, while search remains off-chain for speed and usability.
