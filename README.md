## Sentinel

**Sentinel** is a dossier-style personal relationship management (PRM) application designed for extreme networkers, researchers, and individuals who demand perfect recall of their social and professional circles. Inspired by the high-density information architecture of a CIA dossier, Sentinel acts as a secure repository for human intelligence, cataloging everything from basic contact details to "Deep Lore".

---

### 🛡️ Core Philosophy: Privacy by Design

Sentinel is built on a **Zero-Knowledge Architecture**. Highly sensitive data—including secrets, psychological profiles, and interaction notes—is encrypted on the client side using **AES-256-GCM** before it ever reaches the server. Your master key is never stored, ensuring that only you can access the intelligence you've gathered.

### 📂 Intelligence Categories

* **Core Identity & Biometrics**: Track legal names, aliases, physical appearance, and defining features.
* **Deep Lore**: Securely store shared secrets, core values, political leanings, and personal anecdotes.
* **Social Graph**: Map complex relationships between contacts and visualize your network as a node-based matrix.
* **Interaction Timeline**: Log every text, call, and meeting with sentiment tracking and action items.
* **Professional Intelligence**: Maintain records of career history, financial assets, and educational backgrounds.

### 🛠️ Technical Stack

* **Frontend**: Next.js (React) with Tailwind CSS and Shadcn UI.
* **Backend**: Next.js API Routes (Serverless Functions).
* **Database**: MongoDB Atlas with connection pooling for serverless efficiency.
* **Security**: Client-side encryption with Web Crypto API / AES-GCM and Argon2 for key derivation.


> **Warning**: Sentinel is designed for private, ethical use in managing personal relationships and character bibles. Users are responsible for ensuring their data collection complies with local privacy laws and ethical standards.