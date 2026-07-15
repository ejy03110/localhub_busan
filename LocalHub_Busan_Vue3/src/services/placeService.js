// ========================================================
// 공공데이터 로딩 서비스
// public/data 폴더의 JSON을 읽어 하나의 장소 목록으로 합칩니다.
// 다른 데이터 파일을 추가하려면 DATA_FILES 배열에 등록하면 됩니다.
// ========================================================
const DATA_FILES = [
  ['관광지', 'busan-attractions.json'], ['문화시설', 'busan-culture.json'],
  ['레포츠', 'busan-leports.json'], ['숙박', 'busan-lodging.json'],
  ['쇼핑', 'busan-shopping.json'], ['여행코스', 'busan-courses.json'],
  ['축제·행사', 'busan-events.json'],
]
let cache = null
export async function loadPlaces() {
  if (cache) return cache
  const groups = await Promise.all(DATA_FILES.map(async ([category,file]) => {
    const response = await fetch(`${import.meta.env.BASE_URL}data/${file}`)
    if (!response.ok) throw new Error(`${file}을 불러오지 못했습니다.`)
    const data = await response.json()
    return data.items.map(item => ({
      ...item, category, id: item.contentid,
      latitude: Number(item.mapy), longitude: Number(item.mapx),
      image: item.firstimage2 || item.firstimage || '',
      address: [item.addr1,item.addr2].filter(Boolean).join(' '),
    }))
  }))
  cache = groups.flat()
  return cache
}
export const categoryLabels = DATA_FILES.map(([label])=>label)
