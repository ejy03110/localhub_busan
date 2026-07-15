# LocalHub 부산 — Vue 3 + Vite

기존 HTML 프로토타입을 Vue 3 SPA로 재구성한 초보자 학습용 프로젝트입니다. 요청에 따라 **축제 캘린더 화면은 제외**했고, 축제 데이터는 지역 탐색과 챗봇 검색에서만 사용합니다.

## 실행 방법

```bash
npm install
npm run dev
```

배포용 확인:

```bash
npm run build
npm run preview
```

## 주요 기능

- 홈: 실제 JSON 건수, 추천 장소, 최근 게시글
- 지역 탐색: 7개 분류, 제목·주소 검색, 페이지 이동, 외부 지도 링크
- 커뮤니티: localStorage 기반 작성·조회·수정·삭제, 비밀번호 확인
- 챗봇: 오른쪽 하단 플로팅 UI, JSON 및 게시글 로컬 검색
- OpenAI 연결 준비: `.env.example`을 `.env`로 복사한 뒤 제한된 API 키 입력

## 초보자 수정 안내

- 메뉴 변경: `src/components/common/AppHeader.vue`
- 메인 화면: `src/views/HomeView.vue`
- 지역 데이터 분류: `src/services/placeService.js`
- 게시판 저장 방식: `src/services/postService.js`
- 챗봇 위치·UI: `src/components/chat/ChatbotWidget.vue`, `src/assets/styles.css`의 `.chat-fab`, `.chat-panel`
- 색상·레이아웃: `src/assets/styles.css` 최상단 CSS 변수
- JSON 교체: `public/data/`

## 챗봇 API 주의

의뢰서 방식에 맞춰 브라우저에서 직접 API를 호출하는 예시를 포함했지만, `VITE_` 환경변수는 빌드 결과에서 노출될 수 있습니다. 반드시 교육용·사용량 제한 키를 사용하고 `.env`는 Git에 올리지 마세요. API 키가 없을 때도 로컬 JSON 검색 챗봇은 동작합니다.

## 데이터 출처

이 서비스는 한국관광공사 TourAPI 4.0 데이터를 활용했습니다. 라이선스와 원문 조건은 `docs/DATA_SOURCE.md`를 확인하세요.
