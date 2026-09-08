# Blogmate AI — Antigravity 작업 재개 안내

이 저장소는 **Blogmate AI**의 현재 작업본이다. 소상공인이 업체 정보를 한 번 등록하면, 브랜드의 실제 서비스·전문 지식·표현 기준을 반영한 네이버 블로그 초안을 만들 수 있도록 돕는 React + Express + tRPC SaaS다.

## 1. 저장소와 기준 버전

- GitHub 저장소: https://github.com/byj0675-cmd/naver-blog-draft-saas.git
- 기본 브랜치: `main`
- 현재 기준 체크포인트: `8419548a`
- 현재 서비스 미리보기: https://blogmateai-2hydauwx.manus.space
- 개발 서버: `http://localhost:3000`

작업을 시작하기 전에 반드시 현재 브랜치, 최근 커밋, 변경 파일을 확인한다.

```bash
git status
git log --oneline -10
git branch -avv
```

원격 변경을 가져올 때는 사용자가 보유한 작업을 덮어쓰지 않도록 먼저 `git status`와 `git diff`를 확인한다. 확인 없이 `reset --hard`, 강제 push, 파일 전체 덮어쓰기를 하지 않는다.

## 2. 기술 스택과 실행 명령

| 영역 | 현재 구성 |
|---|---|
| 프런트엔드 | React 19, Vite, Tailwind CSS 4, shadcn/ui, wouter |
| 서버 | Express 4, tRPC 11, TypeScript |
| 데이터베이스 | Drizzle ORM + MySQL/TiDB 계열 DB |
| 인증 | Manus OAuth 기반 세션, 카카오 OAuth 서버 흐름 |
| AI | DeepSeek 어댑터, JSON 응답 파싱·빈 응답 방어 포함 |
| 테스트 | Vitest |
| 배포 기준 | Manus WebDev 프로젝트 |

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
```

`pnpm dev`를 실행하면 기본적으로 `http://localhost:3000`에서 개발 서버가 열린다. 포트는 코드에 하드코딩하지 말고 `process.env.PORT` 또는 현재 템플릿 설정을 따른다.

## 3. 환경변수

`.env`와 실제 비밀값은 절대로 GitHub에 커밋하지 않는다. Antigravity에서는 `.env.example`을 참고용으로 만들고, 실제 값은 로컬 환경변수나 안전한 Secret Manager에 입력한다.

필수 또는 기능별 환경변수는 다음과 같다.

| 변수 | 용도 |
|---|---|
| `DATABASE_URL` | Drizzle/MySQL 데이터베이스 연결 |
| `JWT_SECRET` | 세션 쿠키 서명 |
| `OAUTH_SERVER_URL` | Manus OAuth 서버 |
| `VITE_APP_ID` | Manus OAuth 앱 식별자 |
| `KAKAO_REST_API_KEY` | 카카오 로그인 REST API 키 |
| `KAKAO_CLIENT_SECRET` | 카카오 로그인 Client Secret, 사용하는 경우 |
| `KAKAO_REDIRECT_URI` | 카카오 OAuth callback 주소 |
| `DEEPSEEK_API_KEY` | DeepSeek API 인증 |
| `DEEPSEEK_MODEL` | DeepSeek 모델 선택 |
| `DEEPSEEK_BASE_URL` | DeepSeek API base URL, 별도 설정 시 |
| `TEXT_AI_PROVIDER` | 텍스트 AI provider 선택 |
| `BUILT_IN_FORGE_API_URL` | Manus 내장 API 주소 |
| `BUILT_IN_FORGE_API_KEY` | Manus 내장 API 서버 키 |
| `OWNER_OPEN_ID` | 소유자 식별자와 관리자 초기 설정 |

운영 환경의 카카오 callback 주소와 도메인이 다르면 Kakao Developers와 서버 환경변수의 값이 모두 일치해야 한다.

## 4. 핵심 파일 구조

