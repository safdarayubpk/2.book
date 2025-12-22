# Research: HuggingFace Backend Deployment

**Feature**: 009-huggingface-backend
**Date**: 2025-12-22

## Research Questions

### 1. HuggingFace Spaces Docker SDK Requirements

**Decision**: Use Docker SDK with Python 3.11 slim base image, port 7860, user ID 1000

**Rationale**:
- HuggingFace Spaces requires `sdk: docker` in README.md YAML frontmatter
- Default port is 7860, configurable via `app_port` in YAML
- Container must run as user ID 1000 for security
- Only `/tmp` directory is writable (except with persistent storage upgrade)

**Alternatives Considered**:
- Gradio SDK: Not suitable for pure API backend
- Streamlit SDK: Not suitable for FastAPI
- Static SDK: No backend support

**Source**: [HuggingFace Docker Spaces Documentation](https://huggingface.co/docs/hub/en/spaces-sdks-docker)

---

### 2. Environment Variables and Secrets Handling

**Decision**: Use HuggingFace Secrets (Settings tab) for all API keys, access via `os.environ` at runtime

**Rationale**:
- Secrets created in Settings tab are injected as environment variables at runtime
- No need to modify api.py's `load_env()` function - just skip .env file requirement
- Secrets are not exposed in public repository or logs
- Runtime access via `os.environ.get("SECRET_NAME")` works identically to local .env

**Required Secrets**:
| Secret Name | Description |
|-------------|-------------|
| COHERE_API_KEY | Cohere embedding API key |
| OPENAI_API_KEY | OpenAI chat completion API key |
| QDRANT_URL | Qdrant Cloud instance URL |
| QDRANT_API_KEY | Qdrant Cloud API key |
| DATABASE_URL | Neon PostgreSQL connection string |

**Alternatives Considered**:
- Buildtime secrets via `--mount=type=secret`: More complex, not needed for runtime-only access
- Hardcoded values: Security risk, not acceptable

**Source**: [HuggingFace Secrets Documentation](https://huggingface.co/docs/hub/en/spaces-overview#managing-secrets)

---

### 3. CORS Configuration for Vercel Frontend

**Decision**: Update `api.py` CORS middleware to include Vercel production domain and preview URL patterns

**Rationale**:
- Current CORS only allows localhost origins
- Vercel production URL format: `https://{project-name}.vercel.app`
- Vercel preview URLs format: `https://{project-name}-{hash}-{username}.vercel.app`
- Can use regex pattern or list specific domains

**Implementation**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",  # All Vercel deployments
        # Or specific: "https://2-book.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

**Alternatives Considered**:
- Allow all origins (`*`): Less secure, but simpler
- Proxy through Vercel: Adds latency and complexity

---

### 4. Frontend API URL Configuration

**Decision**: Use Vercel environment variable `NEXT_PUBLIC_API_URL` or direct configuration in chatApi.ts

**Rationale**:
- Current code checks `window.ENV_API_URL` or falls back to localhost
- For Docusaurus (not Next.js), use build-time replacement or direct URL
- HuggingFace Space URL format: `https://{username}-{space-name}.hf.space`

**Implementation Options**:
1. **Direct URL** (simplest): Hardcode HuggingFace URL in chatApi.ts
2. **Vercel env var**: Set `VITE_API_URL` or similar at build time
3. **Runtime config**: Inject via script tag in HTML

**Recommended**: Direct URL replacement in chatApi.ts for simplicity

**Alternatives Considered**:
- Environment variable at runtime: Docusaurus is static, no server-side env vars
- Config file: Adds complexity for single URL change

---

### 5. Cold Start Behavior

**Decision**: Accept 30-60 second cold start on free tier, frontend timeout already handles this

**Rationale**:
- HuggingFace free tier spaces sleep after ~48 hours of inactivity
- First request triggers container restart
- Cold start typically takes 30-60 seconds depending on image size
- Frontend already has 60-second timeout configured

**Mitigation Options**:
1. **Accept delay**: Show loading indicator to user (current behavior)
2. **Upgrade to paid tier**: Prevents sleeping, but costs money
3. **Ping service periodically**: External cron to keep alive (complex)

**Recommended**: Accept delay (Option 1) - matches free tier philosophy

---

### 6. Dockerfile Best Practices for FastAPI on HuggingFace

**Decision**: Multi-stage build with Python 3.11 slim, non-root user, minimal layers

**Rationale**:
- Smaller images = faster cold starts
- Non-root user (ID 1000) required by HuggingFace
- Copy only necessary files to reduce image size

**Dockerfile Structure**:
```dockerfile
FROM python:3.11-slim

# Create non-root user (required by HuggingFace)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user PATH=/home/user/.local/bin:$PATH
WORKDIR $HOME/app

# Install dependencies
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=user scripts/ ./scripts/

# Expose port and run
EXPOSE 7860
CMD ["uvicorn", "scripts.api:app", "--host", "0.0.0.0", "--port", "7860"]
```

**Source**: [Docker Spaces Permissions](https://huggingface.co/docs/hub/en/spaces-sdks-docker#permissions)

---

### 7. api.py Modifications for HuggingFace

**Decision**: Modify `load_env()` to work without .env file when environment variables are already set

**Rationale**:
- Current code requires .env file to exist
- On HuggingFace, secrets are injected as environment variables directly
- Need to make .env file optional

**Implementation**:
```python
def load_env() -> None:
    """Load environment variables from .env file if it exists."""
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path, override=True)
    # Secrets may be injected directly by HuggingFace

    required_vars = ["COHERE_API_KEY", "QDRANT_URL", "QDRANT_API_KEY", "DATABASE_URL", "OPENAI_API_KEY"]
    missing = [v for v in required_vars if not os.getenv(v)]
    if missing:
        logger.error(f"Missing environment variables: {', '.join(missing)}")
        raise RuntimeError(f"Configuration error: Missing {', '.join(missing)}")
```

---

## Summary of Decisions

| Topic | Decision |
|-------|----------|
| Docker base image | Python 3.11 slim |
| Port | 7860 (HuggingFace default) |
| User ID | 1000 (HuggingFace requirement) |
| Secrets | HuggingFace Settings → runtime env vars |
| CORS | Add Vercel domains to allowed origins |
| Frontend URL | Direct replacement in chatApi.ts |
| Cold start | Accept 30-60s delay on free tier |
| api.py changes | Make .env file optional |
