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
   >



화이팅


## 🏅 뱃지 시스템 (2025-05 추가)

### 새로 추가된 파일
- `backend/src/services/badge.service.js` — 뱃지 조건 평가 + DB 저장 로직
- `backend/src/controllers/badge.controller.js` — 뱃지 API 컨트롤러
- `mysql/init/03_user_badges.sql` — user_badges 테이블 생성 쿼리

### API
- `GET /api/dashboard/badges` — 로그인한 유저의 획득 뱃지 목록 반환 (JWT 필요)

### DB 설정 방법

**DB가 없는 경우 (처음 실행)**
```bash
docker compose up -d
```
`03_user_badges.sql`이 자동으로 실행됩니다.

**이미 DB가 있는 경우 (기존에 쓰던 볼륨이 있을 때)**

방법 1 — DB 초기화 (데이터 날아감 주의)
```bash
docker compose down -v
docker compose up -d
```

방법 2 — 테이블만 수동 추가 (데이터 유지)
```bash
docker compose exec mysql mysql -uroot -proot1234 slang_db -e "
CREATE TABLE IF NOT EXISTS user_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  badge_name VARCHAR(50) NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_badge (user_id, badge_name),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);"
```

### 뱃지 종류 및 조건
| 뱃지 | 조건 |
|------|------|
| 7일 연속 | 7일 연속 학습 |
| 첫 10개 | 슬랭 10개 학습 |
| 스피드 러너 | 하루 10개 학습 |
| 야간 학습 | 밤 11시 이후 학습 |
| 퍼펙트 스코어 | 연습 정확도 100% |
| 30일 연속 | 30일 연속 학습 |
| 올라운더 | 모든 카테고리 50% 이상 학습 |
| 100개 달성 | 슬랭 100개 학습 |
| AI 마스터 | AI 대화 50회 |