| 파일 | 역할 |
|---|---|
| `client/src/pages/Home.tsx` | 대시보드, 브랜드 등록/온보딩, 초안 생성, 제목 후보 선택, 초안 저장 UI |
| `client/src/pages/Landing.tsx` | 소상공인의 시간·스트레스 문제를 소구하는 랜딩페이지 |
| `client/src/pages/Privacy.tsx` | 개인정보 처리방침 |
| `client/src/components/DashboardLayout.tsx` | 로그인 후 사이드바·헤더·업무 도구 레이아웃 |
| `client/src/components/AdminPayments.tsx` | 관리자 운영 센터와 수동 결제 요청 처리 |
| `client/src/index.css` | 전역 색상·타이포그래피·기본 스타일 |
| `server/routers.ts` | tRPC 인증·브랜드·콘텐츠·사용량·결제 절차 |
| `server/db.ts` | 브랜드·초안·사용량·결제 DB helper |
| `drizzle/schema.ts` | MySQL/TiDB 스키마 |
| `shared/brandBrief.ts` | 하이브리드 `briefJson` 타입·파서·serializer |
| `server/aiProvider.ts` | DeepSeek 선택형 adapter와 JSON 응답 처리 |
| `server/_core/context.ts` | 현재 사용자와 요청 context 구성 |
| `docs/brand-brief-and-roadmap.md` | 브랜드 브리프 구조와 다음 마일스톤 |
| `docs/small-business-onboarding-design.md` | 모바일 온보딩 화면·데이터 설계 |

## 5. 이미 구현된 기능

현재 구현을 다시 만들거나 삭제하지 않는다. 다음 기능은 기존 계약을 보존하면서 확장한다.

첫째, 브랜드별 월 12건 생성 제한과 초안별 재생성 제한이 있다. 한 브랜드의 사용량은 다른 브랜드와 합산하지 않는다.

둘째, `brandProfiles.briefJson`은 기존 문자열형 데이터와 호환되면서 `services`, `expertise`, `faqs`, `verifiedFacts`, `sourceLinks`를 담을 수 있는 하이브리드 JSON 구조다.

셋째, `brands.get`과 `brands.update`가 있으며, `content.generate`는 가능한 경우 `brandId` 기준으로 서버에서 최신 브랜드 정보를 조회해 생성 프롬프트에 반영한다.

넷째, 생성 결과는 제목 후보 3개를 제공하고 사용자가 하나를 선택해 제목 필드에 적용할 수 있다. 생성된 초안은 화면에서 수정·복사하고 초안 이력으로 저장할 수 있다.

다섯째, 카카오 OAuth 시작·callback·사용자 upsert·세션 발급 흐름과 수동 결제의 신청·청구서 발송 기록·수납 확인·관리자 승인·구독 활성화 흐름이 있다.

## 6. 디자인 기준 — 임의로 새 디자인을 만들지 않는다

Blogmate AI의 기준 디자인은 **AI 데모가 아니라 소상공인이 매일 사용하는 차분한 업무 도구**다.

| 항목 | 기준 |
|---|---|
| 배경 | 밝은 아이보리·화이트 |
| 기본 텍스트 | 짙은 네이비 |
| 포인트 | 코랄 오렌지 |
| 레이아웃 | 데스크톱은 왼쪽 고정 사이드바, 콘텐츠 중심 대시보드 |
| 카드 | 흰색 카드, 얇은 베이지 테두리, 부드러운 모서리 |
| 문체 | 한국어 업무 도구 톤, 과장된 AI 표현 최소화 |
| 모바일 | 390px 기준 한 손 입력, 하단 시트 또는 전체 화면형 단계 UI |
| 랜딩 | 공감 → 시간 손실 → 해결책 → 가격·신청의 흐름 |

기능을 추가하기 전에 `Home.tsx`, `Landing.tsx`, `index.css`, `DashboardLayout.tsx`를 먼저 읽는다. 새 색상 체계, 새 폰트, 새 사이드바, 임의의 다크 테마, 과도한 그라데이션을 추가하지 않는다. 기존 컴포넌트와 shadcn/ui를 우선 재사용한다.

## 7. 안전한 작업 순서

작업 전에는 먼저 다음 내용을 보고한다.

```text
현재 상태:
- 기준 커밋:
- 변경 대상 파일:
- 보존해야 할 API·데이터 구조:
- 데스크톱·모바일 화면 변화:
- 테스트 계획:
```

