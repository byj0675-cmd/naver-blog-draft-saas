# Blogmate AI 브랜드 브리프 구현 구조와 다음 마일스톤

작성 기준 커밋: `7bf9b2d feat: expand brand brief registration`  
저장소: [byj0675-cmd/naver-blog-draft-saas](https://github.com/byj0675-cmd/naver-blog-draft-saas)

## 1. 현재 구현의 역할

브랜드 브리프는 단순히 업종과 서비스명만 저장하는 기능이 아니라, 초안 생성 시 사실관계와 표현 방향을 고정하기 위한 **사업자별 콘텐츠 기준서**입니다. 지역, 가격, 고객 질문, 핵심 키워드, 반드시 사용할 사실, 사용하지 않을 표현과 말투를 한 묶음으로 관리합니다.

현재 커밋에서는 브리프 입력 UI와 저장 계약, 데이터베이스 컬럼, 생성 프롬프트에 브리프를 포함하는 기본 연결까지 구현되어 있습니다. 다만 생성 화면은 아직 선택한 브랜드의 저장된 브리프를 직접 조회해 전달하지 않고 예시 브랜드 값을 일부 사용하고 있으며, 제목 후보 3개 반환과 후보 선택 UI는 다음 마일스톤에서 완성해야 합니다. 따라서 현재 상태는 **브리프 입력·저장 기반을 마련한 단계**이지, 브리프 기반 생성 흐름이 최종 완료된 상태는 아닙니다.

## 2. 주요 파일 구조

| 영역 | 파일 | 역할 |
|---|---|---|
| 공통 데이터 모델 | `shared/brandBrief.ts` | `BrandBrief` 타입, 빈 기본값 `emptyBrandBrief`, 안전한 JSON 파서 `parseBrandBrief`를 정의합니다. |
| 데이터베이스 스키마 | `drizzle/schema.ts` | `brandProfiles.briefJson` 텍스트 컬럼을 추가하고 브랜드 레코드 타입을 갱신합니다. |
| DB 마이그레이션 | `drizzle/0008_wooden_killraven.sql`, `drizzle/meta/0008_snapshot.json`, `drizzle/meta/_journal.json` | 기존 브랜드 테이블에 브리프 저장 컬럼을 반영하는 마이그레이션 기록입니다. |
| DB 접근 계층 | `server/db.ts` | `createBrandProfile` 등 브랜드 저장·조회 helper를 제공합니다. 브리프는 DB에서 JSON 문자열로 저장됩니다. |
| tRPC 서버 계약 | `server/routers.ts` | 브리프 입력 검증, 브랜드 생성, 콘텐츠 생성 프롬프트 전달, 기존 톤 분석·초안 저장 절차를 정의합니다. |
| 브랜드 등록 UI | `client/src/pages/Home.tsx` | `BrandCreateDialog`에서 기본 정보와 상세 브리프를 입력받고 `brands.create`를 호출합니다. 성공하면 브랜드 목록 query를 무효화합니다. |
| 생성 UI | `client/src/pages/Home.tsx` | `Generate`에서 브랜드·키워드·목적·분량을 입력하고 `content.generate`를 호출합니다. 현재는 선택 브랜드의 저장 브리프 조회와 제목 후보 UI가 후속 작업입니다. |
| 품질 규칙 | `shared/seo.ts`, `docs/naver-seo-guidelines.md` | 키워드 반복, 문단 가독성, 검색 의도와 독자 중심 작성 기준을 점검하는 기반입니다. |
| 회귀 테스트 | `server/brand.create.test.ts`, `server/brand.ui-wiring.test.ts` | 인증 사용자로 저장되는지, 등록 다이얼로그·목록 갱신 연결이 유지되는지 검증합니다. |
| 작업 기록 | `todo.md` | 상세 브리프, 제목 후보, SEO 생성 개선의 미완료 항목을 추적합니다. |

## 3. 상세 브리프 필드

`BrandBrief`는 현재 다음 15개 문자열 필드로 구성됩니다.

| 분류 | 필드 | 생성 시 활용 목적 |
|---|---|---|
| 운영 정보 | `location`, `address`, `phone`, `website`, `businessHours` | 지역 검색 의도, 방문 전환 정보, 영업 안내를 사실 기반으로 작성합니다. |
| 상품 정보 | `priceInfo`, `uniquePoints` | 가격·포함 사항·차별점을 임의로 만들지 않고 구체적으로 설명합니다. |
| 브랜드 맥락 | `brandStory`, `toneNotes`, `callToAction` | 브랜드 배경, 말투, 글의 마무리 행동 유도를 일관되게 반영합니다. |
| 검색어 | `primaryKeywords`, `secondaryKeywords` | 핵심 키워드와 연관 키워드를 제목·도입부·본문·해시태그 계획에 활용합니다. |
| 고객 관점 | `customerQuestions` | 고객이 실제로 궁금해하는 내용을 본문 구조에 반영합니다. |
| 사실성 통제 | `factsToUse`, `forbiddenClaims` | 확인된 사실만 사용하고 과장·근거 없는 최상급 표현을 피하도록 합니다. |

입력값은 모두 선택 사항이며, 브랜드명만 현재 필수입니다. 이 구조는 초기 MVP에서 빈 항목을 허용해 등록 장벽을 낮추되, 입력된 항목이 많을수록 생성 품질과 사실성이 높아지는 방식입니다.

## 4. API와 호출 흐름

이 프로젝트는 별도 REST 경로를 직접 노출하기보다 tRPC 라우터를 사용합니다. 브라우저의 호출 기준 경로는 `/api/trpc`이며, 프론트엔드는 `trpc.*` 훅을 통해 타입 안전하게 호출합니다.

### 4.1 `brands.list`

`protectedProcedure` query입니다. 로그인한 사용자의 브랜드 목록을 반환합니다.

```ts
trpc.brands.list.useQuery(undefined, { retry: false })
```

서버에서는 `listBrandProfiles(ctx.user.id)`를 호출하므로 사용자는 자신의 브랜드만 조회합니다. 현재 `Brands`와 `Generate` 화면이 모두 이 목록을 사용합니다.

### 4.2 `brands.create`

`protectedProcedure` mutation입니다. 브랜드 기본 정보와 상세 브리프를 검증한 뒤 인증 사용자 ID와 함께 저장합니다.

```ts
trpc.brands.create.useMutation().mutate({
  name: "오늘의공방",
  industry: "도자기 공방",
  services: "원데이클래스",
  audience: "성수동 데이트 고객",
  strengths: "초보자도 편안한 소규모 수업",
  brief: {
    location: "서울 성동구 성수동",
    priceInfo: "1인 55,000원",
    primaryKeywords: "성수동 도자기, 서울 원데이클래스",
    secondaryKeywords: "성수동 데이트, 이색 체험",
    forbiddenClaims: "최고, 유일한, 무조건 효과",
    toneNotes: "차분한 존댓말",
    // 나머지 필드는 선택 입력
  },
})
```

서버에서는 `brief`를 `JSON.stringify(input.brief ?? {})`로 변환해 `brandProfiles.briefJson`에 저장합니다. 브랜드 생성 성공 후 UI는 `await utils.brands.list.invalidate()`를 실행해 목록과 생성 화면의 브랜드 선택지를 최신 상태로 갱신합니다.

### 4.3 `brands.tone`

특정 브랜드의 저장된 톤 프로필을 조회하는 `protectedProcedure` query입니다.

```ts
trpc.brands.tone.useQuery({ brandId })
```

브리프와 별개로, 기존 블로그 글 샘플에서 추출한 말투·문장 길이·표현 습관을 가져오는 역할입니다. 최종 생성에서는 **사업 브리프가 사실 기준**, **톤 프로필이 표현 기준**으로 함께 사용되는 구조가 바람직합니다.

### 4.4 `content.generate`

`protectedProcedure` mutation입니다. 현재 입력은 다음과 같습니다.

```ts
{
  brandId: number,
  brand: {
    name: string,
    industry?: string,
    services?: string,
    audience?: string,
    strengths?: string,
    tone?: string,
    brief?: BrandBrief,
  },
  primaryKeyword: string,
  secondaryKeywords: string[],
  purpose: string,
  length: string,
  draftId?: number,
  regenerate?: boolean,
}
```

처리 흐름은 구독 만료 확인, 브랜드별 월 12건 생성 예약, 재생성 횟수 예약, DeepSeek 호출, JSON 파싱, 실패 시 사용량 롤백 순서입니다. 현재 프롬프트에는 `상세 업체 브리프: ${JSON.stringify(input.brand.brief ?? {})}`가 포함되어 있어 서버가 받은 브리프를 모델에 전달할 수 있습니다.

현재 반환 초안 구조는 아래 5개 필드입니다.

```ts
{
  title: string,
  intro: string,
  body: string,
  ending: string,
  hashtags: string,
}
```

다음 단계에서는 이 반환 구조를 제목 후보 3개, 후보별 추천 이유, 키워드 배치 계획이 포함된 구조로 확장해야 합니다.

### 4.5 `content.save`

생성된 초안을 `draftHistories`에 저장하는 `protectedProcedure` mutation입니다. 제목·도입부·본문·마무리·해시태그·키워드·SEO 점수를 받습니다.

```ts
trpc.content.save.useMutation().mutate({
  brandId,
  title,
  intro,
  body,
  ending,
  hashtags,
  keywords,
  seoScore,
})
```

제목 후보 선택 기능이 추가되면 저장 시점에는 사용자가 선택하거나 수정한 제목만 `title`에 저장하고, 후보 목록과 추천 이유를 장기 보존할지 여부는 별도 컬럼 또는 JSON 메타데이터로 결정해야 합니다.

### 4.6 관련 기존 API

| 절차 | 유형 | 용도 |
|---|---|---|
| `content.history` | query | 로그인 사용자의 저장 초안 이력 조회 |
| `content.analyzeUrl` | mutation | 네이버 블로그 URL에서 본문 수집 |
| `content.analyzeTone` | mutation | 기존 글 샘플의 말투 프로필 분석·저장 |
| `content.generateVisual` | mutation | 초안 주제에 맞는 이미지 생성 또는 원본 기반 시각물 생성 |
| `usage.current` | query | 브랜드별 월간 12건 사용량과 잔여량 조회 |

## 5. 현재 구현 상태와 남은 연결 작업

현재 가장 중요한 미완성 연결은 **저장된 브리프를 생성 시점에 서버에서 신뢰성 있게 조회하는 것**입니다. 브라우저가 `brand` 객체 전체를 전달하는 방식은 동작은 간단하지만, 사용자가 오래된 화면을 열어 둔 경우 최신 DB 브리프와 달라질 수 있고 클라이언트가 보낸 브랜드 정보를 그대로 신뢰하게 됩니다.

권장 방식은 `content.generate`가 `brandId`를 기준으로 `getBrandProfile(ctx.user.id, input.brandId)`와 `getToneProfile(input.brandId)`를 호출하고, 서버에서 조회한 데이터만 프롬프트에 넣는 것입니다. 이때 브랜드 소유권을 함께 확인해야 다른 사용자의 브랜드 정보를 조회하거나 프롬프트에 섞는 문제가 발생하지 않습니다.

## 6. 다음 개발 마일스톤

### 마일스톤 1 — 브리프 저장·수정·조회 완성

가장 먼저 브랜드 생성뿐 아니라 기존 브랜드 브리프의 조회와 수정이 필요합니다. `brands.get`, `brands.update` 절차를 추가하고, 브랜드 화면에서 상세 브리프를 다시 열어 수정할 수 있게 합니다. 완료 기준은 새로 입력한 15개 필드가 새로고침 뒤에도 유지되고, 다른 사용자에게 노출되지 않으며, 빈 값과 잘못된 형식이 안전하게 처리되는 것입니다.

### 마일스톤 2 — 서버 기준 브랜드 컨텍스트 통합

`content.generate`가 클라이언트의 브랜드 설명을 그대로 사용하지 않고 `brandId`로 DB의 최신 브랜드 프로필과 톤 프로필을 조회하도록 변경합니다. 생성 프롬프트에는 브리프의 사실 기준, 금지 표현, 톤 기준을 별도 섹션으로 넣고, 확인되지 않은 정보는 추측하지 말라는 규칙을 둡니다. 완료 기준은 브리프를 수정했을 때 다음 생성 결과에 즉시 반영되고, 타 브랜드 ID 입력이 거부되는 것입니다.

### 마일스톤 3 — 제목 후보 3개와 선택 흐름

`content.generate`의 JSON 스키마를 `titleOptions` 배열로 확장합니다. 각 항목은 `title`, `reason`, `keywordPlacement`를 갖도록 하고, 모델이 후보를 정확히 3개 반환하는지 서버에서 검증합니다. 생성 화면에는 세 후보를 카드나 라디오 선택지로 표시하고, 선택한 제목을 본문 편집 영역에 적용하는 버튼을 제공합니다. 완료 기준은 후보 3개가 항상 표시되고, 후보 선택 후 SEO 점수·전체 복사·저장 대상 제목이 선택값으로 바뀌는 것입니다.

### 마일스톤 4 — 네이버 검색 의도 중심 SEO 편집 지원

키워드의 단순 반복 횟수만 보지 않고 검색 의도, 제목과 도입부의 주제 일치, 소제목 구조, 문단 가독성, 지역·가격 정보의 정확성을 함께 점검합니다. 키워드 입력 UI는 핵심·보조 키워드를 칩 또는 줄바꿈 입력으로 관리하고, 제목·도입부·소제목·본문·해시태그에 어디에 반영할지 생성 전에 보여줍니다. 완료 기준은 사용자가 점검 결과를 이해할 수 있고, 과도한 반복을 SEO 점수로 보상하지 않는 것입니다.

### 마일스톤 5 — 초안 편집·저장·재생성 안정화

제목 후보를 선택한 뒤 본문을 편집하고 저장하는 전체 흐름을 연결합니다. 저장 성공·실패 상태, 월 12건 차감, 초안별 재생성 3회 제한, 생성 실패 시 롤백을 함께 검증합니다. 완료 기준은 브라우저 새로고침 이후 저장 초안을 다시 조회할 수 있고, 재생성 제한을 초과했을 때 사용량이 잘못 차감되지 않는 것입니다.

### 마일스톤 6 — 실제 사용자 운영 기능

MVP 공개 전에는 카카오 로그인 실계정 흐름, 수동 결제선생 청구서·관리자 승인, 구독 기간 만료, 개인정보 처리방침의 운영자·보관기간·수탁자 정보를 실제 사업 조건에 맞게 확정해야 합니다. 관리자 화면에서는 브랜드별 사용량, 결제 상태, 승인 이력, 문의 대응을 한 화면에서 확인할 수 있도록 운영 지표를 보강합니다.

### 마일스톤 7 — 출시 전 품질·보안·비용 검증

최종 단계에서는 `pnpm check`, 전체 Vitest, `pnpm build`, 모바일·데스크톱 브라우저 검증을 반복합니다. DeepSeek 호출에는 입력 길이 제한, 모델 응답 실패 처리, 비용 기록을 유지하고, API 키·OAuth 비밀값·결제 관련 값이 GitHub에 포함되지 않았는지 점검합니다. 공개 저장소를 유지할 경우 제품 문서와 테스트만 공개하고, 운영 환경 변수는 저장소 밖에서 관리해야 합니다.

## 7. 권장 우선순위

| 우선순위 | 작업 | 이유 |
|---:|---|---|
| 1 | 브리프 조회·수정 API와 UI | 저장만 되고 다시 관리하지 못하면 핵심 자산이 누적되지 않습니다. |
| 2 | 서버 측 브랜드·톤 조회 통합 | 최신 정보 사용과 브랜드 간 데이터 분리를 보장합니다. |
| 3 | 제목 후보 3개와 선택 UI | 사용자의 가장 분명한 요구이며 생성 결과 검수 경험을 개선합니다. |
| 4 | 키워드 배치·SEO 점검 고도화 | 제목과 본문을 손쉽게 편집할 수 있도록 생성 품질을 사용자 작업으로 연결합니다. |
| 5 | 저장·재생성·사용량 통합 테스트 | 과금·사용량과 직접 연결된 기능의 운영 리스크를 줄입니다. |
| 6 | 카카오·결제선생·개인정보 운영 확정 | 실제 출시와 고객 사용에 필요한 외부 조건입니다. |

> 결론적으로, 다음 구현 순서는 **브리프를 저장하는 기능의 완성 → 서버가 최신 브리프를 직접 사용하는 구조 → 제목 3개 추천 및 선택 → SEO 편집·저장 검증**이 가장 안전합니다. 현재 커밋은 첫 단계의 기반을 제공하지만, 제목 추천과 최종 생성 품질까지 완료된 상태로 보아서는 안 됩니다.

## References

[1]: https://github.com/byj0675-cmd/naver-blog-draft-saas "Blogmate AI GitHub repository"
[2]: ../shared/brandBrief.ts "BrandBrief shared type and parser"
[3]: ../server/routers.ts "Blogmate AI tRPC router"
[4]: ../drizzle/schema.ts "Blogmate AI Drizzle schema"
[5]: ../client/src/pages/Home.tsx "Blogmate AI dashboard and brand registration UI"
[6]: ../todo.md "Blogmate AI project TODO"
