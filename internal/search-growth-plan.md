# CALQIO 검색 유입 개선 기록 — 2026-09-25

## 실제 조사와 해석
Google Trends 대한민국·지난 12개월·웹 검색의 동일 비교 평균 지수: 이자 계산기 61, 연봉 계산기 55, 취득세 계산기 9, 연차수당 계산기 1, 중개수수료 계산기 0.
https://trends.google.com/trends/explore?date=today%2012-m&geo=KR&q=연봉%20계산기,중개수수료%20계산기,취득세%20계산기,연차수당%20계산기,이자%20계산기&hl=ko
월간 검색 횟수가 아니며 다른 비교의 지수와 직접 비교할 수 없다. 0은 검색 부재가 아니라 표본 부족/반올림일 수 있다. 검색 난이도·유입·수익 추정치를 조사한 것은 아니다.

## 이번 적용
- 로또 최신/최근 100회 회차 선택과 내 번호 비교. 번호는 로컬 브라우저에서만 계산, 별도 저장/전송하지 않음.
- 로또 제목·본문·description·canonical·OG·WebApplication 메타데이터와 사이트맵 등록.
- 홈에서 당첨번호 확인 도구와 단리·복리 이자 비교 기능의 용도를 명확히 표현.
- 5개 언어 홈의 canonical/hreflang 및 사이트맵을 끝 슬래시 없는 최종 주소와 일치. 루트 이동 한 번으로 단축.
- 실제 FAQ/출처/갱신 실패 안내 제공. 허위 평점·당첨 보장·빈 회차 페이지 대량 생성 없음.

## 먼저 등록/확인할 검색 관리 도구 (백링크가 아님)
1. Google Search Console: https://search.google.com/search-console — 소유 확인 후 sitemap.xml 제출, 로또 URL 검사 및 색인 요청, 28일 단위 클릭·노출·검색어 비교.
2. 네이버 서치어드바이저: https://searchadvisor.naver.com — 소유 확인 후 웹마스터 도구의 요청 > 사이트맵 제출.
3. Bing Webmaster Tools: https://www.bing.com/webmasters — 소유 확인 후 사이트맵 제출.
제출 주소: https://www.calqio.com/sitemap.xml
관리자 계정에 접속하거나 등록을 완료한 상태는 아니다. 색인·상위 노출은 보장되지 않는다.

## 관련 있는 소개 채널 (외부 게시하지 않은 제안)
- 운영자 네이버 블로그·티스토리: 실제 입력 사례와 계산 과정, 한계, 스크린샷을 포함한 사용 가이드에서 해당 도구로 연결. 동일 글 복붙 대신 채널 독자에게 맞는 설명.
- 관련 재테크·부동산·급여 커뮤니티: 해당 게시판이 자작 도구 소개를 허용하는지 먼저 확인. 운영자임을 밝히고 질문에 실질적인 답과 관련 페이지 링크 제공. 무관한 댓글 도배 금지.
- 관련 글을 쓰는 블로거/뉴스레터: 독자에게 도움이 될 예제·검증 근거를 제공해 자발적 인용을 요청. 아직 요청 메시지를 보내지 않음.
- 공개 GitHub 저장소 README/프로젝트 Website: 실제 프로젝트 소개와 실사용 URL을 연결하는 후보. 검색 순위용 링크 교환이 아닌 개발/검증 내용을 제공.
품질과 맥락을 우선한다. 링크 구매·자동 생성·과도한 맞교환은 피한다. 외부 사이트에서 nofollow/ugc 처리하더라도 실제 독자 유입은 가능하나 순위 효과를 약속할 수 없다.

## 소개글 초안 — 사용자가 검토 후 게시
제목: 최근 로또 결과와 내 번호를 한 화면에서 비교하는 무료 도구를 만들었습니다
본문: CALQIO를 운영하고 있습니다. 공식 결과의 최근 100회를 선택해 내 번호 6개를 비교하고, 함께 나온 번호와 합계 통계를 확인할 수 있도록 만들었습니다. 내 번호는 브라우저에서만 비교하며, 공식 조회 실패 시 최신인 것처럼 표시하지 않습니다. 패턴 점수는 당첨 확률이 아닙니다. 이용해 보시고 불편한 점을 알려주시면 개선하겠습니다.
링크: https://www.calqio.com/ko/lotto-generator

제목: 같은 금리인데 단리와 복리 이자가 달라지는 이유
본문 방향: 입력 원금·금리·기간·납입 시점을 먼저 공개하고 단리와 복리 차이를 실제 예제로 설명. 계산 결과와 적용 가정을 함께 보여준 뒤 CALQIO 비교 도구로 연결.
링크: https://www.calqio.com/ko/simple-vs-compound

## 다음 개발 후보
연봉 실수령액·퇴직금은 관심도와 사이트 연관성이 있지만 공제·과세·근로 조건의 검증 및 기준연도 관리가 선행되어야 한다. 이번에 구현한 것으로 표시하지 않는다.

## 공식 근거
- https://developers.google.com/search/docs/essentials
- https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- https://developers.google.com/search/docs/essentials/spam-policies
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- https://searchadvisor.naver.com/guide/request-feed
- https://www.dhlottery.co.kr/lt645/result
