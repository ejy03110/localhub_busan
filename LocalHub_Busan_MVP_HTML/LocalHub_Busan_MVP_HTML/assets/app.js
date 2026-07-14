
const SAMPLE_POSTS = [
  { id: 8, title: "주말에 가족과 걷기 좋은 해운대·동백섬 코스", content: "해운대역에서 시작해 동백섬과 해운대 해변 산책로를 걷는 코스입니다.
오전 시간대가 비교적 여유롭습니다.", password: "1234", createdAt: "2026-07-14", category: "여행코스" },
  { id: 7, title: "남포동 근처 무료 전시 정보", content: "남포동과 영도 일대에서 무료로 관람할 수 있는 전시를 공유합니다.", password: "1234", createdAt: "2026-07-13", category: "문화시설" },
  { id: 6, title: "광안대교 야경 보기 좋은 시간과 위치", content: "노을 30분 전부터 광안리해수욕장에 도착하면 좋습니다.", password: "1234", createdAt: "2026-07-12", category: "관광지" },
  { id: 5, title: "서면 모범음식점 방문 후기", content: "공공데이터에 등록된 모범음식점 중 한 곳을 방문했습니다.", password: "1234", createdAt: "2026-07-11", category: "맛집" },
  { id: 4, title: "7월 부산 축제 일정 정리", content: "이번 달 주요 축제 일정을 날짜별로 정리했습니다.", password: "1234", createdAt: "2026-07-10", category: "축제" },
  { id: 3, title: "비 오는 날 가기 좋은 부산 실내 명소", content: "국립해양박물관과 부산박물관을 추천합니다.", password: "1234", createdAt: "2026-07-09", category: "문화시설" }
];

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[ch]);
}

function getPosts() {
  const raw = localStorage.getItem("localhub-mvp-posts");
  if (!raw) {
    localStorage.setItem("localhub-mvp-posts", JSON.stringify(SAMPLE_POSTS));
    return [...SAMPLE_POSTS];
  }
  try { return JSON.parse(raw); }
  catch { return [...SAMPLE_POSTS]; }
}

function savePosts(posts) {
  localStorage.setItem("localhub-mvp-posts", JSON.stringify(posts));
}

function getId() {
  return Number(new URLSearchParams(location.search).get("id"));
}

function initChat() {
  const toggles = document.querySelectorAll("[data-chat-toggle]");
  const panel = document.querySelector("[data-chat-panel]");
  const close = document.querySelector("[data-chat-close]");
  const form = document.querySelector("[data-chat-form]");
  const input = document.querySelector("[data-chat-input]");
  const body = document.querySelector("[data-chat-body]");

  if (!panel) return;

  const toggle = () => panel.classList.toggle("open");
  toggles.forEach(btn => btn.addEventListener("click", toggle));
  close?.addEventListener("click", toggle);

  form?.addEventListener("submit", event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    body.insertAdjacentHTML("beforeend", `<div class="message user">${escapeHtml(text)}</div>`);
    input.value = "";

    setTimeout(() => {
      let answer = "부산 지역 관광지, 축제, 맛집, 여행 코스 또는 커뮤니티 게시글을 질문해 주세요.";
      if (text.includes("축제")) answer = "부산 바다축제 등 7월 행사 일정은 축제 캘린더 화면에서 날짜별로 확인할 수 있습니다.";
      else if (text.includes("맛집") || text.includes("음식")) answer = "지도 화면에서 맛집 필터를 선택하면 부산 모범음식점 위치를 확인할 수 있습니다.";
      else if (text.includes("게시글")) answer = "커뮤니티 게시판에서 제목 검색을 지원합니다.";
      else if (text.includes("관광") || text.includes("추천")) answer = "해운대해수욕장, 감천문화마을, 광안리해수욕장, 태종대 등 목적별 장소를 지도에서 탐색해 보세요.";

      body.insertAdjacentHTML("beforeend", `<div class="message bot">${answer}</div>`);
      body.scrollTop = body.scrollHeight;
    }, 400);
  });
}

function renderRecent() {
  const target = document.querySelector("[data-recent-posts]");
  if (!target) return;
  const posts = getPosts().slice().sort((a,b) => b.id - a.id).slice(0,5);
  target.innerHTML = posts.map(post => `
    <a class="post-item" href="post-detail.html?id=${post.id}">
      <span><span class="post-title">${escapeHtml(post.title)}</span><br><span class="post-meta">${escapeHtml(post.category)}</span></span>
      <span class="post-meta">${post.createdAt}</span>
    </a>
  `).join("");
}

