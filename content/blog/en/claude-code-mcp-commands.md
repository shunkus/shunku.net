---
title: "Extending Claude Code: Custom Commands and MCP Integration"
date: "2025-11-23"
excerpt: "Supercharge Claude Code with custom slash commands and Model Context Protocol (MCP) integration - connect to databases, APIs, and external tools for enhanced development workflows."
tags: ["Claude Code", "AI", "MCP", "Extensibility", "Integration"]
author: "Shunku"
---

Out of the box, Claude Code is powerful. But its true potential emerges when you extend it with custom commands and external tool integrations. Custom slash commands create reusable prompts, while MCP (Model Context Protocol) connects Claude Code to databases, APIs, and third-party services.

## Custom Slash Commands

Slash commands are reusable prompt templates that standardize common tasks. Instead of typing the same complex instructions repeatedly, create a command once and invoke it with a simple `/command`.

### Creating Custom Commands

Commands are Markdown files stored in the `.claude/commands/` directory:

```
.claude/
└── commands/
    ├── review.md
    ├── test.md
    └── document.md
```

**Example: Code Review Command**

`.claude/commands/review.md`:
```markdown
Review the code in $ARGUMENTS for:

## Security
- Input validation vulnerabilities
- SQL injection or XSS risks
- Hardcoded secrets or credentials
- Authentication/authorization issues

## Performance
- N+1 query problems
- Unnecessary re-renders (React)
- Memory leaks
- Inefficient algorithms

## Maintainability
- Code duplication
- Overly complex functions
- Missing error handling
- Unclear naming

Provide specific line numbers and concrete suggestions for each issue found.
```

Usage:
```
/review src/lib/auth.ts
```

The `$ARGUMENTS` keyword captures everything after the command name.

### Command Organization

Structure commands by purpose:

```
.claude/commands/
├── code/
│   ├── review.md
│   ├── refactor.md
│   └── optimize.md
├── docs/
│   ├── readme.md
│   ├── api-docs.md
│   └── changelog.md
├── git/
│   ├── commit.md
│   └── pr.md
└── test/
    ├── unit.md
    └── e2e.md
```

### Personal vs. Team Commands

| Location | Scope | Shared? |
|----------|-------|---------|
| `.claude/commands/` | Project | Yes (committed) |
| `~/.claude/commands/` | All projects | No (personal) |

Team commands should be committed to version control. Personal commands live in your home directory.

### Practical Command Examples

**Generate Tests**
`.claude/commands/test.md`:
```markdown
Generate comprehensive tests for $ARGUMENTS:

1. First, read the file to understand its functionality
2. Identify all public functions and methods
3. For each function, create tests covering:
   - Happy path scenarios
   - Edge cases (empty inputs, null values, boundaries)
   - Error conditions
4. Use the project's existing test patterns
5. Place tests in the appropriate __tests__ directory
```

**Create Documentation**
`.claude/commands/document.md`:
```markdown
Create documentation for $ARGUMENTS:

1. Read the code and understand its purpose
2. Generate JSDoc/TSDoc comments for all exports
3. Create a README.md if the module lacks one
4. Include:
   - Purpose and overview
   - Installation/setup (if applicable)
   - Usage examples
   - API reference
   - Common pitfalls
```

**Prepare Commit**
`.claude/commands/commit.md`:
```markdown
Prepare a commit for the current changes:

1. Run `git diff --staged` to see staged changes
2. Run `git diff` to see unstaged changes
3. If there are unstaged changes worth including, stage them
4. Create a commit with a message following conventional commits:
   - type(scope): description
   - Types: feat, fix, docs, style, refactor, test, chore
5. Keep the first line under 50 characters
6. Add body explaining why, not what
```

## Model Context Protocol (MCP)

MCP is an open standard that connects Claude Code to external tools and data sources. Through MCP servers, Claude can query databases, access APIs, manage files, and interact with services—all within the conversation.

### How MCP Works

```mermaid
flowchart LR
    subgraph Claude["Claude Code"]
        CC["Claude Code"]
    end

    subgraph MCP["MCP Servers"]
        DB["Database<br/>Server"]
        GH["GitHub<br/>Server"]
        FS["Filesystem<br/>Server"]
        API["Custom API<br/>Server"]
    end

    subgraph External["External Services"]
        PG["PostgreSQL"]
        GHA["GitHub API"]
        Files["Local Files"]
        Svc["Your Service"]
    end

    CC <--> DB
    CC <--> GH
    CC <--> FS
    CC <--> API

    DB <--> PG
    GH <--> GHA
    FS <--> Files
    API <--> Svc

    style Claude fill:#3b82f6,color:#fff
    style MCP fill:#8b5cf6,color:#fff
    style External fill:#22c55e,color:#fff
```

Claude Code communicates with MCP servers, which in turn interact with external services. This architecture keeps Claude Code extensible without requiring direct integration code for every possible service.

### Installing MCP Servers

