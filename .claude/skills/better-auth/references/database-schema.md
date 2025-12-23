# Database Schema for Authentication

## User Table with Personalization Fields

```sql
CREATE TABLE users (
    -- Core fields (required by better-auth)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    image VARCHAR(500),

    -- Custom fields for content personalization
    programming_level VARCHAR(50) CHECK (programming_level IN (
        'beginner',      -- < 1 year experience
        'intermediate',  -- 1-3 years experience
        'advanced'       -- 3+ years experience
    )),

    hardware_background VARCHAR(50) CHECK (hardware_background IN (
        'none',          -- No hardware experience
        'hobbyist',      -- Arduino, Raspberry Pi, hobby projects
        'professional'   -- Industrial robotics, professional experience
    )),

    learning_goals TEXT[], -- Array: career_transition, academic, personal, upskilling

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table (for OAuth providers)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,  -- 'google', 'github', etc.
    provider_account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_account_id)
);

-- Verification tokens (for email verification, password reset)
CREATE TABLE verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL,  -- email address
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_verification_token ON verification_tokens(token);
```

## TypeScript Types

```typescript
interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  // Custom personalization fields
  programmingLevel: 'beginner' | 'intermediate' | 'advanced' | null;
  hardwareBackground: 'none' | 'hobbyist' | 'professional' | null;
  learningGoals: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  user: User;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  programmingLevel?: string;
  hardwareBackground?: string;
  learningGoals?: string[];
}
```

## Personalization Query

Get user preferences for content personalization:

```sql
SELECT
    programming_level,
    hardware_background,
    learning_goals
FROM users
WHERE id = $1;
```

Use these fields to adjust content complexity and examples shown to the user.
