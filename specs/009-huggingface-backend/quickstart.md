# Quickstart: HuggingFace Backend Deployment

**Feature**: 009-huggingface-backend
**Time**: ~15-20 minutes

## Prerequisites

- [ ] HuggingFace account (free tier is fine)
- [ ] Your API keys ready:
  - COHERE_API_KEY
  - OPENAI_API_KEY
  - QDRANT_URL
  - QDRANT_API_KEY
  - DATABASE_URL (Neon PostgreSQL)

## Step 1: Create HuggingFace Space (2 min)

1. Go to https://huggingface.co/new-space
2. Fill in:
   - **Owner**: Your username (safdarayubpk)
   - **Space name**: `book-rag-api`
   - **License**: MIT (or your preference)
   - **SDK**: Select **Docker**
   - **Hardware**: CPU basic (free)
3. Click **Create Space**

## Step 2: Add Secrets (3 min)

1. Go to your Space → **Settings** tab
2. Scroll to **Repository secrets**
3. Add each secret (click "New secret" for each):

| Secret Name | Value |
|-------------|-------|
| COHERE_API_KEY | Your Cohere API key |
| OPENAI_API_KEY | Your OpenAI API key |
| QDRANT_URL | https://your-cluster.qdrant.io |
| QDRANT_API_KEY | Your Qdrant API key |
| DATABASE_URL | postgresql://user:pass@host/db |

## Step 3: Prepare Local Files (5 min)

### 3.1 Create Dockerfile

Create `Dockerfile` in your project root:

```dockerfile
FROM python:3.11-slim

RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user PATH=/home/user/.local/bin:$PATH
WORKDIR $HOME/app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=user scripts/ ./scripts/

EXPOSE 7860
CMD ["uvicorn", "scripts.api:app", "--host", "0.0.0.0", "--port", "7860"]
```

### 3.2 Update api.py CORS

In `scripts/api.py`, find the CORS middleware and update:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://2-book.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

### 3.3 Update api.py load_env()

Make .env file optional (for HuggingFace where secrets are injected):

```python
def load_env() -> None:
    """Load environment variables from .env file if it exists."""
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path, override=True)
    # On HuggingFace, secrets are injected directly as env vars

    required_vars = ["COHERE_API_KEY", "QDRANT_URL", "QDRANT_API_KEY", "DATABASE_URL", "OPENAI_API_KEY"]
    missing = [v for v in required_vars if not os.getenv(v)]
    if missing:
        logger.error(f"Missing environment variables: {', '.join(missing)}")
        raise RuntimeError(f"Configuration error: Missing {', '.join(missing)}")
```

## Step 4: Push to HuggingFace (5 min)

### Option A: Push directly from your repo

```bash
# Add HuggingFace remote
git remote add huggingface https://huggingface.co/spaces/safdarayubpk/book-rag-api

# Push (only needed files)
git push huggingface main
```

### Option B: Clone Space and copy files

```bash
# Clone the Space
git clone https://huggingface.co/spaces/safdarayubpk/book-rag-api
cd book-rag-api

# Copy required files
cp /path/to/your/project/Dockerfile .
cp /path/to/your/project/requirements.txt .
cp -r /path/to/your/project/scripts .

# Create README.md with HuggingFace metadata
cat > README.md << 'EOF'
---
title: Book RAG API
emoji: 📚
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
---

# Book RAG API
RAG chatbot API for Physical AI textbook
EOF

# Push
git add .
git commit -m "Initial deployment"
git push
```

## Step 5: Update Frontend (2 min)

In `src/services/chatApi.ts`, update the API URL:

```typescript
const API_BASE_URL = 'https://safdarayubpk-book-rag-api.hf.space';
```

Then rebuild and deploy frontend:

```bash
npm run build
# Deploy to Vercel (automatic if connected)
```

## Step 6: Verify Deployment (3 min)

1. **Check Space status**: Go to your HuggingFace Space, wait for "Running" status
2. **Test health endpoint**: Visit `https://safdarayubpk-book-rag-api.hf.space/health`
3. **Test from frontend**: Open your Vercel site, use the chatbot

## Troubleshooting

### Space shows "Building"
- Wait 2-5 minutes for Docker build to complete

### Space shows "Error"
- Check **Logs** tab for error messages
- Verify all secrets are set correctly
- Check Dockerfile syntax

### CORS errors in browser
- Verify CORS origins include your Vercel domain
- Check browser DevTools Network tab for details

### Chat returns errors
- Check HuggingFace Space logs
- Verify external services (Qdrant, OpenAI) are accessible
- Test health endpoint to see service status

## Expected Result

After completion:
- HuggingFace Space running at `https://safdarayubpk-book-rag-api.hf.space`
- Health endpoint returns `{"status": "ok", ...}`
- Chatbot on Vercel site works for all visitors
