# 중국 출장 검색 & 번역 도우미 🇨🇳

중국 출장 중 한글 또는 영어로 검색하고, 자동으로 중국어로 번역하여 중국 주요 사이트에서 검색 결과를 확인할 수 있는 웹 애플리케이션입니다.

## 주요 기능

- ✅ **자동 번역**: 한글/영어 검색어를 중국어로 자동 번역
- 🔍 **다중 사이트 검색**: Baidu, Taobao, JD.com, Weibo, Zhihu 등 주요 중국 사이트 지원
- 🎨 **직관적인 UI**: 깔끔하고 사용하기 쉬운 인터페이스
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원

## 지원 사이트

1. **Baidu (百度)** - 중국 최대 검색 엔진
2. **Taobao (淘宝)** - 중국 최대 쇼핑몰
3. **JD.com (京东)** - 중국 전자상거래 플랫폼
4. **Weibo (微博)** - 중국 소셜 미디어
5. **Zhihu (知乎)** - 중국 지식 커뮤니티

## 기술 스택

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **API**: Google Translate API (무료)
- **Styling**: CSS3 (반응형 디자인)

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 백엔드 서버 실행
```bash
npm run server
```
서버가 `http://localhost:3001` 에서 실행됩니다.

### 3. 프론트엔드 개발 서버 실행 (새 터미널)
```bash
npm run dev
```
애플리케이션이 `http://localhost:3000` 에서 실행됩니다.

## 사용 방법

1. 검색창에 한글 또는 영어로 검색어 입력 (예: "스마트폰", "smartphone")
2. "중국어로 번역" 버튼 클릭
3. 번역된 중국어 검색어 확인
4. "중국 사이트에서 검색" 버튼 클릭
5. 원하는 중국 사이트 버튼을 클릭하여 검색 결과 확인

## API 엔드포인트

### POST /api/translate
한글/영어를 중국어로 번역
```json
{
  "text": "스마트폰",
  "sourceLang": "auto",
  "targetLang": "zh"
}
```

### POST /api/search
중국 주요 사이트 검색 URL 생성
```json
{
  "query": "智能手机"
}
```

### POST /api/translate-back
중국어를 한글/영어로 역번역
```json
{
  "text": "智能手机",
  "targetLang": "ko"
}
```

## 프로젝트 구조

```
china-search-translator/
├── src/
│   ├── App.jsx          # 메인 애플리케이션 컴포넌트
│   ├── App.css          # 스타일시트
│   ├── main.jsx         # React 엔트리 포인트
│   └── index.css        # 글로벌 스타일
├── public/              # 정적 파일
├── server.js            # Express 백엔드 서버
├── vite.config.js       # Vite 설정
├── package.json         # 프로젝트 설정
└── README.md           # 프로젝트 문서
```

## 주의사항

- 백엔드 서버(포트 3001)와 프론트엔드(포트 3000)를 모두 실행해야 합니다.
- 중국 사이트 접속을 위해 VPN이 필요할 수 있습니다.
- Google Translate API는 무료 버전을 사용하며, 대량 요청 시 제한될 수 있습니다.

## 라이센스

MIT License

## 기여

이슈 및 풀 리퀘스트를 환영합니다!

---

Made with ❤️ for China Business Travelers
