---
title: "Day 8: MCP Integration"
order: 8
---

# Day 8: MCP Integration

## What You'll Learn Today

- What MCP is
- Configuring MCP servers
- Using standard MCP servers
- Connecting custom MCP servers

---

## What is MCP?

MCP (Model Context Protocol) is a protocol that enables AI models to communicate with external tools and data sources. Kiro natively supports MCP, allowing integration with various external services.

```mermaid
flowchart TB
    subgraph Kiro["Kiro IDE"]
        A["AI Agent"]
    end

    subgraph MCP["MCP Servers"]
        B["Fetch Server"]
        C["Database Server"]
        D["API Server"]
        E["Custom Server"]
    end

    subgraph External["External Resources"]
        F["Web Pages"]
        G["Databases"]
        H["External APIs"]
        I["Internal Systems"]
    end

    A <--> B
    A <--> C
    A <--> D
    A <--> E

    B --> F
    C --> G
    D --> H
    E --> I

    style Kiro fill:#3b82f6,color:#fff
    style MCP fill:#8b5cf6,color:#fff
    style External fill:#22c55e,color:#fff
```

### What MCP Enables

| Feature | Description | Example |
|---------|-------------|---------|
| **External Data Fetch** | Retrieve web pages and docs | Reference latest documentation |
| **API Integration** | Call external APIs | GitHub, Jira, Slack integration |
| **Database Operations** | Execute DB queries | Check development DB |
| **Custom Tools** | Add proprietary tools | Internal system integration |

---

## Enabling MCP

### Step 1: Open Settings

1. Open settings with `Cmd + ,` (Mac) or `Ctrl + ,` (Windows/Linux)
2. Search for "MCP"
3. Enable MCP support

### Step 2: Verify in Kiro Panel

The "MCP" tab in Kiro panel shows configured servers.

```
MCP Servers
├── ● fetch (connected)
├── ○ github (disconnected)
└── ○ database (disconnected)
```

---

## MCP Configuration File

MCP server settings are saved in `.kiro/settings/mcp.json`.

```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "disabled": false
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      },
      "disabled": true
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      },
      "disabled": true
    }
  }
}
```

### Configuration Fields

| Field | Description |
|-------|-------------|
| `command` | Command to start the server |
| `args` | Command arguments |
| `env` | Environment variables (tokens, etc.) |
| `disabled` | Enable/disable server |

---

## Standard MCP Servers

Common MCP servers used with Kiro.

### 1. Fetch Server

Retrieves web page content.

```json
{
  "fetch": {
    "command": "uvx",
    "args": ["mcp-server-fetch"],
    "disabled": false
  }
}
```

**Usage example**:
```
Fetch the latest React 19 documentation and
summarize the new features.

#url:https://react.dev/blog/2024/12/05/react-19
```

### 2. GitHub Server

Performs GitHub repository operations.

```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
    }
  }
}
```

**Usage example**:
```
Check the latest issues on GitHub and
list the high-priority ones.
```

### 3. Filesystem Server

Operates on the filesystem (extends Kiro's standard features).

```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]
  }
}
```

### 4. Database Server

Executes database queries.

```json
{
  "postgres": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres"],
    "env": {
      "DATABASE_URL": "postgresql://user:pass@localhost:5432/mydb"
    }
  }
}
```

**Usage example**:
```
Check the structure of the users table and
retrieve the 10 most recently registered users.
```

---

## Using MCP Servers

### Using in Chat

Check available tools with the `#mcp` context provider.

```
#mcp Show available tools
```

### Direct Tool Invocation

Kiro automatically uses tools provided by MCP servers.

```
Get the official documentation about React's useFormStatus hook
and explain it.
```

Kiro automatically fetches the documentation using the fetch MCP server.

---

## Environment Variable Configuration

Manage sensitive information like API keys with environment variables.

### Method 1: Shell Environment Variables

```bash
# .bashrc or .zshrc
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
export DATABASE_URL="postgresql://..."
```

### Method 2: .env File

Create a `.env` file at project root:

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
```

> **Note**: Add `.env` file to `.gitignore`.

### Reference in MCP Config

```json
{
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
  }
}
```

Reference environment variables with `${VARIABLE_NAME}` format.

---

## Troubleshooting

### Checking MCP Logs

1. Open View > Output
2. Select "Kiro - MCP Logs" from dropdown

```
[MCP] Connecting to fetch server...
[MCP] fetch: Connected successfully
[MCP] github: Connection failed - Invalid token
```

### Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Connection failed | Missing prerequisites | Verify Node.js/Python installation |
| Auth error | Invalid token | Verify API key/token |
| Tool not responding | Server disabled | Set `disabled: false` |
| Config not loading | JSON syntax error | Check JSON syntax |

### Connection Test

```
#mcp

Can you connect to the fetch server?
Test by fetching https://example.com.
```

---

## Practical Examples

### Example 1: Implement While Referencing Documentation

```
#mcp

Reference the latest Prisma documentation and
create a user table migration.
Follow official best practices.
```

### Example 2: Check GitHub Issues

```
#mcp

Check unresolved GitHub issues and
list those with the "bug" label.
Sort by priority.
```

### Example 3: Analyze Database Structure

```
#mcp

Get the database schema and
generate an ER diagram in Mermaid format.
```

---

## Remote MCP Servers

Kiro also supports remote (HTTP/SSE) MCP servers.

```json
{
  "remote-server": {
    "url": "https://mcp.example.com/sse",
    "headers": {
      "Authorization": "Bearer ${API_TOKEN}"
    }
  }
}
```

### Benefits of Remote Servers

- No local installation needed
- Shareable across team
- Centrally managed tools

---

## Creating MCP Servers

You can create your own MCP servers.

### Basic Structure (TypeScript)

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: 'my-custom-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Define tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'my_tool',
      description: 'My custom tool description',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The query' }
        },
        required: ['query']
      }
    }
  ]
}));

// Implement tools
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'my_tool') {
    const query = request.params.arguments.query;
    // Tool logic
    return { content: [{ type: 'text', text: `Result for: ${query}` }] };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## Summary

| Concept | Description |
|---------|-------------|
| **MCP** | Protocol for AI to communicate with external tools |
| **MCP Server** | Server providing specific functionality |
| **Fetch** | Web content retrieval |
| **GitHub** | Repository operations |
| **Database** | DB query execution |

### Key Points

1. **Extend Kiro's capabilities with MCP**
2. **Manage sensitive info with environment variables**
3. **Standard servers cover many use cases**
4. **Create custom servers as needed**

---

## Exercises

### Exercise 1: Basics

Enable the Fetch MCP server and retrieve any web page to summarize its content.

### Exercise 2: Applied

Configure the GitHub MCP server and execute:
1. Set personal access token in environment variable
2. Enable GitHub server in MCP config
3. Get issue list for a specific repository

### Challenge

Configure PostgreSQL MCP server and execute:
1. Connect to local PostgreSQL
2. Get table list
3. Display a specific table's structure as Mermaid ER diagram

---

## References

- [Kiro MCP Documentation](https://kiro.dev/docs/mcp/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/introduction)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)

---

**Coming Up**: In Day 9, we'll learn "Using Powers." Master adding domain expertise with one click using Powers.
