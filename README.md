# My Blog

AI 기반 MDX 블로그를 위한 Next.js 16/React 19 템플릿입니다. 벡터 검색과 Supabase/NextAuth 연동을 염두에 두고 설계했습니다.

## 진행 현황
- [x] Next.js 16 + React 19 + TypeScript 부트스트랩
- [x] Tailwind CSS v4 테마 및 글래스 효과 UI (헤더/푸터/히어로)
- [x] MDX 포스트 디렉터리 및 파서 (`content/posts`, `src/lib/mdx.ts`)
- [ ] 포스트 목록/상세 라우팅 및 MDX 렌더링 페이지
- [ ] NextAuth 프로바이더 연결 및 인증 UI 동작 (현재 providers 비어 있음)
- [ ] Supabase/PostgreSQL 연결 및 Drizzle 마이그레이션 적용 (`DATABASE_URL` 필요)
- [ ] AI 임베딩 생성과 벡터 검색 API/페이지 통합 (`generateEmbedding` 미사용)
- [ ] 검색 페이지 및 헤더 검색 버튼 동작

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
