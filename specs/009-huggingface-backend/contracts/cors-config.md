# CORS Configuration Contract

**Feature**: 009-huggingface-backend
**Purpose**: Define the CORS middleware configuration for cross-origin requests from Vercel

## Current Configuration (api.py)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

## Required Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Development
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        # Production (Vercel)
        "https://2-book.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Preview deployments
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

## Allowed Origins

| Origin | Environment | Purpose |
|--------|-------------|---------|
| http://localhost:3000 | Development | Local Docusaurus dev server |
| http://127.0.0.1:3000 | Development | Alternative localhost |
| https://2-book.vercel.app | Production | Main Vercel deployment |
| https://*.vercel.app | Preview | Vercel preview deployments |

## Alternative: Wildcard (Less Secure)

If exact domains are difficult to maintain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False with wildcard
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

**Note**: Wildcard origin cannot be used with `allow_credentials=True`.

## Security Considerations

1. **Prefer explicit origins** over wildcards
2. **Use regex** for dynamic subdomains (Vercel previews)
3. **Keep credentials enabled** for session management
4. **Review origins** when adding new deployment targets

## Verification

After deployment, verify CORS by:

1. Open browser DevTools → Network tab
2. Make request from Vercel frontend to HuggingFace API
3. Check response headers include `Access-Control-Allow-Origin`
4. Verify no CORS errors in console