**Remote HTTP Server** (Recommended for cloud services):
```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

**Local Stdio Server** (For local tools):
```bash
claude mcp add --transport stdio airtable -- npx -y airtable-mcp-server
```

**With Environment Variables**:
```bash
claude mcp add --transport stdio db \
  --env DATABASE_URL=postgresql://localhost:5432/mydb \
  -- npx -y @bytebase/dbhub
```

### Managing MCP Servers

```bash
# List configured servers
claude mcp list

# Get details for a server
claude mcp get github

# Remove a server
claude mcp remove github

# Check status in Claude Code
/mcp
```

### MCP Scopes

| Scope | Storage | Use Case |
|-------|---------|----------|
| **Local** (default) | `~/.claude.json` per project | Personal dev servers |
| **Project** | `.mcp.json` in repo | Team-shared servers |
| **User** | `~/.claude.json` global | Cross-project tools |

**Project scope** is ideal for team collaboration:

```bash
claude mcp add --transport http sentry --scope project https://mcp.sentry.dev/mcp
```

This creates `.mcp.json` that can be committed:

```json
{
  "mcpServers": {
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    }
  }
}
```

### Popular MCP Integrations

**GitHub**
```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

Use cases:
- "Review PR #456 and suggest improvements"
- "Create an issue for the bug we found"
- "Show me all open PRs assigned to me"

**PostgreSQL Database**
```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://user:pass@localhost:5432/mydb"
```

Use cases:
- "What's our total revenue this month?"
- "Show me the schema for the users table"
- "Find customers who haven't ordered in 90 days"

**Sentry Error Monitoring**
```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

Use cases:
- "What are the most common errors today?"
- "Show the stack trace for error ABC123"
- "Which deployment introduced these new errors?"

**Filesystem**
```bash
claude mcp add --transport stdio filesystem -- npx -y @modelcontextprotocol/server-filesystem
```

Use cases:
- "Watch for changes in the src directory"
- "List all TypeScript files modified today"

### Authentication

Many MCP servers require authentication. After adding a server:

```
/mcp
```

Select the server and follow browser-based OAuth flow if required.

For API key authentication:
```bash
claude mcp add --transport http api https://api.example.com/mcp \
  --header "Authorization: Bearer YOUR_API_KEY"
```

### Environment Variables in MCP Config

The `.mcp.json` file supports environment variable expansion:

```json
{
  "mcpServers": {
    "database": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub", "--dsn", "${DATABASE_URL}"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

Use `${VAR}` or `${VAR:-default}` syntax.

### MCP Resources

MCP servers can expose resources that you reference with `@` mentions:

```
Analyze @github:issue://123 and suggest a fix based on
@postgres:schema://users table structure.
```

Format: `@server:protocol://resource/path`

## Combining Commands and MCP

The real power emerges when custom commands leverage MCP integrations.

**Issue Analysis Command**
`.claude/commands/analyze-issue.md`:
```markdown
Analyze GitHub issue #$ARGUMENTS:

1. Use the GitHub MCP to fetch the issue details
2. Read the relevant code files mentioned in the issue
3. Check Sentry for any related errors
4. Query the database for affected user counts
5. Propose a fix with:
   - Root cause analysis
   - Implementation approach
   - Testing strategy
   - Rollback plan
```

**Database Migration Command**
`.claude/commands/migrate.md`:
```markdown
Create a database migration for: $ARGUMENTS

1. Query current schema using the database MCP
2. Design the migration (up and down)
3. Create the migration file
4. Generate tests for the migration
5. Document any data transformations needed
```

## Best Practices

### Command Design

- **Be specific**: Vague commands produce vague results
- **Include structure**: Numbered steps guide Claude's work
- **Specify output format**: Tell Claude exactly what you want
- **Reference context**: Use `$ARGUMENTS` effectively

### MCP Security

- **Use environment variables** for credentials
- **Limit scope** to what's needed
- **Audit server access** regularly
- **Use read-only connections** when possible

### Team Collaboration

- **Commit `.mcp.json`** for shared MCP configurations
- **Document custom commands** in team wiki
- **Standardize naming** across the team
- **Review permissions** before adding to project scope

## Summary

Extending Claude Code creates a customized development environment:

| Extension | Purpose | Location |
|-----------|---------|----------|
| **Custom Commands** | Reusable prompt templates | `.claude/commands/` |
| **MCP Servers** | External tool integration | `claude mcp add` |
| **MCP Resources** | Reference external data | `@server:resource` |

Key principles:

- **Automate repetition**: Create commands for frequent tasks
- **Connect your stack**: Integrate databases, APIs, and services
- **Share with team**: Commit project-scoped configurations
- **Keep it secure**: Use environment variables for credentials
- **Iterate on commands**: Refine based on what works

Claude Code's extensibility means it can adapt to any development workflow. Custom commands and MCP integrations transform it from a generic assistant into a specialized tool tailored to your project's unique needs.

## References

- [Claude Code MCP Documentation](https://code.claude.com/docs/en/mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Code Settings Documentation](https://code.claude.com/docs/en/settings)
