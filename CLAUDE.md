# Synapse

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- **Dev server**: `npm run dev` (runs on http://localhost:3000)
- **Build**: `npm run build`
- **Production server**: `npm run start`
- **Lint**: `npm run lint`

**IMPORTANT:** Do not add Claude to any commit messages

## Neon MCP

- **Project:** `synapse` (project ID `rapid-breeze-30098566`)
- **Default branch to use:** `development` (branch ID `br-purple-recipe-axxd582k`)
- Always pass this project and branch to Neon MCP tools unless told otherwise.
- **NEVER** run queries or migrations against the `production` branch (`br-polished-cherry-ax1c090i`) unless the user explicitly says "production."
- Never run destructive SQL (`DROP`, `DELETE`, `TRUNCATE`, unscoped `UPDATE`) without asking first, even on `development`.
