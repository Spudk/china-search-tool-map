import { useState } from 'react'
import './App.css'

const API_URL = import.meta.env.PROD 
  ? 'https://3001-i38ap822v87sy2xai6x43-18e660f9.sandbox.novita.ai/api'
  : 'https://3001-i38ap822v87sy2xai6x43-18e660f9.sandbox.novita.ai/api';

function App() {
  const [searchText, setSearchText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [searchUrls, setSearchUrls] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('search');

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

  return (
    <div className="app-container">
      <div className="card">
        <div className="header">
          <h1>🇨🇳 중국 출장 검색 도우미</h1>
          <p className="subtitle">한글/영어로 검색하고 중국 사이트에서 결과를 확인하세요</p>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            검색 & 번역
          </button>
          <button 
            className={`tab ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
            disabled={!searchUrls}
          >
            검색 결과
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

        {activeTab === 'results' && searchUrls && (
          <div className="content">
            <div className="search-info">
              <h3>검색어: {translatedText}</h3>
              <p>아래 버튼을 클릭하여 각 사이트에서 검색 결과를 확인하세요</p>
            </div>

            <div className="search-buttons">
              <button 
                className="search-btn baidu"
                onClick={() => openUrl(searchUrls.baidu)}
              >
                <span className="icon">🔍</span>
                <div>
                  <strong>Baidu (百度)</strong>
                  <small>중국 최대 검색 엔진</small>
                </div>
              </button>

              <button 
                className="search-btn taobao"
                onClick={() => openUrl(searchUrls.taobao)}
              >
                <span className="icon">🛒</span>
                <div>
                  <strong>Taobao (淘宝)</strong>
                  <small>중국 최대 쇼핑몰</small>
                </div>
              </button>

              <button 
                className="search-btn jd"
                onClick={() => openUrl(searchUrls.jd)}
              >
                <span className="icon">📦</span>
                <div>
                  <strong>JD.com (京东)</strong>
                  <small>중국 전자상거래 플랫폼</small>
                </div>
              </button>

              <button 
                className="search-btn weibo"
                onClick={() => openUrl(searchUrls.weibo)}
              >
                <span className="icon">💬</span>
                <div>
                  <strong>Weibo (微博)</strong>
                  <small>중국 소셜 미디어</small>
                </div>
              </button>

              <button 
                className="search-btn zhihu"
                onClick={() => openUrl(searchUrls.zhihu)}
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

      <div className="footer">
        <p>Made with ❤️ for China Business Travelers</p>
      </div>
    </div>
  )
}

export default App
