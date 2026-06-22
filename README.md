# AI Document Q&A System (RAG Chatbot)

A full-stack AI-powered chatbot that lets users upload PDF documents and ask questions about them in natural language. The system retrieves relevant information from uploaded documents using a Retrieval-Augmented Generation (RAG) pipeline and generates accurate, **cited** answers — every response links back to the exact document and page it came from.

Built end-to-end: authentication, document management, a RAG pipeline (PDF parsing → chunking → embeddings → FAISS vector search), Gemini-powered chat with conversational memory and streaming responses, and a full React frontend.

---

## ✨ Features

**Authentication**
- Signup / login / logout with JWT
- Protected routes (frontend + backend)

**Document Management**
- Upload PDFs (multiple files supported)
- Live processing status (Processing → Ready → Failed)
- View, list, and delete documents
- Per-user document isolation

**AI Chat**
- ChatGPT-style chat interface
- Real-time streaming responses
- Conversational memory (multi-turn context)
- Chat history, multiple conversations
- Typing indicator
- Source citations with page numbers and excerpt snippets

**RAG Pipeline**
- PDF text extraction (page-aware)
- Chunking with overlap (`RecursiveCharacterTextSplitter`)
- Local embeddings (HuggingFace `all-MiniLM-L6-v2` — free, no API cost)
- Per-document FAISS vector indexes
- Multi-document retrieval and merging
- Gemini-powered answer generation, grounded strictly in retrieved context

**UI/UX**
- Modern, custom-designed interface (not default Tailwind styling)
- Dark mode (manual toggle, persisted)
- Fully responsive (mobile, tablet, desktop)
- Toast notifications, loading states, smooth animations

**Dashboard**
- Total documents / total chats
- Recent documents and recent chats

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | FastAPI, Python |
| AI / RAG | LangChain, FAISS, Google Gemini API, HuggingFace Embeddings |
| Document Processing | PyPDF |
| Database | PostgreSQL |
| Auth | JWT |

---

## 📁 Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint
│   │   ├── config.py            # Settings (.env)
│   │   ├── database/            # SQLAlchemy engine/session
│   │   ├── models/               # ORM models (User, Document, Chat, Message)
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── auth/                 # JWT + password hashing + auth dependency
│   │   ├── routes/                # API endpoints
│   │   ├── services/              # Business logic
│   │   ├── rag/                   # PDF loading, chunking, embeddings, FAISS, Gemini
│   │   └── utils/
│   ├── alembic/                  # Database migrations
│   ├── storage/                  # Uploaded PDFs + FAISS indexes (gitignored)
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/            # auth, chat, documents, dashboard, layout, common
    │   ├── pages/                  # Route-level pages
    │   ├── context/                 # Auth, Theme, Toast contexts
    │   ├── hooks/                    # useAuth, useChat, useDocuments, useToast, useTheme
    │   ├── services/                  # API call layer (per resource)
    │   └── utils/
    ├── package.json
    └── .env.example
```

---

## 🚀 Local Setup

### Prerequisites
- Python 3.11+ 
- Node.js 18+
- PostgreSQL 14+
- A free [Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Clone the repository
```bash
git clone https://github.com/Pal2912/AI-Document-Q-A-System-Chatbot.git
cd AI-Document-Q-A-System-Chatbot
```

### 2. Backend setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_SECRET_KEY` — generate with `python -c "import secrets; print(secrets.token_hex(32))"`
- `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/app/apikey)
- `GEMINI_MODEL` — check which models your key has quota for; `gemini-2.5-flash-lite` is a reliable free-tier default

Create the database and run migrations:
```bash
createdb rag_chatbot_db        # or: psql -c "CREATE DATABASE rag_chatbot_db;"
alembic upgrade head
```

Start the server:
```bash
uvicorn app.main:app --reload
```
API docs available at `http://localhost:8000/docs`.

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
App available at `http://localhost:5173`.

---

## 🔑 Environment Variables

**Backend (`backend/.env`)**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Random secret for signing JWTs |
| `JWT_ALGORITHM` | Default: `HS256` |
| `JWT_EXPIRE_MINUTES` | Token lifetime, default `10080` (7 days) |
| `GEMINI_API_KEY` | Your Gemini API key |
| `GEMINI_MODEL` | Gemini model name (verify quota availability for your account) |
| `EMBEDDING_MODEL` | Default: `sentence-transformers/all-MiniLM-L6-v2` |
| `UPLOAD_DIR` / `VECTOR_STORE_DIR` | Local storage paths |
| `FRONTEND_URL` | For CORS — your frontend's origin |

**Frontend (`frontend/.env`)**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:8000`) |

---

## 🧠 How the RAG Pipeline Works

1. **Upload** — PDF is validated, saved to disk, and a `Document` row is created with `status="processing"`. The upload response returns immediately.
2. **Background processing** — a background task extracts text page-by-page (`PyPDFLoader`), splits it into overlapping ~1000-character chunks, embeds each chunk locally (HuggingFace), and builds a per-document FAISS index.
3. **Status update** — once indexing succeeds, `status` flips to `"ready"` (or `"failed"` with a logged reason).
4. **Chat** — when a question is asked, the relevant document's FAISS index (or each selected document's index, merged) is searched for the most similar chunks. Those chunks, plus recent conversation history, are assembled into a prompt and sent to Gemini, which is instructed to answer strictly from the provided context.
5. **Streaming + citations** — the answer streams back token-by-token. Once complete, the source chunks (document name, page number, excerpt) are saved alongside the message and returned to the frontend as citations.

---

## 🛡️ Security Notes

- Passwords are hashed with `bcrypt` — never stored in plaintext.
- JWTs are stateless; tokens expire after 7 days by default.
- Every document/chat database query is scoped to the authenticated user — cross-user access attempts return `404`, not `403`, to avoid revealing resource existence.
- `.env` files are gitignored; only `.env.example` templates are committed.

---

## 📌 Known Limitations

- Background document processing uses FastAPI's `BackgroundTasks` (in-process), not a dedicated task queue — fine for personal/small-scale use; a Celery/Redis setup would be the next step for heavier concurrent load.
- JWTs cannot be revoked before expiry (no server-side blocklist) — acceptable for this project's scope.
- Gemini free-tier quota varies by account/region/model; if you hit a `429` or quota error, check which models are actually available to your key.

---

## 📄 License

This project was built as a learning/portfolio project. Feel free to fork and adapt it.
