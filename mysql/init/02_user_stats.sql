SET NAMES 'utf8mb4';
SET CHARACTER SET utf8mb4;

/* 연속 접속 및 전체 통계 다룰 테이블 */
CREATE TABLE user_stats (
    user_id INT PRIMARY KEY,
    total_xp INT DEFAULT 0,           /* XP */
    current_streak INT DEFAULT 0,     /* 연속 접속일 */
    max_streak INT DEFAULT 0,         /* 역대 최고 연속 접속일 */
    last_login_date DATE,             /* 마지막 접속일 (스트릭 계산용) */
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

/* 사용자가 카드를 넘기거나 "학습 완료"를 누를 때마다 기록을 남길 테이블 */
CREATE TABLE study_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    slang_id INT,
    status ENUM('learning', 'mastered') DEFAULT 'learning', /* 학습 중 / 완료 */
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (slang_id) REFERENCES slangs(slang_id)
);

/* AI와 대화를 주고받을 때마다 카운트 */
CREATE TABLE ai_chat_logs (
    chat_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message_count INT DEFAULT 1,      /* 한 세션당 메시지 수 */
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);