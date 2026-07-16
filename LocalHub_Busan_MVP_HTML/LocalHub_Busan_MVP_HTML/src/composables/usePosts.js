const STORAGE_KEY = 'localhub-mvp-posts';

export const SAMPLE_POSTS = [
  {
    id: 6,
    title: '해운대 근처 가족 호텔 추천 부탁드립니다',
    content: '아이와 함께 묵기 좋은 해운대 근처 숙소를 찾고 있습니다.',
    password: '1234',
    createdAt: '2026-07-14',
    topic: '숙박',
    postType: '질문',
    place: '해운대',
    image: '/images/posts/post-6-haeundae-hotel.jpg',
    likes: 23,
    views: 145,
  },
  {
    id: 5,
    title: '광안리 숙소 1박 후기',
    content: '광안리 바다 근처 숙소를 이용했는데 야경을 보기 좋았습니다.',
    password: '1234',
    createdAt: '2026-07-13',
    topic: '숙박',
    postType: '후기',
    place: '광안리',
    image: '/images/posts/post-5-gwangalli-night.jpg',
    likes: 18,
    views: 117,
  },
  {
    id: 4,
    title: '비 오는 날 갈 만한 부산 관광지 있나요?',
    content: '실내에서 이용할 수 있는 부산 관광지를 추천받고 싶습니다.',
    password: '1234',
    createdAt: '2026-07-12',
    topic: '관광',
    postType: '질문',
    place: '',
    image: '/images/posts/post-4-indoor-place.jpg',
    likes: 13,
    views: 89,
  },
  {
    id: 3,
    title: '감천문화마을 방문 후기',
    content: '골목과 전망이 아름다웠지만 경사가 많아서 편한 신발이 필요합니다.',
    password: '1234',
    createdAt: '2026-07-11',
    topic: '관광',
    postType: '후기',
    place: '감천문화마을',
    image: '/images/posts/post-3-gamcheon.jpg',
    likes: 11,
    views: 72,
  },
  {
    id: 2,
    title: '부산 여행 준비하면서 궁금한 점',
    content: '부산 대중교통 이용 팁을 자유롭게 공유해주세요.',
    password: '1234',
    createdAt: '2026-07-10',
    topic: '기타',
    postType: '기타',
    place: '',
    image: '/images/posts/post-2-busan-transport.jpg',
    likes: 8,
    views: 64,
  },
  {
    id: 1,
    title: '부산 여행 자유 이야기',
    content: '부산에서 좋았던 장소를 자유롭게 이야기해 주세요.',
    password: '1234',
    createdAt: '2026-07-09',
    topic: '기타',
    postType: '기타',
    place: '',
    image: '/images/posts/post-1-busan-view.jpg',
    likes: 6,
    views: 51,
  },
];

function normalizePost(post) {
  return {
    ...post,
    id: Number(post.id),
    title: post.title || '',
    content: post.content || '',
    password: post.password || '',
    createdAt: post.createdAt || '',
    topic: post.topic || '기타',
    postType: post.postType || '기타',
    place: post.place || '',
    image: post.image || '',
    likes: Number(post.likes || 0),
    views: Number(post.views || 0),
  };
}

function savePosts(posts) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(posts.map(normalizePost)),
  );
}

export function getPosts() {
  const savedPosts = localStorage.getItem(STORAGE_KEY);

  if (!savedPosts) {
    savePosts(SAMPLE_POSTS);
    return SAMPLE_POSTS.map(normalizePost);
  }

  try {
    const parsedPosts = JSON.parse(savedPosts);

    if (!Array.isArray(parsedPosts)) {
      throw new Error('게시글 데이터 형식이 올바르지 않습니다.');
    }

    return parsedPosts.map(normalizePost);
  } catch (error) {
    console.error('게시글 데이터를 읽지 못했습니다.', error);

    savePosts(SAMPLE_POSTS);
    return SAMPLE_POSTS.map(normalizePost);
  }
}

export function getPostById(id) {
  return getPosts().find(
    (post) => Number(post.id) === Number(id),
  ) || null;
}

export function createPost(postData) {
  const posts = getPosts();

  const nextId = posts.length
    ? Math.max(...posts.map((post) => Number(post.id))) + 1
    : 1;

  const newPost = normalizePost({
    ...postData,
    id: nextId,
    createdAt: new Date().toLocaleDateString('sv-SE'),
    likes: 0,
    views: 0,
  });

  savePosts([newPost, ...posts]);

  return newPost;
}

export function updatePost(id, postData) {
  const posts = getPosts();

  const targetIndex = posts.findIndex(
    (post) => Number(post.id) === Number(id),
  );

  if (targetIndex === -1) {
    return null;
  }

  const updatedPost = normalizePost({
    ...posts[targetIndex],
    ...postData,
    id: Number(id),
  });

  posts[targetIndex] = updatedPost;
  savePosts(posts);

  return updatedPost;
}

export function deletePost(id) {
  const posts = getPosts();

  const remainingPosts = posts.filter(
    (post) => Number(post.id) !== Number(id),
  );

  if (remainingPosts.length === posts.length) {
    return false;
  }

  savePosts(remainingPosts);
  return true;
}