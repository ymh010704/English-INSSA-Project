SET NAMES 'utf8mb4';
SET CHARACTER SET utf8mb4;

-- 북마크 테이블
-- 흐름 >> 퀴즈 풀다가 맘에 듦(혹은 다시 보고싶음) >> 북마크 클릭 >> Backend 거쳐서 DB 저장 >> 나중에 프론트에서 볼 수 있음
/* 6. 북마크 테이블 추가 (퀴즈 로직에서 필요) */
CREATE TABLE IF NOT EXISTS bookmarks (
    bookmark_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    slang_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- 외래키 설정
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_slang FOREIGN KEY (slang_id) REFERENCES slangs(slang_id) ON DELETE CASCADE,
    -- 중복 북마크 방지
    UNIQUE KEY unique_user_slang (user_id, slang_id)
);