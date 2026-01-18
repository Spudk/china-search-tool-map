import { useState } from 'react'
import './App.css'

const API_URL = import.meta.env.PROD 
  ? 'https://3001-i38ap822v87sy2xai6x43-18e660f9.sandbox.novita.ai/api'
  : 'https://3001-i38ap822v87sy2xai6x43-18e660f9.sandbox.novita.ai/api';

// 자주 사용하는 대화 문구
const COMMON_PHRASES = [
  { ko: '지금 가도 되나요?', zh: '现在可以去吗?' },
  { ko: '얼마인가요?', zh: '多少钱?' },
  { ko: '주소를 알려주세요', zh: '请告诉我地址' },
  { ko: '어떻게 가나요?', zh: '怎么去?' },
  { ko: '추천해주세요', zh: '请推荐' },
  { ko: '메뉴판 주세요', zh: '请给我菜单' },
  { ko: '계산해주세요', zh: '买单' },
  { ko: '포장 가능한가요?', zh: '可以打包吗?' },
  { ko: '예약하고 싶습니다', zh: '我想预订' },
  { ko: '화장실이 어디인가요?', zh: '洗手间在哪里?' },
  { ko: '도와주세요', zh: '请帮我' },
  { ko: '감사합니다', zh: '谢谢' },
];

// 앱 정보 (딥링크 및 다운로드 링크)
const APP_INFO = {
  baidu: {
    name: 'Baidu (百度)',
    deeplinkBuilder: (query) => {
      // Baidu 앱 딥링크 (여러 형식 시도)
      return `baiduboxapp://search?word=${encodeURIComponent(query)}`;
    },
    ios: 'https://apps.apple.com/cn/app/id382201985',
    android: 'https://shouji.baidu.com/',
    web: true
  },
  dianping: {
    name: 'Dianping (大众点评)',
    deeplinkBuilder: (query) => {
      // Dianping 딥링크
      return `dianping://search?keyword=${encodeURIComponent(query)}`;
    },
    ios: 'https://apps.apple.com/cn/app/id351091731',
    android: 'https://www.dianping.com/download',
    web: true
  },
  taobao: {
    name: 'Taobao (淘宝)',
    deeplinkBuilder: (query) => {
      // Taobao 딥링크 (최신 형식)
      return `taobao://s.taobao.com/search?q=${encodeURIComponent(query)}`;
    },
    ios: 'https://apps.apple.com/cn/app/id387682726',
    android: 'https://market.m.taobao.com/app/fdilab/download-page/main',
    web: true
  },
  jd: {
    name: 'JD.com (京东)',
    deeplinkBuilder: (query) => {
      // JD 딥링크 (간단한 형식)
      return `openapp.jdmobile://virtual?params=${encodeURIComponent(JSON.stringify({
        category: "jump",
        des: "search",
        keyword: query
      }))}`;
    },
    ios: 'https://apps.apple.com/cn/app/id414245413',
    android: 'https://app.jd.com/',
    web: true
  },
  weibo: {
    name: 'Weibo (微博)',
    deeplinkBuilder: (query) => {
      // Weibo 딥링크
      return `sinaweibo://searchall?q=${encodeURIComponent(query)}`;
    },
    ios: 'https://apps.apple.com/cn/app/id350962117',
    android: 'https://weibo.com/download',
    web: true
  },
  zhihu: {
    name: 'Zhihu (知乎)',
    deeplinkBuilder: (query) => {
      // Zhihu 딥링크
      return `zhihu://search?q=${encodeURIComponent(query)}`;
    },
    ios: 'https://apps.apple.com/cn/app/id432274380',
    android: 'https://www.zhihu.com/app',
    web: true
  }
};

