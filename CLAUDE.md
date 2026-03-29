# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands should be run from the `blossom/` subdirectory (the Next.js app root):

```bash
cd blossom

npm run dev       # Start dev server with Turbopack at http://localhost:3000
npm run build     # Production build
npm run lint      # ESLint
```

There are no tests configured in this project.

## Architecture

**Blossom** is a competitive programming judge platform where users solve Java problems through a browser-based editor. The app uses Next.js 15 App Router with Server Actions.

### Routing

```
/ → redirect to /portal
/portal      — Login/Register (public). Toggle via ?register=true query param
/dashboard   — User dashboard (protected)
/editor      — Code editor (protected). Problem loaded via ?id=<problemId>
```

Route protection is handled in `middleware.ts` using JWT session cookies.

### Auth Flow

- Sessions: JWT-based via `jose`, stored in cookies, 7-day expiry (`src/app/lib/session.ts`)
- Login/signup are Server Actions in `src/app/actions/auth.ts`
- Registration requires an access code that controls user permissions
- `UserPermissions` enum in `src/app/lib/definitions.ts`: `UPLOAD_PROBLEMS (0)`, `ADMINISTRATOR (1)`, `MANAGEMENT_ACCESS (3)`
- `src/app/lib/dal.ts` — cached `verifySession()` used in protected server components

### Editor Flow

The editor page (`src/app/editor/page.tsx`) loads a problem by ID from search params. It:
1. Fetches saved code from Vercel Blob (falls back to starter Java template)
2. Auto-saves code every 500ms to Vercel Blob
3. Submits code to **Judge0 API** for Java compilation and execution

Server Actions in `src/app/actions/editor.ts`:
- `saveCode()` / `getSavedCode()` — Vercel Blob storage
- `getTestcaseInput()` / `getTestcaseOutput()` — reads from `data/<problemId>/sample.in|out`
- `submitTestcase()` / `submitCustomTestcase()` — sends base64-encoded code to Judge0, returns `stdout`, `stderr`, `compile_output`, `status`

### Key Components

- `src/components/container.tsx` — Resizable panel layout: Monaco editor (left) + PDF problem statement + output tabs (right)
- `src/components/topbar.tsx` — File menu (open/save) and Run menu (sample/custom testcase)
- `src/components/widgets.tsx` — Tabbed output panel (input, output, compilation, error) using Monaco editors
- `src/components/ui/` — shadcn/ui components (new-york style, neutral base, lucide icons)

### Data Layout

```
blossom/data/<problemId>/
  sample.in         # Sample test case input
  sample.out        # Sample test case output
  submissions/      # Per-user submitted code files

blossom/public/problem_statements/
  <problemId>.pdf   # Problem statement PDFs
```

### Environment Variables

Required at runtime (not committed):
- Database connection string (PostgreSQL via `postgres` npm package)
- JWT secret key
- Vercel Blob token
- Judge0 API credentials

### Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Database:** PostgreSQL (direct via `postgres` npm package, no ORM)
- **Auth:** `jose` (JWT) + `bcrypt`
- **Editor:** `@monaco-editor/react`
- **UI:** shadcn/ui + Tailwind CSS 4
- **File Storage:** Vercel Blob
- **Code Execution:** Judge0 API (Java only)
- **PDF Viewer:** `react-pdf`
- Path alias: `@/` → `src/`
