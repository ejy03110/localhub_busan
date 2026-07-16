# LocalHub Busan Vue 3

원본 HTML/CSS/JavaScript 프로젝트를 Vue 3 + Vite 구조로 변환한 최종본입니다.

## 실행 방법

### Windows 간편 실행
`START_LOCALHUB.bat`를 더블클릭합니다.

### 명령 프롬프트 실행
반드시 `package.json`이 있는 이 폴더에서 실행합니다.

```cmd
npm install
npm run dev
```

터미널에 표시되는 `http://localhost:5173/` 주소로 접속합니다.
`index.html`을 직접 더블클릭해서는 실행되지 않습니다.

## 주요 기능

- Vue Router 기반 화면 이동
- 부산 홈 화면
- 공공데이터 JSON 기반 지역 탐색
- OpenStreetMap 지도와 장소 마커
- localStorage 기반 게시판 작성·조회·수정·삭제
- 공통 헤더·모바일 메뉴·챗봇·푸터
- 축제 기능 제외

기본 샘플 게시글의 수정·삭제 비밀번호는 `1234`입니다.

## 참고

- 게시판 데이터는 현재 브라우저에만 저장됩니다.
- 날씨와 지도 타일은 인터넷 연결이 필요합니다.
- `package-lock.json`은 특정 개발 환경의 npm 저장소 주소가 고정되는 문제를 막기 위해 포함하지 않았습니다.

## 외부 데이터
- 부산관광공사 제공 JSON 데이터
- Open-Meteo Weather API (CC BY 4.0)