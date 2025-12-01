# My Blog

AI 기반 MDX 블로그를 위한 Next.js 16/React 19 템플릿입니다. 벡터 검색과 Supabase/NextAuth 연동을 염두에 두고 설계했습니다.

## 진행 현황
- [x] Next.js 16 + React 19 + TypeScript 부트스트랩
- [x] Tailwind CSS v4 테마 및 글래스 효과 UI (헤더/푸터/히어로)
- [x] MDX 포스트 디렉터리 및 파서 (`content/posts`, `src/lib/mdx.ts`)
- [x] 포스트 목록/상세 라우팅 및 MDX 렌더링 페이지
- [x] NextAuth 프로바이더 연결 및 인증 UI 동작 (현재 providers 비어 있음)
- [x] Supabase/PostgreSQL 연결 및 Drizzle 마이그레이션 적용 (`DATABASE_URL` 필요)
- [x] AI 임베딩 생성과 벡터 검색 API/페이지 통합 (`generateEmbedding` 미사용)
- [x] 검색 페이지 및 헤더 검색 버튼 동작

## 기술 스택
- Next.js 16, React 19, TypeScript
- Tailwind CSS v4, tw-animate-css, shadcn/ui 스타일 컴포넌트
- Drizzle ORM + PostgreSQL (pgvector) 스키마
- NextAuth + Drizzle Adapter (프로바이더 미구현)
- Supabase 클라이언트 (`supabase-js`)
- transformers.js 기반 로컬 임베딩 생성
- Lucide Icons, Radix UI, class-variance-authority, tailwind-merge

## 폴더 구조
```
my-blog/
├─ content/posts/           # MDX 포스트 원본
├─ public/                  # 정적 자산
├─ src/
│  ├─ app/                  # 라우트, 레이아웃, API 핸들러
│  ├─ components/           # 레이아웃/공용 UI 컴포넌트
│  ├─ db/                   # Drizzle 스키마
│  └─ lib/                  # MDX/AI/DB/Supabase 유틸
├─ drizzle.config.ts        # Drizzle CLI 설정
├─ package.json
└─ .env.example
```

## 환경 변수
`.env.example`을 `.env.local`로 복사 후 채워주세요.
- `DATABASE_URL` — Supabase/Postgres 연결 문자열
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase 익명 키
- `AUTH_SECRET` — `npx auth secret` 등으로 생성
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` — GitHub OAuth 앱 자격 증명
- `POST_SYNC_TOKEN` — `/api/posts/sync` 보호용 토큰(선택)

## 설치 및 실행
1. 의존성 설치: `npm install`
2. 환경 변수 설정: `cp .env.example .env.local` 후 값 채우기
3. 개발 서버: `npm run dev` (http://localhost:3000)

## 추가 작업 메모
- Drizzle: 스키마 수정 후 `npx drizzle-kit generate` → `npx drizzle-kit push` 로 DB에 반영하세요.
- 인증: `src/auth.ts`의 `providers` 배열에 OAuth/Email 등을 추가하고 UI 버튼과 연결하세요.
- 검색/AI: `src/lib/ai.ts` 임베딩 생성 결과를 `posts.embedding` 컬럼에 저장하고, 벡터 검색 쿼리를 구현해야 합니다.
- 라우팅: `/posts`, `/posts/[slug]`, `/search` 페이지를 추가해 MDX 렌더링과 검색 UI를 완성하세요.
- 배포: Vercel/Cloudflare Pages 등에 연결 시 빌드 커맨드 `npm run build`, 출력 `/.next`입니다.

## 새로운 기능

### MDX 라우팅
- `/posts`에서 모든 MDX 포스트를 카드 형태로 확인할 수 있습니다.
- `/posts/[slug]`는 `next-mdx-remote/rsc`를 사용해 MDX 본문을 서버 컴포넌트로 렌더링합니다.
- `src/lib/mdx.ts`가 frontmatter + 요약을 추출하며, `getAllPostsWithContent()`는 DB 동기화나 검색 등에 재사용됩니다.

### 인증
- `src/auth.ts`가 GitHub OAuth + Drizzle Adapter를 사용하는 NextAuth 5 구성을 제공합니다.
- 헤더는 서버 컴포넌트에서 `auth()`로 세션을 읽고, 서버 액션 기반의 Sign in/out 버튼을 노출합니다.

### Supabase + Drizzle 동기화
- `src/lib/post-sync.ts`의 `syncPostsToDatabase()`가 MDX 파일을 읽어 Supabase/Postgres `post` 테이블에 upsert 하고, 로컬 임베딩을 함께 저장합니다.
- `POST /api/posts/sync` (헤더 `x-sync-token: ${POST_SYNC_TOKEN}`)으로 동기화를 트리거할 수 있습니다.
  ```bash
  curl -X POST http://localhost:3000/api/posts/sync \
    -H "x-sync-token: $POST_SYNC_TOKEN"
  ```

### 벡터 검색
- `/api/search?q=your+query`는 `generateEmbedding`으로 쿼리 임베딩을 만들고, pgvector `<=>` 거리로 Supabase에 저장된 포스트를 랭킹합니다.
- DB에 임베딩이 없거나 오류가 나면 자동으로 MDX 파일 기반의 레거시 키워드 검색으로 폴백합니다.
- `/search` 페이지와 헤더의 검색 버튼이 동일한 클라이언트 패널을 공유하여 실시간 검색 경험을 제공합니다.

## Vercel 자동 배포 설정

프로젝트 루트에는 `vercel.json`과 GitHub Actions 워크플로우(`.github/workflows/vercel-deploy.yml`)가 포함되어 있어 Vercel과 연동하면 `main` 브랜치에 push 될 때마다 자동으로 프로덕션에 배포됩니다.

1. **Vercel 프로젝트 생성 및 GitHub 연결**
   - `vercel new` 또는 대시보드에서 GitHub 저장소를 Import합니다.
   - `vercel.json` 덕분에 빌드(`npm run build`)와 출력(`.next`)은 자동으로 인식됩니다.

2. **환경 변수 시크릿 등록**
   - Vercel에서 아래와 같이 시크릿을 만들어 `vercel.json`의 별칭과 연결합니다. CLI 예시:
     ```bash
     vercel env add ai_blog_database_url production    # DATABASE_URL
     vercel env add ai_blog_supabase_url production    # NEXT_PUBLIC_SUPABASE_URL
     vercel env add ai_blog_supabase_anon_key production
     vercel env add ai_blog_auth_secret production
     vercel env add ai_blog_github_client_id production
     vercel env add ai_blog_github_client_secret production
     vercel env add ai_blog_post_sync_token production
     ```
   - Preview/Development 환경도 동일하게 추가해두면 Preview 배포에서도 정상 동작합니다.

3. **GitHub Secrets 세팅**
   - Vercel 대시보드에서 `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`를 확인하고, Personal Access Token(`vercel token`)을 생성합니다.
   - GitHub 저장소에 아래 시크릿을 등록합니다.
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID`
     - `VERCEL_TOKEN`

4. **자동 배포**
   - 이제 `main` 브랜치로 push 하면 `Deploy to Vercel` 워크플로우가 `vercel pull → vercel build → vercel deploy --prod` 순서로 실행되어 최신 빌드를 배포합니다.
   - 필요 시 `workflow_dispatch`로 수동 실행도 가능합니다.

배포 후에는 `/api/posts/sync`를 호출해 MDX 콘텐츠를 DB에 업로드하고, `/search` 페이지에서 벡터 검색이 작동하는지 확인하세요.
