# Data Model: User Authentication

**Feature**: 011-user-auth
**Date**: 2025-12-23

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        users                             │
├─────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                           │
│ email: VARCHAR(255) UNIQUE NOT NULL                     │
│ password_hash: VARCHAR(255) NOT NULL                    │
│ name: VARCHAR(255)                                      │
│ programming_level: VARCHAR(50)                          │
│ hardware_background: VARCHAR(50)                        │
│ learning_goals: TEXT[]                                  │
│ created_at: TIMESTAMP                                   │
│ updated_at: TIMESTAMP                                   │
└─────────────────────────────────────────────────────────┘
```

## Entity: User

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User login email |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| name | VARCHAR(255) | optional | Display name |
| programming_level | VARCHAR(50) | optional | beginner/intermediate/advanced |
| hardware_background | VARCHAR(50) | optional | none/hobbyist/professional |
| learning_goals | TEXT[] | optional | Array of goal strings |
| created_at | TIMESTAMP | auto | Account creation time |
| updated_at | TIMESTAMP | auto | Last update time |

### Valid Values

**programming_level**:
- `beginner` - Less than 1 year experience
- `intermediate` - 1-3 years experience
- `advanced` - 3+ years experience

**hardware_background**:
- `none` - No hardware/robotics experience
- `hobbyist` - Arduino, Raspberry Pi projects
- `professional` - Industrial robotics experience

**learning_goals** (array, multi-select):
- `career_transition` - Changing careers to robotics/AI
- `academic` - Academic study or research
- `personal` - Personal interest/hobby
- `upskilling` - Professional development

## SQL Schema

```sql
-- Create users table with personalization fields
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    programming_level VARCHAR(50) CHECK (
        programming_level IN ('beginner', 'intermediate', 'advanced')
    ),
    hardware_background VARCHAR(50) CHECK (
        hardware_background IN ('none', 'hobbyist', 'professional')
    ),
    learning_goals TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookups (login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

## State Transitions

### User Account States

```
[Anonymous] --signup--> [Registered]
[Registered] --login--> [Authenticated]
[Authenticated] --logout--> [Anonymous]
[Authenticated] --token_expired--> [Anonymous]
```

## Validation Rules

### Email
- Must be valid email format
- Must be unique in database
- Max 255 characters

### Password
- Minimum 8 characters
- Stored as bcrypt hash (never plaintext)

### Programming Level
- Must be one of: beginner, intermediate, advanced
- Required during signup step 2

### Hardware Background
- Must be one of: none, hobbyist, professional
- Required during signup step 2

### Learning Goals
- Array of 1+ goals
- Each goal must be valid value
- Required during signup step 2

## Pydantic Models (Backend)

```python
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from enum import Enum

class ProgrammingLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

class HardwareBackground(str, Enum):
    none = "none"
    hobbyist = "hobbyist"
    professional = "professional"

class LearningGoal(str, Enum):
    career_transition = "career_transition"
    academic = "academic"
    personal = "personal"
    upskilling = "upskilling"

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: Optional[str] = None
    programming_level: ProgrammingLevel
    hardware_background: HardwareBackground
    learning_goals: List[LearningGoal] = Field(min_items=1)

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    programming_level: Optional[str]
    hardware_background: Optional[str]
    learning_goals: Optional[List[str]]
```

## TypeScript Types (Frontend)

```typescript
export type ProgrammingLevel = 'beginner' | 'intermediate' | 'advanced';
export type HardwareBackground = 'none' | 'hobbyist' | 'professional';
export type LearningGoal = 'career_transition' | 'academic' | 'personal' | 'upskilling';

export interface User {
  id: string;
  email: string;
  name?: string;
  programmingLevel?: ProgrammingLevel;
  hardwareBackground?: HardwareBackground;
  learningGoals?: LearningGoal[];
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  programmingLevel: ProgrammingLevel;
  hardwareBackground: HardwareBackground;
  learningGoals: LearningGoal[];
}

export interface SignInData {
  email: string;
  password: string;
}
```
