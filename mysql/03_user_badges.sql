SET NAMES 'utf8mb4';
SET CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_name VARCHAR(50) NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_badge (user_id, badge_name),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);