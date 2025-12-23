#!/usr/bin/env python3
"""
RAG Retrieval API with AI Agent for Book Content

FastAPI service that combines semantic vector search (Qdrant) with
AI-powered chat using OpenAI GPT for context-aware responses.

Usage:
    uvicorn scripts.api:app --reload --port 8000

Endpoints:
    GET  /health  - Service health status
    POST /search  - Semantic search for book content
    POST /chat    - AI agent chat with RAG context
    DELETE /chat/sessions/{session_id} - End chat session
"""

import logging
import os
import sys
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

import cohere
import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import OpenAI, APIError, APIConnectionError, RateLimitError
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient

# Import auth routes (relative import for package structure)
from .auth_routes import router as auth_router

# Import personalization utilities
from .personalization_utils import personalize_chapter_content, VALID_CHAPTER_SLUGS


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# Constants
COLLECTION_NAME = "book_vectors"
COHERE_MODEL = "embed-english-v3.0"
DEFAULT_TOP_K = 5
MAX_TOP_K = 20

# Agent Constants (T008)
MAX_MESSAGE_LENGTH = 500
MAX_TURNS = 10
SESSION_TIMEOUT_MINUTES = 30
OPENAI_MODEL = "gpt-4o-mini"

# System Prompt for RAG Agent (T010)
SYSTEM_PROMPT = """You are a helpful assistant for an educational textbook about Physical AI and Humanoid Robotics.

IMPORTANT RULES:
1. Answer questions ONLY based on the provided context from the textbook.
2. Always cite your sources using inline references like [1], [2], etc.
3. If the context doesn't contain relevant information, say so honestly - do NOT make up information.
4. Keep responses clear, educational, and focused on the book content.
5. At the end of your response, list the sources you cited.

Your scope is limited to the textbook content. If asked about topics not covered, politely explain that you can only answer questions about the book's content on Physical AI and Humanoid Robotics."""


# =============================================================================
# Pydantic Models (T010)
# =============================================================================

class SearchRequest(BaseModel):
    """Search request with query and optional parameters."""
    query: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Natural language search query"
    )
    top_k: int = Field(
        default=DEFAULT_TOP_K,
        ge=1,
        le=MAX_TOP_K,
        description="Number of results to return (1-20, default 5)"
    )


class SearchResult(BaseModel):
    """Single search result with metadata."""
    chunk_id: str = Field(..., description="Unique chunk identifier")
    snippet: str = Field(..., description="Text content of the chunk")
    source_path: str = Field(..., description="Source file path")
    slug: str = Field(..., description="URL-friendly identifier")
    title: Optional[str] = Field(None, description="Document title")
    score: float = Field(..., description="Relevance score (0-1)")


class SearchResponse(BaseModel):
    """Search response with query echo and results."""
    query: str = Field(..., description="Original search query")
    results: List[SearchResult] = Field(
        default_factory=list,
        description="Ranked search results"
    )


class HealthResponse(BaseModel):
    """Health check response with dependency status."""
    status: str = Field(..., description="Overall status (ok/degraded/error)")
    qdrant: bool = Field(..., description="Qdrant connectivity status")
    postgres: bool = Field(..., description="Postgres connectivity status")
    openai: bool = Field(default=True, description="OpenAI client status")


class ErrorResponse(BaseModel):
    """Standardized error response."""
    error: str = Field(..., description="Error type identifier")
    message: str = Field(..., description="Human-readable error message")


# =============================================================================
# Personalization Pydantic Models
# =============================================================================

class UserProfile(BaseModel):
    """User profile for personalization."""
    programming_level: str = Field(
        ...,
        description="User's programming experience level",
        pattern="^(beginner|intermediate|advanced)$"
    )
    hardware_background: str = Field(
        ...,
        description="User's hardware/robotics experience",
        pattern="^(none|hobbyist|professional)$"
    )
    learning_goals: List[str] = Field(
        ...,
        min_length=1,
        description="User's learning objectives"
    )


class PersonalizeRequest(BaseModel):
    """Request for content personalization."""
    chapter_slug: str = Field(
        ...,
        description="Chapter identifier (intro, chapter-1 through chapter-6)"
    )
    user_profile: UserProfile = Field(
        ...,
        description="User's background information"
    )