그다음 작은 단위로 구현한다. 서버 계약을 바꾸면 관련 Vitest를 먼저 업데이트하고, 스키마 변경은 `drizzle/schema.ts`를 수정한 뒤 생성된 SQL을 검토하고 적용한다. 사용량·결제·권한처럼 중요한 로직은 클라이언트가 아니라 서버에서 검증한다.

작업 후에는 다음을 실행한다.

```bash
pnpm check
pnpm test
pnpm build
```

UI 변경은 1280×720 데스크톱과 390×844 모바일에서 확인한다. 기능 변경과 디자인 변경은 가능한 한 별도 커밋으로 나눈다.

## 8. 바로 이어서 구현할 우선순위

현재 다음 마일스톤을 우선순위로 둔다.

| 순서 | 작업 | 완료 기준 |
|---|---|---|
| 1 | 브랜드 브리프 편집 화면 고도화 | 저장된 업체 지식·서비스·FAQ를 다시 열어 수정 가능 |
| 2 | 생성 이력 조회 화면 | 저장된 초안을 목록·상세에서 다시 열고 복사 가능 |
| 3 | URL 분석과 선택적 웹 리서치 | 사용자가 선택한 URL·검색 자료와 출처가 초안에 표시됨 |
| 4 | SEO/AEO 기준 관리 | 기준일·출처·적용 항목을 관리하고 생성 프롬프트에 반영 |
| 5 | 실제 카카오 계정·결제 운영 테스트 | 개발/운영 callback, 관리자 승인, 만료일을 실제 환경에서 확인 |

## 9. Antigravity에 처음 붙여넣을 작업 지시문

다음 문장을 그대로 사용한다.

```text
이 저장소는 Blogmate AI 소상공인용 네이버 블로그 초안 생성 SaaS다.
먼저 ANTIGRAVITY.md, README.md, docs/brand-brief-and-roadmap.md,
docs/small-business-onboarding-design.md, client/src/pages/Home.tsx,
client/src/pages/Landing.tsx, client/src/index.css,
client/src/components/DashboardLayout.tsx, server/routers.ts,
shared/brandBrief.ts를 읽어라.

현재 디자인을 새로 리디자인하지 말고 기존 Blogmate AI 디자인을 보존하라.
밝은 아이보리·화이트 배경, 짙은 네이비 텍스트, 코랄 오렌지 포인트,
왼쪽 사이드바형 업무 도구 레이아웃, 한국어 업무 문체를 유지하라.

작업 전 반드시 현재 git status, 최근 커밋, 수정 대상 파일, 보존할 API 계약을 요약하라.
사용자가 요청한 기능만 수정하고, 기존 brandProfiles.briefJson,
brands.get/update, content.generate, 브랜드별 월 12건 제한,
제목 후보 3개, 카카오 OAuth, 수동 결제 승인 흐름을 깨뜨리지 마라.

작업 후 pnpm check && pnpm test && pnpm build를 실행하고,
1280x720 데스크톱과 390x844 모바일 결과를 확인하라.
수정 전 파일을 임의로 덮어쓰거나 git reset --hard와 강제 push를 사용하지 마라.
``` 

## 10. 브랜치와 커밋 규칙

기능별 브랜치를 사용한다.

```bash
git checkout -b feature/<short-name>
# 작업
pnpm check && pnpm test && pnpm build
git add <변경파일>
git commit -m "feat: <기능 설명>"
git push -u origin feature/<short-name>
```

`main`에 직접 강제 push하지 않는다. Antigravity에서 작업한 결과는 먼저 브랜치로 올리고, 변경 요약·검증 결과·스크린샷을 확인한 뒤 merge한다.

## 11. 주의사항

`KAKAO_REST_API_KEY`, `DEEPSEEK_API_KEY`, `DATABASE_URL`, `JWT_SECRET`, Manus API 키를 소스 코드에 직접 넣지 않는다. 실제 고객 리뷰·평점·추천사를 만들어 넣지 않는다. 네이버 자동 발행을 구현한다고 가정하지 말고 고객이 검수 후 직접 발행하는 흐름을 유지한다. 외부 웹 자료를 사용하면 업체가 제공한 사실과 검색 참고 자료를 구분하고 출처를 저장한다.

이 파일은 Antigravity가 저장소를 처음 열었을 때 읽어야 하는 프로젝트 작업 규칙이다.
