// ========================================================
// OpenAI API 연동 준비 파일
// .env에 VITE_OPENAI_API_KEY를 넣으면 실제 호출을 시도합니다.
// 키가 없으면 ChatbotWidget의 로컬 데이터 검색 답변만 사용합니다.
// 주의: 프론트엔드 환경변수는 사용자 브라우저에서 노출될 수 있습니다.
// ========================================================
export async function askOpenAI(message, contextText) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) return null
  const response = await fetch('https://api.openai.com/v1/responses', {
    method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
    body:JSON.stringify({model:import.meta.env.VITE_OPENAI_MODEL||'gpt-4.1-mini',input:`다음 부산 지역 데이터만 참고해 한국어로 간단히 답하세요.
${contextText}

질문: ${message}`})
  })
  if(!response.ok) throw new Error('챗봇 API 호출에 실패했습니다.')
  const data=await response.json(); return data.output_text || '응답을 확인하지 못했습니다.'
}