function initBoard() {
  const body = document.querySelector("[data-board-body]");
  const search = document.querySelector("[data-board-search]");
  const category = document.querySelector("[data-board-category]");
  const button = document.querySelector("[data-board-search-button]");
  if (!body) return;

  const draw = () => {
    const keyword = search.value.trim().toLowerCase();
    const selected = category.value;
    const posts = getPosts()
      .slice()
      .sort((a,b) => b.id - a.id)
      .filter(post => (!keyword || post.title.toLowerCase().includes(keyword)) && (!selected || post.category === selected));

    body.innerHTML = posts.length ? posts.map(post => `
      <tr>
        <td class="number-col">${post.id}</td>
        <td><a class="post-title" href="post-detail.html?id=${post.id}">${escapeHtml(post.title)}</a><div class="post-meta">${escapeHtml(post.category)}</div></td>
        <td class="date-col">${post.createdAt}</td>
      </tr>
    `).join("") : `<tr><td colspan="3">검색 결과가 없습니다.</td></tr>`;
  };

  draw();
  button?.addEventListener("click", draw);
  category?.addEventListener("change", draw);
  search?.addEventListener("keydown", event => { if (event.key === "Enter") draw(); });
}

function initDetail() {
  const title = document.querySelector("[data-detail-title]");
  const content = document.querySelector("[data-detail-content]");
  const meta = document.querySelector("[data-detail-meta]");
  if (!title) return;

  const posts = getPosts();
  const post = posts.find(item => item.id === getId()) || posts[0];
  title.textContent = post.title;
  content.textContent = post.content;
  meta.textContent = `${post.category} · 작성일 ${post.createdAt}`;

  document.querySelector("[data-edit]")?.addEventListener("click", () => openPassword("edit", post));
  document.querySelector("[data-delete]")?.addEventListener("click", () => openPassword("delete", post));
}

function openPassword(mode, post) {
  const backdrop = document.querySelector("[data-password-modal]");
  const input = document.querySelector("[data-password-input]");
  const title = document.querySelector("[data-password-modal-title]");
  const confirm = document.querySelector("[data-password-confirm]");
  const cancel = document.querySelector("[data-password-cancel]");

  title.textContent = mode === "edit" ? "수정 비밀번호 확인" : "삭제 비밀번호 확인";
  input.value = "";
  backdrop.classList.add("open");
  input.focus();

  const close = () => backdrop.classList.remove("open");
  cancel.onclick = close;
  backdrop.onclick = e => { if (e.target === backdrop) close(); };

  confirm.onclick = () => {
    if (input.value !== post.password) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (mode === "edit") {
      location.href = `post-write.html?id=${post.id}`;
      return;
    }
    savePosts(getPosts().filter(item => item.id !== post.id));
    alert("게시글이 삭제되었습니다.");
    location.href = "board.html";
  };
}

function initWrite() {
  const form = document.querySelector("[data-post-form]");
  if (!form) return;

  const id = getId();
  const title = document.querySelector("[data-post-title]");
  const content = document.querySelector("[data-post-content]");
  const password = document.querySelector("[data-post-password]");
  const category = document.querySelector("[data-post-category]");
  const heading = document.querySelector("[data-form-title]");

  if (id) {
    const post = getPosts().find(item => item.id === id);
    if (post) {
      heading.textContent = "게시글 수정";
      title.value = post.title;
      content.value = post.content;
      password.value = post.password;
      category.value = post.category;
    }
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const values = {
      title: title.value.trim(),
      content: content.value.trim(),
      password: password.value.trim(),
      category: category.value
    };

    if (!values.title || !values.content || values.password.length < 4) {
      alert("제목, 내용, 4자리 이상의 비밀번호를 입력하세요.");
      return;
    }

    const posts = getPosts();
    if (id) {
      const index = posts.findIndex(item => item.id === id);
      posts[index] = { ...posts[index], ...values };
    } else {
      const nextId = posts.length ? Math.max(...posts.map(item => item.id)) + 1 : 1;
      posts.push({ id: nextId, ...values, createdAt: new Date().toISOString().slice(0,10) });
    }
    savePosts(posts);
    alert(id ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다.");
    location.href = "board.html";
  });
}

function initMapFilters() {
  const checkboxes = document.querySelectorAll("[data-map-filter]");
  const info = document.querySelector("[data-map-info]");
  if (!checkboxes.length || !info) return;

  checkboxes.forEach(box => box.addEventListener("change", () => {
    const selected = [...checkboxes].filter(x => x.checked).map(x => x.value);
    info.textContent = selected.length ? `${selected.join(", ")} 카테고리를 지도에 표시 중입니다.` : "표시할 카테고리를 선택하세요.";
  }));
}

document.addEventListener("DOMContentLoaded", () => {
  initChat();
  renderRecent();
  initBoard();
  initDetail();
  initWrite();
  initMapFilters();
});
