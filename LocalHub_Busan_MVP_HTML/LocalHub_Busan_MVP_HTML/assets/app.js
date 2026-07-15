
/*
==========================================================
게시판 기본 샘플 데이터

게시글은 두 단계로 분류합니다.

1. topic: 게시글의 큰 주제
   - 관광
   - 숙박
   - 기타
   - 자유

2. postType: 선택한 주제 안에서 글의 성격
   - 질문
   - 후기
   - 자유

기본 비밀번호는 교육용 테스트를 위해 1234로 설정합니다.
==========================================================
*/
const SAMPLE_POSTS = [
  {
    id: 6,
    title: "해운대 근처 가족 호텔 추천 부탁드립니다",
    content: "아이와 함께 묵기 좋은 해운대 근처 숙소를 찾고 있습니다.",
    password: "1234",
    createdAt: "2026-07-14",

    // 게시글의 큰 주제
    topic: "숙박",

    // 숙박 주제 안에서 추천을 요청하는 질문 글
    postType: "질문"
  },
  {
    id: 5,
    title: "광안리 숙소 1박 후기",
    content: "광안리 바다 근처 숙소를 이용했는데 야경을 보기 좋았습니다.",
    password: "1234",
    createdAt: "2026-07-13",
    topic: "숙박",
    postType: "후기"
  },
  {
    id: 4,
    title: "비 오는 날 갈 만한 부산 관광지 있나요?",
    content: "실내에서 이용할 수 있는 부산 관광지를 추천받고 싶습니다.",
    password: "1234",
    createdAt: "2026-07-12",
    topic: "관광",
    postType: "질문"
  },
  {
    id: 3,
    title: "감천문화마을 방문 후기",
    content: "골목과 전망이 아름다웠지만 경사가 많아서 편한 신발이 필요합니다.",
    password: "1234",
    createdAt: "2026-07-11",
    topic: "관광",
    postType: "후기"
  },
  {
    id: 2,
    title: "부산 여행 준비하면서 궁금한 점",
    content: "부산 대중교통 이용 팁을 자유롭게 공유해주세요.",
    password: "1234",
    createdAt: "2026-07-10",
    topic: "기타",
    postType: "자유"
  },
  {
    id: 1,
    title: "부산 여행 자유 이야기",
    content: "부산에서 좋았던 장소를 자유롭게 이야기해 주세요.",
    password: "1234",
    createdAt: "2026-07-09",
    topic: "자유",
    postType: "자유"
  }
];

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[ch]);
}

