## 🛠️ 개발 환경 동기화 가이드
메인 브랜치 업데이트 후, 로컬 환경에서 정상적인 화면 출력을 위해 아래 과정을 반드시 수행해 주세요.

1. 패키지 및 정적 파일 빌드:
   `npm install` 후 `npm run build`를 실행하여 `dist` 폴더를 생성합니다.
   
2. 도커 컨테이너 재빌드:
   `docker compose down` 후 `docker compose up -d --build`를 실행하여 수정된 Nginx 및 서버 설정을 반영합니다.
   
3. 접속 확인:
   `http://localhost`에서 리액트 메인 화면이 뜨는지 확인해주세요.


## 에러 날 때
1. `npm install`부터 에러가 난다
   > 폴더 위치(파일 위치) 체크하기

2. `docker compose up -d --build`가 안 된다
   > .env 파일이 없어서 생긴 문제일 수 있음
   > `cp .env.example .env` ㄱㄱ