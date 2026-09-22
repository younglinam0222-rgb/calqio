# Calqio 적용 상태표 (2026-03-22)



| 항목 | 경로/대상 | 근거 | 상태 | 검증 |

|------|-----------|------|------|------|

| canonical/www | 전역 | main 이력 | **적용 확인** (운영) | curl www |

| sitemap/robots www | `/sitemap.xml`, `/robots.txt` | 선행 확인 | **적용 확인** | 운영 GET 200 |

| `/` → `/ko/` | `vercel.json` | 선행+운영 | **적용 확인** | www `/` → 308 `/ko/` |

| apex → www | Vercel | 선행 | **부분** | calqio.com → **307** (308 아님) |

| `/fire` redirect | `vercel.json` | 배포됨 | **적용 확인** (운영) | `/fire` → 308 `/ko/fire` |

| privacy 개정 | `/privacy` | main | **적용 확인** (운영) | 2026-03 본문 |

| ads.txt | `/ads.txt` | 운영 | **적용 확인** | pub-8205853473793766 |

| AdSense 사이트 심사 | AdSense 콘솔 | **첨부된 AdSense 반려 화면** | **반려 확인** | 사유: **가치가 별로 없는 콘텐츠** (Low value content). 반려 **날짜·문제 URL 목록은 화면에서 별도 기록하지 않음**. |

| AdSense 재신청 | 콘솔 | — | **미실행** | 콘텐츠 보강 후 운영자 재제출 |

| 콘텐츠 가치 보강 (FIRE/복리 5언어 등) | `*/fire.html`, compound, guides | `a36fa1c`+브랜치 | **로컬 반영** | `node scripts/verify-calculators.mjs` |
| privacy 5언어 (ko/en/ja/zh/ar) | `privacy.html` `#ko`~`#ar` | 저장소 | **완료 근거: 파일 내 섹션 존재** | 로컬 `privacy.html` |
| internal/ Vercel 배포 제외 | `.vercelignore` → `internal/` | 저장소 | **완료 근거: ignore 규칙** | `.vercelignore` 1행 |



**메모:** 기존 「운영자 설명에 따른 반려 사유·원문 미확인」→ **「첨부된 AdSense 화면에서 사유 확인」**으로 정정 (2026-03-22 세션).