/*
==========================================================
localStorage에서 게시글 목록을 가져오는 함수

기존 게시글은 category 속성만 가지고 있을 수 있습니다.
새 게시글은 topic과 postType을 사용하므로,
오래된 데이터를 자동으로 새 구조로 변환합니다.
==========================================================
*/
function getPosts() {
  /*
    localStorage에서 게시글 문자열을 가져옵니다.
  */
  const raw = localStorage.getItem("localhub-mvp-posts");

  /*
    저장된 게시글이 하나도 없다면
    SAMPLE_POSTS를 localStorage에 저장하고 반환합니다.
  */
  if (!raw) {
    localStorage.setItem(
      "localhub-mvp-posts",
      JSON.stringify(SAMPLE_POSTS)
    );

    return [...SAMPLE_POSTS];
  }

  try {
    /*
      JSON 문자열을 실제 JavaScript 배열로 바꿉니다.
    */
    const posts = JSON.parse(raw);

    /*
      예전 게시글 데이터는 category만 가지고 있을 수 있습니다.

      예전 구조:
      {
        category: "관광지"
      }

      새 구조:
      {
        topic: "관광",
        postType: "자유"
      }
    */
    const convertedPosts = posts.map(post => {
      /*
        이미 topic과 postType이 있다면
        새 구조의 게시글이므로 그대로 반환합니다.
      */
      if (post.topic && post.postType) {
        return post;
      }

      /*
        기존 카테고리를 새 주제로 바꾸기 위한 기본값입니다.
      */
      let convertedTopic = "기타";

      /*
        관광지, 문화시설, 여행코스는
        새 구조에서 관광 주제로 합칩니다.
      */
      if (
        post.category === "관광지" ||
        post.category === "문화시설" ||
        post.category === "여행코스"
      ) {
        convertedTopic = "관광";
      }

      /*
        기존 데이터에 숙박 또는 맛집이 있다면
        임시로 숙박 주제로 변환합니다.

        음식점 JSON은 사용하지 않지만,
        예전 localStorage에 맛집 게시글이 남아 있을 수 있어
        오류 방지를 위해 포함합니다.
      */
      if (
        post.category === "숙박" ||
        post.category === "맛집"
      ) {
        convertedTopic = "숙박";
      }

      /*
        기존 데이터에는 글 성격 정보가 없으므로
        기본 글 성격을 자유로 설정합니다.
      */
      return {
        ...post,
        topic: convertedTopic,
        postType: "자유"
      };
    });

    /*
      변환된 데이터를 다시 저장해서
      다음부터는 새 구조를 그대로 사용합니다.
    */
    savePosts(convertedPosts);

    return convertedPosts;
  } catch (error) {
    /*
      localStorage 데이터가 손상되어 JSON 변환이 실패하면
      오류를 콘솔에 출력하고 샘플 데이터를 사용합니다.
    */
    console.error(
      "게시글 데이터를 불러오지 못했습니다.",
      error
    );

    return [...SAMPLE_POSTS];
  }
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

/*
==========================================================
게시판 목록 출력 및 검색 기능

검색 기준
1. 제목 검색
2. 주제 필터: 관광 / 숙박 / 기타 / 자유
3. 글 성격 필터: 질문 / 후기 / 자유

board.html의 다음 요소와 연결됩니다.

data-board-body
data-board-search
data-board-topic
data-board-post-type
data-board-search-button
==========================================================
*/
function initBoard() {
  /*
    게시글 목록이 들어갈 tbody 요소입니다.
  */
  const body = document.querySelector(
    "[data-board-body]"
  );

  /*
    게시글 제목 검색 입력창입니다.
  */
  const search = document.querySelector(
    "[data-board-search]"
  );

  /*
    게시글의 큰 분류인 주제 선택창입니다.

    관광 / 숙박 / 기타 / 자유
  */
  const topicSelect = document.querySelector(
    "[data-board-topic]"
  );

  /*
    선택한 주제 안에서 글의 성격을 구분하는 선택창입니다.

    질문 / 후기 / 자유
  */
  const postTypeSelect = document.querySelector(
    "[data-board-post-type]"
  );

  /*
    검색 조건을 적용하는 버튼입니다.
  */
  const button = document.querySelector(
    "[data-board-search-button]"
  );

  /*
    현재 페이지에 게시글 목록 영역이 없다면
    이 함수를 더 이상 실행하지 않습니다.

    app.js는 여러 HTML에서 함께 사용하기 때문에
    해당 요소가 없는 페이지에서는 안전하게 종료해야 합니다.
  */
  if (!body) return;

  /*
    현재 검색 조건에 맞는 게시글을 찾아
    게시판 표에 출력하는 함수입니다.
  */
  const draw = () => {
    /*
      제목 검색어를 읽습니다.

      검색창이 없을 가능성까지 고려해
      optional chaining과 기본값을 사용합니다.
    */
    const keyword = (
      search?.value || ""
    )
      .trim()
      .toLowerCase();

    /*
      선택된 주제를 가져옵니다.

      빈 값이면 전체 주제를 뜻합니다.
    */
    const selectedTopic =
      topicSelect?.value || "";

    /*
      선택된 글 성격을 가져옵니다.

      빈 값이면 전체 글 성격을 뜻합니다.
    */
    const selectedPostType =
      postTypeSelect?.value || "";

    /*
      localStorage에서 게시글을 불러옵니다.
    */
    const posts = getPosts()
      .slice()

      /*
        게시글 ID가 큰 최신 글이 위로 오도록 정렬합니다.
      */
      .sort((a, b) => b.id - a.id)

      /*
        제목, 주제, 글 성격 조건을 모두 검사합니다.
      */
      .filter(post => {
        /*
          검색어가 없거나,
          게시글 제목에 검색어가 포함되면 통과합니다.
        */
        const matchesKeyword =
          !keyword ||
          post.title
            .toLowerCase()
            .includes(keyword);

        /*
          주제가 선택되지 않았거나,
          게시글 주제가 선택한 값과 같으면 통과합니다.
        */
        const matchesTopic =
          !selectedTopic ||
          post.topic === selectedTopic;

        /*
          글 성격이 선택되지 않았거나,
          게시글 성격이 선택한 값과 같으면 통과합니다.
        */
        const matchesPostType =
          !selectedPostType ||
          post.postType === selectedPostType;

        return (
          matchesKeyword &&
          matchesTopic &&
          matchesPostType
        );
      });

    /*
      검색 결과가 있으면 게시글 행을 출력하고,
      없으면 검색 결과가 없다는 문구를 출력합니다.
    */
    body.innerHTML = posts.length
      ? posts.map(post => `
          <tr>
            <!-- 게시글 번호 -->
            <td class="number-col">
              ${post.id}
            </td>

            <!-- 게시글의 큰 주제 -->
            <td>
              ${escapeHtml(post.topic || "기타")}
            </td>

            <!-- 주제 안에서의 글 성격 -->
            <td>
              ${escapeHtml(post.postType || "자유")}
            </td>

            <!-- 게시글 제목과 상세 페이지 링크 -->
            <td>
              <a
                class="post-title"
                href="post-detail.html?id=${post.id}"
              >
                ${escapeHtml(post.title)}
              </a>
            </td>

            <!-- 게시글 작성일 -->
            <td class="date-col">
              ${post.createdAt}
            </td>
          </tr>
        `).join("")
      : `
          <tr>
            <td colspan="5">
              검색 결과가 없습니다.
            </td>
          </tr>
        `;
  };

  /*
    게시판 페이지를 처음 열었을 때
    전체 게시글을 한 번 출력합니다.
  */
  draw();

  /*
    검색 버튼 클릭 시 필터를 적용합니다.
  */
  button?.addEventListener(
    "click",
    draw
  );

  /*
    주제를 변경하면 바로 결과를 다시 출력합니다.
  */
  topicSelect?.addEventListener(
    "change",
    draw
  );

  /*
    글 성격을 변경하면 바로 결과를 다시 출력합니다.
  */
  postTypeSelect?.addEventListener(
    "change",
    draw
  );

  /*
    제목 검색창에서 Enter 키를 눌러도
    검색 버튼과 동일하게 작동합니다.
  */
  search?.addEventListener(
    "keydown",
    event => {
      if (event.key === "Enter") {
        draw();
      }
    }
  );
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