class PersonalizeMetadata(BaseModel):
    """Metadata about the personalization process."""
    processing_time_ms: int = Field(..., description="Time taken to personalize")
    tokens_used: int = Field(..., description="OpenAI tokens consumed")
    profile_summary: str = Field(..., description="Summary of personalization applied")


class PersonalizeResponse(BaseModel):
    """Response with personalized content."""
    chapter_slug: str = Field(..., description="Echo of input chapter slug")
    original_title: str = Field(..., description="Original chapter title")
    personalized_content: str = Field(..., description="AI-generated personalized content")
    metadata: PersonalizeMetadata = Field(..., description="Processing information")


# =============================================================================
# Chat Pydantic Models (T007)
# =============================================================================

class ChatRequest(BaseModel):
    """Chat request with message and optional session."""
    message: str = Field(
        ...,
        min_length=1,
        max_length=MAX_MESSAGE_LENGTH,
        description="User's natural language query"
    )
    session_id: Optional[str] = Field(
        None,
        description="Session identifier for multi-turn conversations"
    )


class Source(BaseModel):
    """Source reference from knowledge base."""
    chunk_id: str = Field(..., description="Unique chunk identifier")
    title: Optional[str] = Field(None, description="Document title")
    slug: str = Field(..., description="URL-friendly identifier")
    score: float = Field(..., description="Relevance score (0-1)")


class ResponseMetadata(BaseModel):
    """Processing metadata for debugging."""
    response_time_ms: int = Field(..., description="Total processing time in milliseconds")
    tokens_used: Optional[int] = Field(None, description="LLM tokens consumed")
    context_chunks: int = Field(..., description="Number of RAG chunks used")


class ChatResponse(BaseModel):
    """Chat response with message, sources, and metadata."""
    session_id: str = Field(..., description="Session identifier for follow-up queries")
    message: str = Field(..., description="AI-generated response with inline citations")
    sources: List[Source] = Field(default_factory=list, description="Sources used in the response")
    metadata: ResponseMetadata = Field(..., description="Processing metadata")


# =============================================================================
# Session Models (T020 - Internal)
# =============================================================================

class ConversationTurn:
    """A single exchange in a conversation."""
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content
        self.timestamp = datetime.now()


class Session:
    """In-memory session state."""
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.turns: List[ConversationTurn] = []
        self.created_at = datetime.now()
        self.last_activity = datetime.now()

    def add_turn(self, role: str, content: str):
        """Add a turn with sliding window."""
        self.turns.append(ConversationTurn(role, content))
        self.last_activity = datetime.now()
        # Keep only last MAX_TURNS
        if len(self.turns) > MAX_TURNS * 2:  # user + assistant = 2 per exchange
            self.turns = self.turns[-(MAX_TURNS * 2):]

    def is_expired(self) -> bool:
        """Check if session has expired."""
        return datetime.now() - self.last_activity > timedelta(minutes=SESSION_TIMEOUT_MINUTES)

    def get_history(self) -> List[dict]:
        """Get conversation history for LLM."""
        return [{"role": t.role, "content": t.content} for t in self.turns]


# =============================================================================
# Global Clients (initialized on startup)
# =============================================================================

cohere_client: Optional[cohere.Client] = None
qdrant_client: Optional[QdrantClient] = None
db_connection: Optional[psycopg2.extensions.connection] = None
openai_client: Optional[OpenAI] = None

# Session Store (T021)
sessions: Dict[str, Session] = {}


# =============================================================================
# Environment and Client Initialization (T006-T009)
# =============================================================================

def load_env() -> None:
    """Load environment variables from .env file if it exists.

    On HuggingFace Spaces, secrets are injected directly as environment variables,
    so the .env file is optional.
    """
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path, override=True)
        logger.info("Loaded environment from .env file")
    else:
        logger.info("No .env file found - using environment variables directly")

    required_vars = ["COHERE_API_KEY", "QDRANT_URL", "QDRANT_API_KEY", "DATABASE_URL", "OPENAI_API_KEY", "BETTER_AUTH_SECRET"]
    missing = [v for v in required_vars if not os.getenv(v)]
    if missing:
        logger.error(f"Missing environment variables: {', '.join(missing)}")
        raise RuntimeError(f"Configuration error: Missing {', '.join(missing)}")

    logger.info("Environment loaded: COHERE_API_KEY=***, QDRANT_URL=***, DATABASE_URL=***, OPENAI_API_KEY=***")


