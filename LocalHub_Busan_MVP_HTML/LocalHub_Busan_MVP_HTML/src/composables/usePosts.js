const STORAGE_KEY = 'localhub-mvp-posts';

export const SAMPLE_POSTS = [
  { id: 6, title: '해운대 근처 가족 호텔 추천 부탁드립니다', content: '아이와 함께 묵기 좋은 해운대 근처 숙소를 찾고 있습니다.', password: '1234', createdAt: '2026-07-14', topic: '숙박', postType: '질문', place: '해운대' },
  { id: 5, title: '광안리 숙소 1박 후기', content: '광안리 바다 근처 숙소를 이용했는데 야경을 보기 좋았습니다.', password: '1234', createdAt: '2026-07-13', topic: '숙박', postType: '후기', place: '광안리' },
  { id: 4, title: '비 오는 날 갈 만한 부산 관광지 있나요?', content: '실내에서 이용할 수 있는 부산 관광지를 추천받고 싶습니다.', password: '1234', createdAt: '2026-07-12', topic: '관광', postType: '질문' },
  { id: 3, title: '감천문화마을 방문 후기', content: '골목과 전망이 아름다웠지만 경사가 많아서 편한 신발이 필요합니다.', password: '1234', createdAt: '2026-07-11', topic: '관광', postType: '후기', place: '감천문화마을' },
  { id: 2, title: '부산 여행 준비하면서 궁금한 점', content: '부산 대중교통 이용 팁을 자유롭게 공유해주세요.', password: '1234', createdAt: '2026-07-10', topic: '기타', postType: '기타' },
  { id: 1, title: '부산 여행 자유 이야기', content: '부산에서 좋았던 장소를 자유롭게 이야기해 주세요.', password: '1234', createdAt: '2026-07-09', topic: '기타', postType: '기타' },
];

function normalizeTopic(post) {
  if (post.topic) return post.topic === '자유' ? '기타' : post.topic;
  if (['관광지', '문화시설', '여행코스', '관광'].includes(post.category)) return '관광';
  if (post.category === '숙박') return '숙박';
  if (post.category === '맛집') return '맛집';
  return '기타';
}

function normalizePostType(post) {
  if (!post.postType) return '기타';
  return post.postType === '자유' ? '기타' : post.postType;
}

export function normalizePost(post) {
  return {
    ...post,
    id: Number(post.id),
    topic: normalizeTopic(post),
    postType: normalizePostType(post),
    likes: Number(post.likes || 0),
    views: Number(post.views || 0),
  };
}

export function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.map(normalizePost)));
}

export function getPosts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    savePosts(SAMPLE_POSTS);
    return SAMPLE_POSTS.map((post) => ({ ...post }));
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('게시글 데이터가 배열이 아닙니다.');
    const normalized = parsed.map(normalizePost);
    savePosts(normalized);
    return normalized;
  } catch (error) {
    console.error('게시글 데이터를 불러오지 못했습니다.', error);
    savePosts(SAMPLE_POSTS);
    return SAMPLE_POSTS.map((post) => ({ ...post }));
  }
}

export function getPostById(id) {
  return getPosts().find((post) => post.id === Number(id)) ?? null;
}

export function createPost(form) {
  const posts = getPosts();
  const nextId = posts.reduce((max, post) => Math.max(max, post.id), 0) + 1;
  const post = normalizePost({
    id: nextId,
    ...form,
    createdAt: new Date().toLocaleDateString('sv-SE'),
  });
  savePosts([post, ...posts]);
  return post;
}

export function updatePost(id, form) {
  const posts = getPosts();
  const index = posts.findIndex((post) => post.id === Number(id));
  if (index < 0) return null;
  const updated = normalizePost({ ...posts[index], ...form, id: Number(id) });
  posts[index] = updated;
  savePosts(posts);
  return updated;
}

export function deletePost(id) {
  const posts = getPosts();
  const filtered = posts.filter((post) => post.id !== Number(id));
  if (filtered.length === posts.length) return false;
  savePosts(filtered);
  return true;
}

export function increasePostView(id) {
  const posts = getPosts();

  const index = posts.findIndex(
    (post) => post.id === Number(id)
  );

  if (index < 0) return null;

  posts[index].views = Number(posts[index].views || 0) + 1;

  savePosts(posts);

  return posts[index];
}

export function increasePostLike(id) {
  const posts = getPosts();

  const index = posts.findIndex(
    (post) => post.id === Number(id)
  );

  if (index < 0) return null;

  posts[index].likes = Number(posts[index].likes || 0) + 1;

  savePosts(posts);

  return posts[index];
}