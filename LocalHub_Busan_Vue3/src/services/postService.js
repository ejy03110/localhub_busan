// ========================================================
// 익명 게시판 localStorage 서비스
// 서버 없이 현재 브라우저에만 글을 저장합니다.
// ========================================================
const STORAGE_KEY='localhub-busan-posts'
const seed=[
 {id:3,title:'광안리 야경 산책 후기',content:'저녁 7시 이후 방문하니 야경이 아름다웠습니다.',category:'관광지',password:'1234',createdAt:'2026-07-14'},
 {id:2,title:'비 오는 날 문화시설 추천',content:'국립부산과학관과 박물관을 추천합니다.',category:'문화시설',password:'1234',createdAt:'2026-07-13'},
 {id:1,title:'부산 여행코스 정보를 공유해요',content:'대중교통으로 이동하기 좋은 코스를 알려주세요.',category:'여행코스',password:'1234',createdAt:'2026-07-12'}]
function read(){try{const v=JSON.parse(localStorage.getItem(STORAGE_KEY));if(Array.isArray(v))return v}catch{} localStorage.setItem(STORAGE_KEY,JSON.stringify(seed));return [...seed]}
function write(posts){localStorage.setItem(STORAGE_KEY,JSON.stringify(posts))}
export const getPosts=()=>read().sort((a,b)=>b.id-a.id)
export const getPost=id=>read().find(p=>p.id===Number(id))
export function createPost(input){const posts=read();const post={...input,id:Math.max(0,...posts.map(p=>p.id))+1,createdAt:new Date().toISOString().slice(0,10)};posts.push(post);write(posts);return post}
export function updatePost(id,input){const posts=read();const i=posts.findIndex(p=>p.id===Number(id));if(i<0)return null;posts[i]={...posts[i],...input,id:Number(id)};write(posts);return posts[i]}
export function deletePost(id){write(read().filter(p=>p.id!==Number(id)))}
export const verifyPassword=(post,password)=>post?.password===password