def init_cohere_client() -> cohere.Client:
    """Initialize and return Cohere client."""
    api_key = os.getenv("COHERE_API_KEY")
    client = cohere.Client(api_key)
    logger.info("Cohere client initialized")
    return client


def init_qdrant_client() -> QdrantClient:
    """Initialize and return Qdrant client."""
    url = os.getenv("QDRANT_URL")
    api_key = os.getenv("QDRANT_API_KEY")
    # Use longer timeout for cloud instances (default is 5s which can be too short)
    client = QdrantClient(url=url, api_key=api_key, timeout=30)
    logger.info("Qdrant client initialized")
    return client


def init_db_connection() -> Optional[psycopg2.extensions.connection]:
    """Initialize and return PostgreSQL connection."""
    database_url = os.getenv("DATABASE_URL")
    try:
        conn = psycopg2.connect(database_url, connect_timeout=10)
        logger.info("PostgreSQL connection established")
        return conn
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed: {e}")
        logger.warning("Continuing without Postgres - using Qdrant payload only")
        return None


def init_openai_client() -> OpenAI:
    """Initialize and return OpenAI client (T006)."""
    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)
    logger.info("OpenAI client initialized")
    return client


# =============================================================================
# Health Check Functions (T019-T020)
# =============================================================================

def check_qdrant_health() -> bool:
    """Verify Qdrant connectivity by checking collection exists."""
    try:
        if qdrant_client is None:
            return False
        info = qdrant_client.get_collection(COLLECTION_NAME)
        return info.points_count >= 0
    except Exception as e:
        logger.warning(f"Qdrant health check failed: {e}")
        return False


def check_postgres_health() -> bool:
    """Verify Postgres connectivity by running a simple query."""
    try:
        if db_connection is None or db_connection.closed:
            return False
        with db_connection.cursor() as cur:
            cur.execute("SELECT 1")
            return True
    except Exception as e:
        logger.warning(f"Postgres health check failed: {e}")
        return False


def check_openai_health() -> bool:
    """Verify OpenAI client is initialized (T051)."""
    return openai_client is not None


# =============================================================================
# Search Functions (T013-T014)
# =============================================================================

def embed_query(query: str) -> List[float]:
    """Generate embedding for search query using Cohere."""
    if cohere_client is None:
        raise RuntimeError("Cohere client not initialized")

    response = cohere_client.embed(
        texts=[query],
        model=COHERE_MODEL,
        input_type="search_query"
    )
    return response.embeddings[0]


def vector_search(query_vector: List[float], top_k: int) -> List[dict]:
    """Perform semantic similarity search in Qdrant."""
    if qdrant_client is None:
        raise RuntimeError("Qdrant client not initialized")

    results = qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k,
        with_payload=True
    )

    # Build results from Qdrant payload (contains all needed fields)
    search_results = []
    for point in results.points:
        payload = point.payload
        search_results.append({
            "chunk_id": payload.get("chunk_id", ""),
            "snippet": payload.get("text", ""),
            "source_path": payload.get("source_path", ""),
            "slug": payload.get("slug", ""),
            "title": payload.get("title"),
            "score": point.score
        })

    return search_results


# =============================================================================
# Agent Functions (T011-T018, T022-T028, T030-T039)
# =============================================================================

def get_or_create_session(session_id: Optional[str]) -> Session:
    """Get existing session or create new one (T022)."""
    if session_id and session_id in sessions:
        session = sessions[session_id]
        if not session.is_expired():
            return session
        # Session expired, remove it
        del sessions[session_id]

    # Create new session
    new_id = session_id if session_id else str(uuid.uuid4())
    session = Session(new_id)
    sessions[new_id] = session
    return session


def cleanup_expired_sessions() -> int:
    """Remove expired sessions (T023, T028)."""
    expired = [sid for sid, s in sessions.items() if s.is_expired()]
    for sid in expired:
        del sessions[sid]
    if expired:
        logger.info(f"Cleaned up {len(expired)} expired sessions")
    return len(expired)


def build_context_from_search(search_results: List[dict]) -> str:
    """Format RAG results for LLM context (T011)."""
    if not search_results:
        return ""

    context_parts = []
    for i, result in enumerate(search_results, 1):
        title = result.get("title") or "Untitled"
        slug = result.get("slug", "")
        snippet = result.get("snippet", "")
        context_parts.append(f"[{i}] {title} (/{slug}):\n{snippet}")

    return "\n\n".join(context_parts)


