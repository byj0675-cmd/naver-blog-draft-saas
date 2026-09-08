# Blogmate AI 작업 규칙

작업을 시작하기 전에 `ANTIGRAVITY.md`를 반드시 읽는다. 저장소 주소, 현재 구현 범위, 실행 명령, 환경변수 이름, 디자인 기준, 보존해야 할 API 계약과 첫 작업 프롬프트가 모두 해당 문서에 정리되어 있다.

기본 원칙은 다음과 같다.

1. 기존 Blogmate AI 디자인을 유지한다. 밝은 아이보리·화이트 배경, 짙은 네이비 텍스트, 코랄 포인트, 왼쪽 사이드바 업무 도구 레이아웃을 보존한다.
2. `brandProfiles.briefJson`, `brands.get/update`, `content.generate`, 브랜드별 월 12건 제한, 제목 후보 3개, 카카오 OAuth와 수동 결제 승인 흐름을 깨뜨리지 않는다.
3. 작업 전 변경 대상 파일과 보존할 계약을 요약하고, 작업 후 `pnpm check`, `pnpm test`, `pnpm build`를 실행한다.
4. 실제 비밀값을 코드나 GitHub에 넣지 않는다. `git reset --hard`와 강제 push를 사용하지 않는다.
