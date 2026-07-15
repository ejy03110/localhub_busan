# 파일별 역할 안내

- `src/App.vue`: 전체 공통 레이아웃과 챗봇 배치
- `src/router/index.js`: URL과 화면 연결
- `src/views/HomeView.vue`: 홈 화면
- `src/views/ExploreView.vue`: JSON 검색 및 분류 화면
- `src/views/BoardListView.vue`: 게시글 목록과 검색
- `src/views/BoardDetailView.vue`: 상세, 비밀번호 확인, 삭제
- `src/views/BoardFormView.vue`: 작성 및 수정
- `src/services/placeService.js`: JSON 파일 로딩과 공통 형태 변환
- `src/services/postService.js`: localStorage CRUD
- `src/services/openaiService.js`: OpenAI API 연결 준비
- `src/components/chat/ChatbotWidget.vue`: 오른쪽 하단 챗봇 UI와 답변 로직
- `src/assets/styles.css`: 전체 디자인, 반응형, 챗봇 위치