def build_prompt(query: str, context: str, conversation_history: List[dict]) -> List[dict]:
    """Construct LLM prompt with context and history (T012, T025)."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Add conversation history
    messages.extend(conversation_history)

    # Build current user message with context
    if context:
        user_content = f"Context from the textbook:\n\n{context}\n\nUser question: {query}"
    else:
        user_content = f"User question: {query}\n\n(Note: No relevant context was found in the textbook for this query.)"

    messages.append({"role": "user", "content": user_content})

    return messages


def generate_response(messages: List[dict]) -> tuple[str, Optional[int]]:
    """
    Generate response using OpenAI (T013, T042).

    Handles OpenAI-specific errors with appropriate error responses.
    """
    if openai_client is None:
        raise RuntimeError("OpenAI client not initialized")

    try:
        response = openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )

        content = response.choices[0].message.content
        tokens_used = response.usage.total_tokens if response.usage else None

        return content, tokens_used

    except RateLimitError as e:
        # T042: Rate limit exceeded
        logger.error(f"OpenAI rate limit exceeded: {e}")
        raise HTTPException(
            status_code=429,
            detail="Service is temporarily busy. Please try again in a moment."
        )
    except APIConnectionError as e:
        # T042: Connection error
        logger.error(f"OpenAI connection error: {e}")
        raise HTTPException(
            status_code=502,
            detail="Unable to connect to AI service. Please try again."
        )
    except APIError as e:
        # T042: General API error
        logger.error(f"OpenAI API error: {e}")
        raise HTTPException(
            status_code=502,
            detail="Unable to generate response. Please try again."
        )
    except Exception as e:
        # T039: Unexpected error
        logger.error(f"Unexpected OpenAI error: {e}")
        raise


def extract_sources(search_results: List[dict]) -> List[Source]:
    """Convert SearchResult to Source list (T014, T031)."""
    sources = []
    for result in search_results:
        sources.append(Source(
            chunk_id=result.get("chunk_id", ""),
            title=result.get("title"),
            slug=result.get("slug", ""),
            score=result.get("score", 0.0)
        ))
    return sources


# =============================================================================
# Application Lifecycle (T011)
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize clients on startup, cleanup on shutdown."""
    global cohere_client, qdrant_client, db_connection, openai_client

    logger.info("=" * 50)
    logger.info("RAG Retrieval API Starting")
    logger.info("=" * 50)

    try:
        load_env()
        cohere_client = init_cohere_client()
        qdrant_client = init_qdrant_client()
        db_connection = init_db_connection()  # May be None if DB unavailable
        openai_client = init_openai_client()
        if db_connection:
            logger.info("All services initialized successfully")
        else:
            logger.info("Services initialized (Postgres unavailable - using Qdrant payload only)")
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

    yield

    # Cleanup
    if db_connection and not db_connection.closed:
        db_connection.close()
        logger.info("PostgreSQL connection closed")
    logger.info("RAG Retrieval API Shutdown")


# =============================================================================
# FastAPI Application (T005)
# =============================================================================

