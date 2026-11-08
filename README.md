# 가격노트 (Price Note) 🛒

> 식료품과 생필품의 용량별 단위가격(100g / 100ml / 1개당)을 실시간 계산하고, 역대 최저가 및 구매처별 가격 변동을 추적·비교하는 스마트 장보기 웹 앱 (PWA)

## ✨ 주요 기능

1. **단위 환산 자동 계산**
   - 100g, 100ml, 1개 단위 기준 환산가 자동 계산
   - 정가 대비 실구매가 할인율 및 절약 금액 실시간 표시

2. **현장 즉석 비교기 (A vs B)**
   - 마트 매대 앞에서 소용량과 대용량 중 어느 것이 진짜 이득인지 1초 만에 비교

3. **역대 최저가 & 구매처별 이력 추적**
   - 상품별 누적 구매 이력 타임라인
   - 역대 최저가 배지 및 최근 구매가 비교

4. **로컬 오프라인 우선 (IndexedDB + PWA)**
   - 개인정보 유출 걱정 없이 브라우저 로컬 저장소에 안전 저장
   - 데이터 백업(JSON 내보내기) 및 복원 기능 기본 제공

5. **다크 모드 & 모바일 반응형 UI**
   - 모바일 터치 친화적 디자인

## 🚀 빠른 시작 (Local Development)

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 배포용 빌드
npm run build
```

## 🛠 기술 스택

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Storage**: Browser IndexedDB (Local-First)
- **Deployment**: GitHub Pages, Vercel, Netlify 등 어디에나 무료 배포 가능
