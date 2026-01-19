import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 자주 사용되는 단어/구문 사전 (한국어 -> 중국어)
const COMMON_DICTIONARY = {
  '스파': 'SPA',
  '마사지': '按摩',
  '카페': '咖啡馆',
  '레스토랑': '餐厅',
  '호텔': '酒店',
  '공항': '机场',
  '지하철': '地铁',
  '택시': '出租车',
  '맥주': '啤酒',
  '소주': '烧酒',
  '치킨': '炸鸡',
  '피자': '披萨',
  '햄버거': '汉堡',
  '커피': '咖啡',
  '와이파이': 'WiFi',
  'wifi': 'WiFi',
  '블루투스': '蓝牙',
};

// 사전 체크 함수
function checkDictionary(text) {
  const lowerText = text.toLowerCase().trim();
  
  // 정확히 일치하는 경우
  if (COMMON_DICTIONARY[lowerText]) {
    return COMMON_DICTIONARY[lowerText];
  }
  
  // 대소문자 구분 없이 체크
  for (const [key, value] of Object.entries(COMMON_DICTIONARY)) {
    if (key.toLowerCase() === lowerText) {
      return value;
    }
  }
  
  return null;
}

// 여러 번역 엔진 시도
async function translateWithMultipleEngines(text, sourceLang = 'auto', targetLang = 'zh') {
  const results = [];
  
  // 1. 사전 체크
  const dictResult = checkDictionary(text);
  if (dictResult) {
    results.push({
      engine: 'dictionary',
      translated: dictResult,
      confidence: 'high'
    });
  }
  
  // 2. Google Translate
  try {
    const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const googleResponse = await axios.get(googleUrl);
    const googleTranslated = googleResponse.data[0].map(item => item[0]).join('');
    
    results.push({
      engine: 'google',
      translated: googleTranslated,
      confidence: 'medium'
    });
  } catch (error) {
    console.error('Google 번역 오류:', error.message);
  }
  
  // 3. Bing Translate (무료 API)
  try {
    const bingUrl = `https://www.bing.com/ttranslatev3?fromLang=${sourceLang === 'auto' ? 'auto-detect' : sourceLang}&to=${targetLang}&text=${encodeURIComponent(text)}`;
    const bingResponse = await axios.get(bingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 3000
    });
    
    if (bingResponse.data && bingResponse.data[0] && bingResponse.data[0].translations) {
      const bingTranslated = bingResponse.data[0].translations[0].text;
      results.push({
        engine: 'bing',
        translated: bingTranslated,
        confidence: 'medium'
      });
    }
  } catch (error) {
    console.error('Bing 번역 오류:', error.message);
  }
  
  return results;
}

// 번역 API 엔드포인트 (한글/영어 -> 중국어) - 다중 결과 반환
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'auto', targetLang = 'zh' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: '번역할 텍스트가 필요합니다.' });
    }

    // 여러 번역 엔진 결과 가져오기
    const translations = await translateWithMultipleEngines(text, sourceLang, targetLang);
    
    if (translations.length === 0) {
      return res.status(500).json({ error: '번역에 실패했습니다.' });
    }
    
    // 기본 번역 (첫 번째 결과)
    const primaryTranslation = translations[0].translated;
    
    // 중복 제거
    const uniqueTranslations = translations.reduce((acc, curr) => {
      if (!acc.find(item => item.translated === curr.translated)) {
        acc.push(curr);
      }
      return acc;
    }, []);
    
    res.json({
      originalText: text,
      translatedText: primaryTranslation,
      alternatives: uniqueTranslations,
      sourceLang,
      targetLang
    });
  } catch (error) {
    console.error('번역 오류:', error.message);
    res.status(500).json({ error: '번역 중 오류가 발생했습니다.' });
  }
});

// 중국 검색 엔드포인트 (Baidu 검색)
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: '검색어가 필요합니다.' });
    }

    // Baidu 검색 URL 생성
    const baiduUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
    
    // 검색 결과 URL 반환 (실제 스크래핑은 CORS 문제로 클라이언트에서 새 창으로 열기)
    res.json({
      query,
      searchUrls: {
        baidu: baiduUrl,
        dianping: `https://m.dianping.com/search/keyword?keyword=${encodeURIComponent(query)}`,
        taobao: `https://s.taobao.com/search?q=${encodeURIComponent(query)}`,
        jd: `https://search.jd.com/Search?keyword=${encodeURIComponent(query)}`,
        weibo: `https://s.weibo.com/weibo?q=${encodeURIComponent(query)}`,
        zhihu: `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(query)}`
      }
    });
  } catch (error) {
    console.error('검색 오류:', error.message);
    res.status(500).json({ error: '검색 중 오류가 발생했습니다.' });
  }
});

// 역번역 API (중국어 -> 한글/영어)
app.post('/api/translate-back', async (req, res) => {
  try {
    const { text, targetLang = 'ko' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: '번역할 텍스트가 필요합니다.' });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await axios.get(url);
    const translatedText = response.data[0].map(item => item[0]).join('');
    
    res.json({
      originalText: text,
      translatedText,
      sourceLang: 'zh',
      targetLang
    });
  } catch (error) {
    console.error('역번역 오류:', error.message);
    res.status(500).json({ error: '역번역 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 서버가 http://0.0.0.0:${PORT} 에서 실행 중입니다.`);
});