app = FastAPI(
    title="RAG Retrieval API",
    description="Semantic search API for book content retrieval",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend access
# Includes localhost (dev), Vercel production, and Vercel preview deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Development
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        # Production (Vercel)
        "https://2-book.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Vercel preview deployments
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include auth routes
app.include_router(auth_router)


# =============================================================================
# Exception Handlers (T027-T031, T041-T043)
# =============================================================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle Pydantic validation errors with user-friendly messages (T041).

    Translates validation errors into consistent error responses for:
    - Empty message
    - Message too long
    - Invalid session_id format
    """
    errors = exc.errors()
    if errors:
        first_error = errors[0]
        field = first_error.get("loc", ["", "unknown"])[-1]
        error_type = first_error.get("type", "")

        # T041: ChatRequest validation - empty message
        if field == "message" and error_type in ("string_too_short", "value_error.any_str.min_length"):
            return JSONResponse(
                status_code=400,
                content={"error": "validation_error", "message": "Message cannot be empty"}
            )

        # T041: ChatRequest validation - message too long
        if field == "message" and error_type in ("string_too_long", "value_error.any_str.max_length"):
            return JSONResponse(
                status_code=400,
                content={
                    "error": "validation_error",
                    "message": f"Message exceeds maximum length of {MAX_MESSAGE_LENGTH} characters"
                }
            )

        # T043: Invalid session_id format
        if field == "session_id":
            return JSONResponse(
                status_code=400,
                content={"error": "validation_error", "message": "Invalid session_id format"}
            )

    # Default validation error
    return JSONResponse(
        status_code=400,
        content={"error": "validation_error", "message": "Invalid request data"}
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with consistent error format."""
    error_type = "validation_error" if exc.status_code == 400 else "internal_error"
    if exc.status_code == 502:
        error_type = "upstream_error"
    elif exc.status_code == 503:
        error_type = "service_unavailable"

    return JSONResponse(
        status_code=exc.status_code,
        content={"error": error_type, "message": str(exc.detail)}
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors with consistent format."""
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "internal_error", "message": "An unexpected error occurred"}
    )


# =============================================================================
# Endpoints (T015, T021)
# =============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Check service health and dependency connectivity (T051).

    Returns status of Qdrant, Postgres, and OpenAI connections.
    """
    qdrant_ok = check_qdrant_health()
    postgres_ok = check_postgres_health()
    openai_ok = check_openai_health()

    # All critical services must be available for "ok" status
    if qdrant_ok and postgres_ok and openai_ok:
        status = "ok"
    elif qdrant_ok and openai_ok:  # Can work without Postgres (uses Qdrant payload)
        status = "degraded"
    elif qdrant_ok or openai_ok:
        status = "degraded"
    else:
        status = "error"

    return HealthResponse(
        status=status,
        qdrant=qdrant_ok,
        postgres=postgres_ok,
        openai=openai_ok
    )


@app.post("/search", response_model=SearchResponse)
async def semantic_search(request: SearchRequest):
    """
    Search book content using natural language queries.

    Generates query embedding, performs vector search, and returns
    ranked results with metadata for citations.
    """
    start_time = time.time()

    # Log request (T017)
    logger.info(f"Search request: query='{request.query[:50]}...' top_k={request.top_k}")

    try:
        # Generate query embedding (T013)
        query_vector = embed_query(request.query)
    except Exception as e:
        logger.error(f"Embedding error: {e}")
        raise HTTPException(status_code=502, detail="Failed to generate query embedding")

    try:
        # Perform vector search (T014, T016)
        results = vector_search(query_vector, request.top_k)
    except Exception as e:
        logger.error(f"Vector search error: {e}")
        raise HTTPException(status_code=503, detail="Vector store is unreachable")

    # Build response
    search_results = [SearchResult(**r) for r in results]

    # Log response time (T017)
    elapsed = time.time() - start_time
    logger.info(f"Search completed: {len(search_results)} results in {elapsed:.3f}s")

    return SearchResponse(
        query=request.query,
        results=search_results
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    AI-powered chat endpoint with RAG context retrieval.

    Accepts natural language queries, retrieves relevant book content,
    and generates contextual responses with source attribution.

    T015-T019: POST /chat endpoint implementation
    T026, T028: Session management integration
    T030-T034: Source attribution
    T035-T038: Logging
    """
    start_time = time.time()

    # T035: Log request at start
    logger.info(f"Chat request: query='{request.message[:50]}...' session_id={request.session_id}")

    # T028: Cleanup expired sessions on each request
    cleanup_expired_sessions()

    # T026: Get or create session
    session = get_or_create_session(request.session_id)

    try:
        # T016: Step 1 - Generate embedding and perform RAG search
        query_vector = embed_query(request.message)
        search_results = vector_search(query_vector, DEFAULT_TOP_K)

        # T036: Log RAG results
        chunk_ids = [r.get("chunk_id", "") for r in search_results]
        scores = [r.get("score", 0) for r in search_results]
        logger.info(f"RAG search: {len(search_results)} results, chunk_ids={chunk_ids}, scores={scores}")

        # T018: Handle empty RAG results
        if not search_results:
            logger.info("No RAG results found for query")

        # T016: Step 2 - Build context from search results
        context = build_context_from_search(search_results)

        # T016: Step 3 - Build prompt with conversation history
        conversation_history = session.get_history()
        messages = build_prompt(request.message, context, conversation_history)

        # T016: Step 4 - Generate response
        llm_start_time = time.time()
        response_text, tokens_used = generate_response(messages)
        llm_elapsed = time.time() - llm_start_time

        # T037: Log LLM generation
        logger.info(f"LLM generation: tokens_used={tokens_used}, generation_time={llm_elapsed:.3f}s")

        # T024, T026: Update session with this exchange
        session.add_turn("user", request.message)
        session.add_turn("assistant", response_text)

        # T014, T031, T032, T033: Extract sources for response
        sources = extract_sources(search_results)

        # T017: Build response with metadata
        total_elapsed = time.time() - start_time
        response_time_ms = int(total_elapsed * 1000)

        # T038: Log response time
        logger.info(f"Chat completed: response_time={response_time_ms}ms, context_chunks={len(search_results)}")

        # T044: Warn if response time exceeds 5 seconds
        if total_elapsed > 5:
            logger.warning(f"Response time exceeded 5 seconds: {total_elapsed:.2f}s")

        return ChatResponse(
            session_id=session.session_id,
            message=response_text,
            sources=sources,
            metadata=ResponseMetadata(
                response_time_ms=response_time_ms,
                tokens_used=tokens_used,
                context_chunks=len(search_results)
            )
        )

    except Exception as e:
        # T039: Error logging with context
        logger.error(f"Chat error: session_id={session.session_id}, query='{request.message[:50]}...', error={e}")
        raise HTTPException(status_code=502, detail="Unable to generate response. Please try again.")


@app.delete("/chat/sessions/{session_id}")
async def delete_session(session_id: str):
    """
    End a chat session explicitly.

    T027: DELETE /chat/sessions/{session_id} endpoint
    """
    if session_id in sessions:
        del sessions[session_id]
        logger.info(f"Session deleted: {session_id}")
        return {"message": "Session ended successfully"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")


@app.post("/personalize", response_model=PersonalizeResponse)
async def personalize_content(request: PersonalizeRequest):
    """
    Personalize chapter content based on user profile.

    Takes a chapter slug and user profile, returns personalized content
    adapted to the user's programming level, hardware background, and learning goals.
    """
    start_time = time.time()

    # Log request
    logger.info(f"Personalize request: chapter={request.chapter_slug}, "
                f"level={request.user_profile.programming_level}, "
                f"hardware={request.user_profile.hardware_background}")

    # Validate chapter slug
    if request.chapter_slug not in VALID_CHAPTER_SLUGS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid chapter_slug: must be one of {', '.join(VALID_CHAPTER_SLUGS)}"
        )

    # Validate learning goals
    valid_goals = {"career_transition", "academic", "personal", "upskilling"}
    for goal in request.user_profile.learning_goals:
        if goal not in valid_goals:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid learning goal '{goal}': must be one of {', '.join(valid_goals)}"
            )

    try:
        # Call personalization utility
        result = personalize_chapter_content(
            openai_client=openai_client,
            qdrant_client=qdrant_client,
            chapter_slug=request.chapter_slug,
            programming_level=request.user_profile.programming_level,
            hardware_background=request.user_profile.hardware_background,
            learning_goals=request.user_profile.learning_goals
        )

        # Build response
        response = PersonalizeResponse(
            chapter_slug=result["chapter_slug"],
            original_title=result["original_title"],
            personalized_content=result["personalized_content"],
            metadata=PersonalizeMetadata(
                processing_time_ms=result["metadata"]["processing_time_ms"],
                tokens_used=result["metadata"]["tokens_used"],
                profile_summary=result["metadata"]["profile_summary"]
            )
        )

        elapsed = time.time() - start_time
        logger.info(f"Personalization complete: {elapsed:.2f}s")

        return response

    except ValueError as e:
        # Content not found or invalid input
        logger.warning(f"Personalization validation error: {e}")
        raise HTTPException(status_code=404, detail=str(e))

    except RuntimeError as e:
        # OpenAI or other runtime error
        logger.error(f"Personalization runtime error: {e}")
        raise HTTPException(status_code=500, detail="Unable to personalize content. Please try again.")

    except Exception as e:
        # Unexpected error
        logger.error(f"Personalization unexpected error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


# =============================================================================
# Main Entry Point
# =============================================================================

def main():
    """Run the API server."""
    import uvicorn
    uvicorn.run(
        "scripts.api:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )


if __name__ == "__main__":
    main()
