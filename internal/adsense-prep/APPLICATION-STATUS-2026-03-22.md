# Calqio 적용 상태표 (2026-03-22)

| 항목 | 경로/대상 | 근거 | 상태 | 검증 |
|------|-----------|------|------|------|
| canonical/www | 전역 | main 이력 | **적용 확인** (운영) | curl www |
| sitemap/robots www | `/sitemap.xml`, `/robots.txt` | 선행 확인 | **적용 확인** | 운영 GET 200 |
| `/` → `/ko/` | `vercel.json` | 선행+운영 | **적용 확인** | www `/` → 308 `/ko/` |
| apex → www | Vercel | 선행 | **적용 확인** | calqio.com → **307** (308 아님) |
| `/fire` redirect | `vercel.json` | 브랜치만 | **부분 적용** | 운영 **404**, 로컬 브랜치 301 추가 |
| 복리 로직 버그 | `ko/compound.html`, `common.js` | 선행 | **적용 확인** (운영) | 회귀 스크립트 |
| h1 / FAQ KO 8계산기 | ko/*.html | 선행 | **적용 확인** (운영) | — |
| AggregateRating 제거 | */*.html | grep 0 | **적용 확인** (운영) | 저장소 grep |
| Organization/WebSite | `index.html` | 선행 | **적용 확인** | — |
| fire SoftwareApplication | `*/fire.html` | 선행 | **적용 확인** | — |
| llms.txt | `/llms.txt` | 사용자 요청 생성 | **적용 확인** | — |
| privacy 개정 | `/privacy.html` | 브랜치 | **부분 적용** | 운영仍 2025-01·GA 문구 |
| 홈 복리/저장 설명 | `ko/index`, `index.html` | 브랜치 | **이번 적용** (미배포) | diff |
| FIRE/복리 가이드 5언어 | `*/fire.html`, compound | 브랜치 | **이번 적용** (미배포) | — |
| FX ‘실시간’ 문구 | `*/tax.html` | 브랜치 | **이번 적용** (미배포) | — |
| `scripts/verify-calculators.mjs` | repo | 브랜치 | **이번 적용** | `node scripts/…` |
| ads.txt | `/ads.txt` | 운영 | **적용 확인** | pub-8205853473793766 |
| AdSense 계정 승인 | 콘솔 | — | **확인 불가** | UNKNOWN |
