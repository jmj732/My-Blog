# Repository Guidelines

## Project Structure & Module Organization
- Frontend is Next.js/React with TypeScript. Main entry: `src/app` (routes: `/`, `/posts`, `/community`, `/write`, etc.).
- Shared UI and layout: `src/components` (e.g., `layout/header.tsx`, shadcn-style components under `components/ui`).
- API utilities and types: `src/lib` (`api-client.ts`, `posts.ts`) and `src/types`.
- Assets and public files: `public/`. Configs at repo root (`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `vercel.json`).

## Build, Test, and Development Commands
- `npm run dev` — start local dev server (http://localhost:3000).
- `npm run build` — production build for deployment.
- `npm run start` — run the built app.
- `npm run lint` — ESLint check; fix issues before PRs.

## Coding Style & Naming Conventions
- TypeScript with Next.js/React server & client components. Prefer functional components and hooks.
- Follow ESLint config in `eslint.config.mjs`; run `npm run lint` to verify.
- Tailwind CSS v4 utility-first styling; keep classNames concise and consistent with existing patterns.
- Filenames: kebab-case for components (`header.tsx`), PascalCase for component exports, camelCase for variables/functions.
- Keep components self-contained; extract shared UI into `src/components/ui` when reused.

## Testing Guidelines
- No dedicated test suite is present. If adding tests, colocate with source (`*.test.tsx/ts`) and ensure they run via a future `npm test` hook.
- Add minimal integration or unit tests for data-fetching utilities (`src/lib`) and complex components when introducing new logic.

## Commit & Pull Request Guidelines
- Commit messages: imperative, concise (e.g., `Add auth badge in header`). Group related changes per commit when possible.
- 커밋 작성: 파일별로 변경사항을 한국어 한 줄 요약으로 명확히 작성합니다 (예: `헤더: 로그인 사용자 배지 표시 추가`).
- Pull requests should include: summary of changes, rationale, screenshots/GIFs for UI updates, and steps to verify (commands run such as `npm run lint`).
- Reference related issues when available. Keep diffs focused; avoid unrelated formatting churn.

## Security & Configuration Tips
- Backend API base URL: `NEXT_PUBLIC_API_BASE_URL` (default points to `https://gc-board-latest-1.onrender.com`); avoid trailing slash.
- Auth relies on backend session cookies (`credentials: "include"` in fetch). Ensure deployment domains allow `SameSite=None; Secure` cookies and matching CORS settings.
- Do not commit secrets; use `.env.local` for local overrides.***
