# 환율타이밍 · 일본 매장 3초 쇼핑 판정기

PLAF 데모데이 프로젝트. 일본 매장에서 가격표만 넣으면 한국보다 싼지 판정하고, 쿠폰·택스프리 환급·$800 면세 한도·세관 신고까지 계산해요. 파일 하나(`index.html`)로 돌아가요.

## 배포 (GitHub Pages, 무료)
1. GitHub에서 새 저장소를 만들어요 (Public).
2. 이 폴더의 파일을 전부 올려요. 웹에서 "Add file → Upload files"로 끌어다 놓으면 돼요. `.github` 폴더도 같이 올려야 환율 알림이 작동해요.
3. 저장소 Settings → Pages → Source를 "Deploy from a branch", Branch를 `main` / `/ (root)`로 저장해요.
4. 1~2분 뒤 `https://아이디.github.io/저장소이름/` 주소가 생겨요.

## 환율 알림 켜기
- 배포만 하면 평일 아침마다 자동으로 확인해요. 목표 환율은 `.github/workflows/fx-alert.yml`의 `TARGET` 숫자를 바꾸면 돼요.
- Actions 탭 → "엔화 환율 알림" → "Run workflow"로 바로 시험해 볼 수 있어요.
- 목표 이하가 되면 저장소에 이슈가 열리고, GitHub가 저장소 주인에게 이메일을 보내요. 이 알림은 저장소 주인(나)만 받아요. 모든 사용자에게 보내려면 로그인과 서버가 필요해요.

## 국내 최저가 자동 검색 켜기 (선택)
상품 이름을 넣으면 네이버 쇼핑 최저가 후보를 보여 주고, 고르면 한국 가격이 채워져요. API 키를 숨기려고 Cloudflare Worker를 하나 거쳐요 (무료).
1. developers.naver.com → 애플리케이션 등록 → 사용 API에서 **검색**을 고르고, 서비스 URL에 `https://happyboy412.github.io`를 넣어요. Client ID와 Client Secret이 나와요.
2. dash.cloudflare.com → Workers & Pages → Create → Worker를 만들고, `worker/naver-shop.js` 내용을 붙여 넣어 Deploy해요.
3. 그 Worker의 Settings → Variables and Secrets에서 `NAVER_ID`, `NAVER_SECRET`을 **Secret**으로 넣어요. 키는 여기에만 두고 다른 곳(채팅, 저장소)에 올리지 마세요.
4. Worker 주소(`https://이름.아이디.workers.dev`)를 `index.html`의 `const KR_API = "";` 안에 넣고 저장해요.
- 끄려면 `KR_API`를 다시 비우면 돼요. 비어 있으면 "국내 최저가 찾기" 버튼이 네이버 쇼핑 검색 페이지를 열어요.
- 검색 결과는 비슷한 다른 모델이 섞일 수 있어서, 사용자가 직접 골라야 가격이 들어가요.

## 이용 통계 켜기 (선택)
1. goatcounter.com에서 무료 계정을 만들어요 (쿠키·개인정보 없이 집계).
2. `index.html`에서 `const GOATCOUNTER = "";`를 찾아 `"https://내코드.goatcounter.com/count"`를 넣어요.
3. 페이지 방문과 "담기·상품 선택·바깥 링크 클릭" 같은 버튼 횟수가 집계돼요.

## 제휴 링크 바꾸기
`index.html`에서 `prep-hotel`, `airalo.com` 등 링크를 제휴 프로그램에서 받은 추적 링크로 바꾸고, 화면의 "실제 링크 · 제휴 아님" 문구를 "제휴 링크 포함"으로 바꿔요.

## 데이터 기준
가격·쿠폰·세율은 2026-11-25 확인 기준이에요. 등록 상품은 14개이고, 국내가가 없는 상품은 "이 금액보다 국내가 비싸면 이득"으로 보여 줘요. 근거는 앱 맨 아래 "근거와 가정"에 링크로 정리돼 있어요.
