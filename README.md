# ⚖️ LexAi — Your Decentralized AI Legal Assistant

LexAi is a decentralized AI-powered legal assistant built on the [Internet Computer Protocol (ICP)](https://internetcomputer.org/), designed to provide real-time legal guidance, session-based chat, and generate professional legal documents while preserving user privacy and data ownership.

---

## 🚀 Features

- 💬 **Chat-based Legal Guidance**: Interact with an AI trained for legal conversations.
- 🧠 **Gemini API Integration**: Uses Google's Gemini LLM to generate high-quality responses and legal documents.
- 📝 **Dynamic Document Generation**: Create contracts like NDAs, Rental Agreements, Employment Letters, and more using template + fields.
- 🔐 **Decentralized Identity**: User sessions and data are tied to their unique ICP Principal.
- 🗂 **Persistent Session History**: Store and retrieve past conversations securely.
- 📄 **Custom Legal Templates**: Create and manage your own templates.
- 🧾 **Downloadable Legal Docs**: Securely generate and download structured, ready-to-use documents.
- 🛡️ **Privacy-First**: All user data is stored in canister stable memory—fully decentralized and private.
  
---

## 🧱 Architecture

```

Frontend (Next.js/React)
|
\|--> Calls Canister via @dfinity/agent
|
\|--> LexAi Canister (Rust + ic-cdk)
|
\|--> User Storage (StableBTreeMap\<Principal, User>)
\|--> Session Storage (StableBTreeMap\<String, Session>)
\|--> Document Storage (StableBTreeMap\<String, DocumentText>)
\|--> Template Storage (StableBTreeMap\<String, LegalTemplate>)
|
\|--> Gemini API Integration via HTTPS Outcalls

````

---

## 🛠️ Tech Stack

| Layer        | Tech Used                                    |
|--------------|----------------------------------------------|
| Frontend     | React, Tailwind CSS, Vite, @dfinity/agent    |
| Backend      | Rust, `ic-cdk`, `ic-stable-structures`, Candid |
| AI Engine    | Gemini 1.5 Flash API by Google               |
| Platform     | Internet Computer Protocol (ICP)             |
| Data Storage | Stable Memory on-chain via `StableBTreeMap`  |

---

## 🧪 Local Development Setup

### 1. Prerequisites

- [DFX SDK](https://smartcontracts.org/docs/quickstart/quickstart.html)
- Node.js + npm
- Rust & cargo (`rustup`)
- Vite (frontend)

### 2. Clone the Repo

```bash
git clone https://github.com/YOUR_USERNAME/lexai.git](https://github.com/amsorrytola/LexAi
cd lexai
````

### 3. Start Local ICP Replica

```bash
dfx start --background
```

### 4. Build & Deploy Canisters

```bash
dfx deploy
```

> Ensure your `dfx.json` includes the canister entry for `LexAi_backend`.

### 5. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Core Canister Functions

### 📌 User Management

```rust
update get_or_register_user() -> User
update update_profile(username: Option<String>, email: Option<String>)
```

### 🧠 Chat & Session

```rust
update start_session(title: Option<String>) -> String
update chat_in_session(session_id: String, input: String) -> String
query get_session_messages(session_id: String) -> Vec<ChatMessage>
update rename_session(session_id: String, new_title: String)
update delete_session(session_id: String) -> bool
query list_sessions() -> Vec<(String, Option<String>, u64)>
```

### 📄 Legal Document Generation

```rust
query list_templates() -> Vec<(String, String)>
update generate_document(template_id: String, fields: Vec<(String, String)>) -> String
query get_document(document_id: String) -> Option<String>
query list_documents() -> Vec<String>
update add_template(id: String, name: String, template_text: String)
```

---

## 🧠 Gemini API Integration

Gemini 1.5 Flash is used to power both the chatbot and document generator via HTTPS outcalls, with optional field replacement for legal documents.

```rust
async fn query_gemini_api(prompt: &str) -> String
async fn query_gemini_api_document(prompt: &str) -> String
```

Use an API key with this endpoint:

```plaintext
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

Outcalls are routed via the IC’s HTTP interface with a transform function to sanitize headers.

---

## 🧾 Example Document Templates

Built-in templates:

* Non-Disclosure Agreement (NDA)
* Employment Agreement
* Rental Agreement
* Service Agreement
* Purchase Agreement
* Partnership Agreement

> You can easily add your own via `add_template`.

---

## 📂 Directory Structure

```
/lexai
├── backend/
│   └── src/
│       └── lib.rs        # Main Rust canister logic
├── frontend/
│   └── src/
│       ├── pages/        # React pages like Chat, Profile, etc.
│       ├── components/   # Reusable UI components
│       └── services/     # Dfinity Agent integration
├── dfx.json              # Canister config
└── README.md
```

---

## 💡 Future Improvements

* ✅ Document download as PDF
* ✅ Chat session naming + renaming
* ⏳ Admin panel for managing templates
* ⏳ Integration with wallet-based login (Plug, Stoic)
* ⏳ Chat context previews per session

---

## 📜 License

MIT License © 2025 LexAi Team

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo and submit a PR.

---

## 🧠 Built With ❤️ On Internet Computer

Powering privacy-first legal tools using AI + Web3.

```

