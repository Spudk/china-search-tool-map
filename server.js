import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 번역 API 엔드포인트 (한글/영어 -> 중국어)
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'auto', targetLang = 'zh' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: '번역할 텍스트가 필요합니다.' });
    }

    // Google Translate API 무료 엔드포인트 사용
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await axios.get(url);
    const translatedText = response.data[0].map(item => item[0]).join('');
    
    res.json({
      originalText: text,
      translatedText,
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
        dianping: `https://www.dianping.com/search/keyword/2/0_${encodeURIComponent(query)}`,
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
