# 2.book Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-13

## Active Technologies
- TypeScript 5.x (Docusaurus uses TypeScript/React) + Docusaurus 3.x, React 18.x, MDX (001-textbook-generation)
- TypeScript 5.x + File-based output (chunks.json) (002-rag-content-chunking)
- Python 3.x + Qdrant Cloud (Free Tier) - vector database (003-rag-vector-embeddings)
- Python 3.x + Neon PostgreSQL (Free Tier) - metadata persistence (004-rag-metadata-persistence)
- Python 3.x (matching existing scripts) + fastapi, uvicorn, cohere, qdrant-client, psycopg2-binary, python-dotenv, pydantic (005-rag-retrieval-api)
- Qdrant Cloud (vectors), Neon PostgreSQL (metadata) (005-rag-retrieval-api)
- Python 3.x (matching existing scripts) + openai, fastapi, uvicorn, pydantic (extend existing api.py) (006-rag-ai-agent)
- In-memory session store (no additional database required) (006-rag-ai-agent)
- TypeScript 5.6, React 19.x + @docusaurus/core 3.9.2, @docusaurus/theme-classic (for swizzling), React 19.x (007-chat-ui-highlight-ask)
- Browser sessionStorage for conversation history (no additional backend storage) (007-chat-ui-highlight-ask)
- TypeScript 5.x / CSS3 (Docusaurus theme customization) + Docusaurus 3.x, Infima CSS framework (built-in) (008-content-centered-layout)
- N/A (CSS-only feature) (008-content-centered-layout)
- Python 3.11 (existing backend) + FastAPI, uvicorn, cohere, qdrant-client, psycopg2-binary, openai, python-dotenv, pydantic (009-huggingface-backend)
- Qdrant Cloud (vectors), Neon PostgreSQL (metadata) - external services, no local storage needed (009-huggingface-backend)
- CSS3 (within Docusaurus 3.x TypeScript/React project) + Docusaurus classic theme, Infima CSS framework (010-layout-spacing)
- Python 3.11 (backend), TypeScript 5.x (frontend) + FastAPI, uvicorn, passlib, PyJWT (backend); React 18.x, Docusaurus 3.x (frontend) (011-user-auth)
- Neon PostgreSQL (existing - add users/sessions tables) (011-user-auth)
- TypeScript 5.x (frontend), Python 3.11 (backend) + React 18.x, Docusaurus 3.x (frontend); FastAPI, OpenAI (backend) (012-content-personalization)
- Neon PostgreSQL (user profiles), Qdrant (chapter vectors) - existing (012-content-personalization)

## Project Structure

```text
docs/                    # Docusaurus content (MDX chapters)
data/
└── chunks.json          # Chunked content for RAG
scripts/
├── embed-vectors.py     # Cohere embeddings → Qdrant
├── search-vectors.py    # Semantic search verification
└── store-metadata.py    # Metadata → Neon Postgres (004)
src/
tests/
```

## Commands

```bash
npm test && npm run lint           # Frontend tests
npm run ingest                     # Generate chunks.json
python scripts/embed-vectors.py   # Store vectors in Qdrant
python scripts/store-metadata.py  # Store metadata in Postgres
python scripts/search-vectors.py "query"  # Test semantic search
```

## Code Style

TypeScript 5.x (Docusaurus uses TypeScript/React): Follow standard conventions
Python 3.x: Follow existing patterns in scripts/ (load_env, batch processing, progress logging)

## Recent Changes
- 012-content-personalization: Added TypeScript 5.x (frontend), Python 3.11 (backend) + React 18.x, Docusaurus 3.x (frontend); FastAPI, OpenAI (backend)
- 011-user-auth: Added Python 3.11 (backend), TypeScript 5.x (frontend) + FastAPI, uvicorn, passlib, PyJWT (backend); React 18.x, Docusaurus 3.x (frontend)
- 010-layout-spacing: Added CSS3 (within Docusaurus 3.x TypeScript/React project) + Docusaurus classic theme, Infima CSS framework

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
