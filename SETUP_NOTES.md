# Development Environment Setup Notes

**Date:** 2026-05-01  
**Platform:** Windows 11 Enterprise (10.0.26200)  
**Shell:** PowerShell 5.1.26100.8115

---

## Installed Versions

| Tool            | Version    | Install Method        |
|-----------------|------------|-----------------------|
| Node.js (LTS)   | v24.15.0   | winget (OpenJS.NodeJS.LTS) |
| npm             | 11.12.1    | bundled with Node.js  |
| Bun             | 1.3.13     | winget (Oven-sh.Bun)  |
| Git for Windows | 2.54.0     | winget (Git.Git)      |
| Docker Desktop  | 4.71.0     | winget (Docker.DockerDesktop) |
| pnpm            | 10.33.2    | npm install -g pnpm   |

---

## Project Dependencies (via bun add)

| Package  | Version | Role                |
|----------|---------|---------------------|
| fastify  | 5.8.5   | HTTP API framework  |
| prisma   | 7.8.0   | ORM + migration CLI |
| dotenv   | 17.4.2  | Environment variable loader |

---

## Project Initialization

```bash
git init                  # initialized empty repo
bun init -y               # created package.json, index.ts, tsconfig.json, .gitignore
bun add fastify prisma dotenv
```

---

## Notes

- Docker Desktop was already present on this machine; winget upgraded it to 4.71.0.
- Bun PATH requires a new shell session to take effect after install.
- Prisma ships its own binary (`prisma`); run `bunx prisma init` to scaffold the schema.
- pnpm is available as an alternative package manager alongside bun.
