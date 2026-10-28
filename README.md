# Site_Grab_guesser

Guess the price of a dish

![Alt text](/public/images/Logo_Grab_Food_Guesser.png)

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Data Bases](#data-bases)

## Installation

Install the package with your package manager.

## Usage

Run the command with a project path.

## Data Bases

## Markdown Schema vs Other Documentation Tools

| Feature                      | Markdown (.md)        | dbdiagram.io / DrawSQL | Confluence / Notion | pgAdmin / DataGrip  | SchemaSpy / tbls       |
| ---------------------------- | --------------------- | ---------------------- | ------------------- | ------------------- | ---------------------- |
| Version controlled in git    | Yes                   | Export only            | No                  | No                  | Re-generate each time  |
| AI assistants can read it    | Natively              | No                     | Poorly              | No                  | Partially              |
| Free and open                | Yes                   | Freemium               | Paid                | Varies              | Yes                    |
| Works offline                | Yes                   | No                     | No                  | Yes                 | Yes (after generation) |
| Reviewable in pull requests  | Yes                   | No                     | No                  | No                  | Yes (if committed)     |
| Includes business context    | Yes (authored)        | No (visual only)       | Yes (if maintained) | No (structure only) | No (auto-generated)    |
| Setup required               | None                  | Account signup         | Account + setup     | Installation        | Installation + config  |
| Stays in sync with code      | Same PR as migrations | Manual export          | Manual update       | Live connection     | Re-run on each change  |
| Human-readable without tools | Yes                   | Need browser           | Need browser        | Need application    | Need browser           |
| Supports query examples      | Yes                   | No                     | Yes                 | No                  | No                     |
| Documents business rules     | Yes                   | No                     | Yes (if maintained) | No                  | No                     |
| Migration history tracking   | Yes                   | No                     | Manual              | No                  | No                     |

**The key advantage of markdown**: it is the only format that combines version control, AI readability, business context, and zero dependencies in a single file. Other tools excel at visualization or auto-generation, but none match markdown for maintaining a living, reviewed, AI-readable schema document.

---

stateDiagram-v2
[*] --> Idle
Idle --> Running : Start
Running --> Paused : Pause
Running --> Finished : End
Paused --> Running : Resume
Paused --> Stopped : Stop
Stopped --> Idle : Reset
Finished --> Idle : Reset
Finished --> [*]

    state Running {
        [*] --> Init
        Init --> Processing
        Processing --> Validate
        Validate --> [*]
    }

````mermaid
flowchart TD
    A[Début] --> B{Choix}
    B -->|Oui| C[Action 1]
    B -->|Non| D[Action 2]
    C --> E[Fin]
    D --> E[Fin]
## How to Format Database Schemas in Markdown

This section shows the markdown syntax patterns for documenting each type of schema information. Use these patterns consistently throughout your schema.md file for maximum readability.

### Table Definitions

Use fenced SQL code blocks for CREATE TABLE statements. Include constraints, defaults, and CHECK clauses inline so the full structure is visible at a glance:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
````

### Column Reference Tables

Use markdown tables to provide column-by-column documentation with business context. This is where you add the meaning that SQL alone cannot express:

| Column     | Type         | Nullable | Default           | Description                                             |
| ---------- | ------------ | -------- | ----------------- | ------------------------------------------------------- |
| id         | UUID         | No       | gen_random_uuid() | Primary key, auto-generated server-side                 |
| email      | VARCHAR(255) | No       | -                 | Login email, globally unique, case-insensitive matching |
| name       | VARCHAR(200) | No       | -                 | Display name shown in the application UI                |
| role       | VARCHAR(20)  | No       | 'member'          | Permission level: admin, member, or viewer              |
| created_at | TIMESTAMP    | No       | CURRENT_TIMESTAMP | Account creation time (stored as UTC)                   |
| deleted_at | TIMESTAMP    | Yes      | -                 | Soft delete marker (null = active record)               |

### Entity Relationship Diagrams

Use text-based diagrams to show how tables connect. Keep them simple and readable in plain text:

```
users
  |-- 1:N --> posts (author_id)
  |-- 1:N --> comments (author_id)
posts
  |-- N:1 --> users (author_id)
  |-- 1:N --> comments (post_id)
  |-- N:N --> tags (via post_tags junction table)
comments
  |-- N:1 --> users (author_id)
  |-- N:1 --> posts (post_id)
```

For more detail, add a relationship reference table documenting foreign keys and delete behavior:

| Parent | Child     | FK Column | Cardinality | ON DELETE | Notes                                |
| ------ | --------- | --------- | ----------- | --------- | ------------------------------------ |
| users  | posts     | author_id | 1:N         | CASCADE   | Deleting user deletes their posts    |
| users  | comments  | author_id | 1:N         | CASCADE   | Deleting user deletes their comments |
| posts  | comments  | post_id   | 1:N         | CASCADE   | Deleting post deletes its comments   |
| posts  | post_tags | post_id   | 1:N         | CASCADE   | Junction table for many-to-many      |
| tags   | post_tags | tag_id    | 1:N         | CASCADE   | Junction table for many-to-many      |

### Business Rules

Use bullet lists to document rules enforced in application code, not just database constraints. These are critical for AI assistants and new developers:

**Business Rules**:

- Users cannot delete their account if they have published posts with comments from other users
- Email addresses are matched case-insensitively (stored as lowercase)
- The 'admin' role can only be assigned by another admin
- Soft-deleted records are excluded from all API responses but retained for 90 days
- Posts with status 'published' cannot be moved back to 'draft'

## Contributing

- Mathias Auguste Luis :
- Galland Matthieu Jean-Pierre :
- Timothée Hao-Jie Maxime :
