# My Blog

Next.js 16/React 19 프런트엔드 템플릿입니다. 외부 REST 백엔드에 연결해 포스트/커뮤니티 글, 검색, 댓글을 불러오고 Novel 기반 에디터로 글을 작성합니다.

## 주요 기능
- `/posts`, `/posts/[slug]`, `/community` 라우트에서 API 기반 리스트/상세 조회
- Novel 에디터가 포함된 `/write`, `/community/write` 글쓰기 화면 (POST/PATCH/DELETE `/api/v1/posts`)
- 댓글 작성/수정/삭제 UI (`/api/v1/comments`)
- 실시간 검색 패널 (`/api/v1/search`) with fallback 메시지 처리
- Tailwind CSS v4 + shadcn 스타일 컴포넌트, 글래스 느낌의 UI
- `NEXT_PUBLIC_API_BASE_URL`로 백엔드 엔드포인트 교체 가능 (기본값: `https://gc-board-latest-1.onrender.com`)

## 빠른 시작
1) 의존성 설치: `npm install`  
2) 환경 설정: `.env.example`을 `.env.local`로 복사 후 API 기본 URL이 필요하면 수정  
3) 개발 서버: `npm run dev` (http://localhost:3000)

## 환경 변수
- `NEXT_PUBLIC_API_BASE_URL` — 옵션. 커스텀 백엔드 베이스 URL (끝의 `/` 없이). 미지정 시 기본값을 사용합니다.

## 프로젝트 구조
- `public/` — 정적 자산
- `src/app/` — 앱 라우트 (`/`, `/posts`, `/posts/[slug]`, `/community`, `/community/write`, `/write`, `/search`)
- `src/components/` — 레이아웃, 검색/댓글 UI, shadcn 기반 컴포넌트
- `src/lib/` — API 클라이언트(`api-client.ts`), 포스트 fetch 유틸(`posts.ts`), 유틸 함수(`utils.ts`)
- `src/types/` — 공유 타입 정의

## 백엔드 기대치
프런트는 쿠키 포함 요청(`credentials: "include"`)으로 다음 엔드포인트를 호출합니다.
- `GET /api/v1/posts?page=&pageSize=` (커뮤니티는 `type=community` 쿼리 사용)
- `GET /api/v1/posts/{slug}`
- `POST /api/v1/posts` / `PATCH /api/v1/posts/{slug}` / `DELETE /api/v1/posts/{slug}`
- `GET /api/v1/comments?postId=` / `POST /api/v1/comments` / `PATCH /api/v1/comments/{id}` / `DELETE /api/v1/comments/{id}`
- `GET /api/v1/search?q=`

## 유용한 스크립트
- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run start` — 빌드 결과 실행
- `npm run lint` — ESLint 검사