function App() {
  const [searchText, setSearchText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [searchUrls, setSearchUrls] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  
  // 대화용 번역 상태
  const [conversationText, setConversationText] = useState('');
  const [conversationTranslated, setConversationTranslated] = useState('');
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const handleTranslate = async () => {
    if (!searchText.trim()) {
      setError('검색어를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setTranslatedText('');

    try {
      const response = await fetch(`${API_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: searchText,
          sourceLang: 'auto',
          targetLang: 'zh'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setTranslatedText(data.translatedText);
      } else {
        setError(data.error || '번역에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
      console.error('번역 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!translatedText.trim()) {
      setError('먼저 번역을 진행해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: translatedText
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSearchUrls(data.searchUrls);
        setActiveTab('results');
      } else {
        setError(data.error || '검색에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
      console.error('검색 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationTranslate = async (textToTranslate = null) => {
    const text = textToTranslate || conversationText;
    
    if (!text.trim()) {
      return;
    }

    setConversationLoading(true);

    try {
      const response = await fetch(`${API_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          sourceLang: 'auto',
          targetLang: 'zh'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setConversationTranslated(data.translatedText);
        // 히스토리에 추가
        setConversationHistory(prev => [...prev, {
          original: text,
          translated: data.translatedText,
          timestamp: new Date().toLocaleTimeString('ko-KR')
        }]);
        if (!textToTranslate) {
          setConversationText(''); // 입력창 비우기 (자주 쓰는 문구는 비우지 않음)
        }
      }
    } catch (err) {
      console.error('대화 번역 오류:', err);
    } finally {
      setConversationLoading(false);
    }
  };

  const handlePhraseClick = (phrase) => {
    setConversationTranslated(phrase.zh);
    setConversationHistory(prev => [...prev, {
      original: phrase.ko,
      translated: phrase.zh,
      timestamp: new Date().toLocaleTimeString('ko-KR')
    }]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('복사되었습니다!');
  };

  const speakChinese = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 앱으로 열기 시도
  const tryOpenApp = (appKey, query) => {
    const appInfo = APP_INFO[appKey];
    const deeplink = appInfo.deeplinkBuilder(query);
    
    // 모바일 디바이스 감지
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 앱 선택 모달 표시
      setSelectedApp({
        key: appKey,
        info: appInfo,
        query: query,
        deeplink: deeplink,
        webUrl: searchUrls[appKey]
      });
      setShowModal(true);
    } else {
      // 데스크톱에서는 바로 웹으로 열기
      openUrl(searchUrls[appKey]);
    }
  };

  const openInApp = () => {
    if (!selectedApp) return;
    
    // 딥링크로 앱 열기 시도
    window.location.href = selectedApp.deeplink;
    
    // 1.5초 후 앱이 열리지 않으면 스토어로 이동하도록 타이머 설정
    setTimeout(() => {
      setShowModal(false);
    }, 1500);
  };

  const openInWeb = () => {
    if (!selectedApp) return;
    window.open(selectedApp.webUrl, '_blank', 'noopener,noreferrer');
    setShowModal(false);
  };

  const openAppStore = () => {
    if (!selectedApp) return;
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const storeUrl = isIOS ? selectedApp.info.ios : selectedApp.info.android;
    window.open(storeUrl, '_blank', 'noopener,noreferrer');
    setShowModal(false);
  };

  const openUrl = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleReset = () => {
    setSearchText('');
    setTranslatedText('');
    setSearchUrls(null);
    setError('');
    setActiveTab('search');
  };

  const clearConversationHistory = () => {
    setConversationHistory([]);
    setConversationTranslated('');
  };

  return (
    <div className="app-container">
      <div className="card">
        <div className="header">
          <h1>🇨🇳 중국 출장 검색 도우미</h1>
          <p className="subtitle">검색, 번역, 대화 - 중국 출장의 모든 것</p>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 검색 & 번역
          </button>
          <button 
            className={`tab ${activeTab === 'conversation' ? 'active' : ''}`}
            onClick={() => setActiveTab('conversation')}
          >
            💬 대화 번역기
          </button>
          <button 
            className={`tab ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
            disabled={!searchUrls}
          >
            📋 검색 결과
          </button>
        </div>

        {activeTab === 'search' && (
          <div className="content">
            <div className="input-group">
              <label htmlFor="search-input">검색어 입력 (한글/영어)</label>
              <input
                id="search-input"
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="예: 스마트폰, smartphone, 삼성전자"
                onKeyPress={(e) => e.key === 'Enter' && handleTranslate()}
              />
            </div>

            <button 
              className="btn btn-primary"
              onClick={handleTranslate}
              disabled={loading || !searchText.trim()}
            >
              {loading ? '번역 중...' : '중국어로 번역'}
            </button>

            {translatedText && (
              <div className="result-box">
                <h3>번역 결과 (중국어):</h3>
                <div className="translated-text">{translatedText}</div>
                <button 
                  className="btn btn-success"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  중국 사이트에서 검색
                </button>
              </div>
            )}

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
          </div>
        )}

        {activeTab === 'conversation' && (
          <div className="content">
            <div className="conversation-section">
              <h3>💬 실시간 대화 번역기</h3>
              <p className="section-desc">중국에서 필요한 문구를 바로 번역하세요</p>

              <div className="input-group">
                <label htmlFor="conversation-input">번역할 문장 입력</label>
                <div className="conversation-input-wrapper">
                  <input
                    id="conversation-input"
                    type="text"
                    value={conversationText}
                    onChange={(e) => setConversationText(e.target.value)}
                    placeholder="예: 여기서 사진 찍어도 되나요?"
                    onKeyPress={(e) => e.key === 'Enter' && handleConversationTranslate()}
                  />
                  <button 
                    className="btn-icon"
                    onClick={() => handleConversationTranslate()}
                    disabled={conversationLoading || !conversationText.trim()}
                    title="번역하기"
                  >
                    🔄
                  </button>
                </div>
              </div>

              {conversationTranslated && (
                <div className="conversation-result">
                  <div className="translated-display">
                    <div className="chinese-text">{conversationTranslated}</div>
                    <div className="action-buttons">
                      <button 
                        className="btn-small"
                        onClick={() => copyToClipboard(conversationTranslated)}
                        title="복사하기"
                      >
                        📋 복사
                      </button>
                      <button 
                        className="btn-small"
                        onClick={() => speakChinese(conversationTranslated)}
                        title="소리로 듣기"
                      >
                        🔊 읽기
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="common-phrases">
                <h4>자주 쓰는 문구</h4>
                <div className="phrases-grid">
                  {COMMON_PHRASES.map((phrase, index) => (
                    <button
                      key={index}
                      className="phrase-btn"
                      onClick={() => handlePhraseClick(phrase)}
                    >
                      <span className="phrase-ko">{phrase.ko}</span>
                      <span className="phrase-zh">{phrase.zh}</span>
                    </button>
                  ))}
                </div>
              </div>

              {conversationHistory.length > 0 && (
                <div className="conversation-history">
                  <div className="history-header">
                    <h4>번역 히스토리</h4>
                    <button 
                      className="btn-clear"
                      onClick={clearConversationHistory}
                    >
                      🗑️ 지우기
                    </button>
                  </div>
                  <div className="history-list">
                    {conversationHistory.slice().reverse().map((item, index) => (
                      <div key={index} className="history-item">
                        <div className="history-time">{item.timestamp}</div>
                        <div className="history-original">{item.original}</div>
                        <div className="history-translated">
                          {item.translated}
                          <button 
                            className="btn-mini"
                            onClick={() => copyToClipboard(item.translated)}
                          >
                            📋
                          </button>
                          <button 
                            className="btn-mini"
                            onClick={() => speakChinese(item.translated)}
                          >
                            🔊
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'results' && searchUrls && (
          <div className="content">
            <div className="search-info">
              <h3>검색어: {translatedText}</h3>
              <p>📱 모바일: 앱으로 열기 또는 웹으로 보기를 선택하세요</p>
              <p>💻 데스크톱: 웹 브라우저로 열립니다</p>
            </div>

            <div className="search-buttons">
              <button 
                className="search-btn baidu"
                onClick={() => tryOpenApp('baidu', translatedText)}
              >
                <span className="icon">🔍</span>
                <div>
                  <strong>Baidu (百度)</strong>
                  <small>중국 최대 검색 엔진</small>
                </div>
              </button>

              <button 
                className="search-btn dianping"
                onClick={() => tryOpenApp('dianping', translatedText)}
              >
                <span className="icon">⭐</span>
                <div>
                  <strong>Dianping (大众点评)</strong>
                  <small>맛집 & 리뷰 플랫폼</small>
                </div>
              </button>

              <button 
                className="search-btn taobao"
                onClick={() => tryOpenApp('taobao', translatedText)}
              >
                <span className="icon">🛒</span>
                <div>
                  <strong>Taobao (淘宝)</strong>
                  <small>중국 최대 쇼핑몰</small>
                </div>
              </button>

              <button 
                className="search-btn jd"
                onClick={() => tryOpenApp('jd', translatedText)}
              >
                <span className="icon">📦</span>
                <div>
                  <strong>JD.com (京东)</strong>
                  <small>중국 전자상거래 플랫폼</small>
                </div>
              </button>

              <button 
                className="search-btn weibo"
                onClick={() => tryOpenApp('weibo', translatedText)}
              >
                <span className="icon">💬</span>
                <div>
                  <strong>Weibo (微博)</strong>
                  <small>중국 소셜 미디어</small>
                </div>
              </button>

              <button 
                className="search-btn zhihu"
                onClick={() => tryOpenApp('zhihu', translatedText)}
              >
                <span className="icon">💡</span>
                <div>
                  <strong>Zhihu (知乎)</strong>
                  <small>중국 지식 커뮤니티</small>
                </div>
              </button>
            </div>

            <button 
              className="btn btn-secondary"
              onClick={handleReset}
            >
              새로운 검색
            </button>
          </div>
        )}
      </div>

      {/* 앱 선택 모달 */}
      {showModal && selectedApp && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedApp.info.name}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-search-info">
                <div className="modal-search-label">검색어:</div>
                <div className="modal-search-query">{selectedApp.query}</div>
              </div>
              <p className="modal-desc">어떻게 열까요?</p>
              
              <button className="modal-btn modal-btn-app" onClick={openInApp}>
                📱 앱으로 열기
                <small>앱이 설치되어 있으면 바로 열립니다</small>
              </button>
              
              <button className="modal-btn modal-btn-web" onClick={openInWeb}>
                🌐 웹으로 보기
                <small>브라우저에서 열립니다</small>
              </button>
              
              <button className="modal-btn modal-btn-store" onClick={openAppStore}>
                📲 앱 다운로드
                <small>앱스토어/구글플레이로 이동</small>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="footer">
        <p>Made with ❤️ for China Business Travelers</p>
      </div>
    </div>
  )
}

export default App
