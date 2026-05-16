/* docker 환경 초기화 테이블 설정 */
/* ★ DB 구조나 내용 바뀌면 $ docker compose down -v 하고 다시 up 시키면 됩니다 */
/* SET FOREIGN_KEY_CHECKS = 0; 데이터 날아가서 복구할때 잠깐 썻습니다.
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS slangs;
*/
SET NAMES 'utf8mb4';
SET CHARACTER SET utf8mb4;

/* 1. 유저 테이블 생성 */
CREATE TABLE users (
  user_id int NOT NULL AUTO_INCREMENT,
  email varchar(100) NOT NULL unique,
  password varchar(100), /* 원래 NOT NULL 이었는데 소셜 로그인은 NULL 허용해야한다고 함 */
  nickname varchar(50) DEFAULT NULL,
  role tinyint(1) DEFAULT '0', /* 어드민 여부 */
  created_at datetime DEFAULT current_timestamp,
  updated_at datetime DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  sns_id VARCHAR(255), /* 소셜 로그인을 위해 추가 */
  provider VARCHAR(20) default 'local',
  PRIMARY KEY (user_id)
);

/* 초기 유저 데이터 삽입 (비밀번호: 1234) */
INSERT INTO users (email, password, nickname, role, provider) VALUES
('kim@google.com', '$2b$10$7vNIm6VlZf3l.uE3Xy5u/.X/g0/nE4jH8kG.U6/wH7p6V6m3G5.Kq', '김민우', 1, 'local'),
('yun@google.com', '$2b$10$7vNIm6VlZf3l.uE3Xy5u/.X/g0/nE4jH8kG.U6/wH7p6V6m3G5.Kq', '윤민혁', 1, 'local'),
('doodoo@google.com', '$2b$10$7vNIm6VlZf3l.uE3Xy5u/.X/g0/nE4jH8kG.U6/wH7p6V6m3G5.Kq', '김두현', 1, 'local'),
('lee@google.com', '$2b$10$7vNIm6VlZf3l.uE3Xy5u/.X/g0/nE4jH8kG.U6/wH7p6V6m3G5.Kq', '이경현', 0, 'local'),
('che@google.com', '$2b$10$7vNIm6VlZf3l.uE3Xy5u/.X/g0/nE4jH8kG.U6/wH7p6V6m3G5.Kq', '이채영', 0, 'local'),
('admin@google.com', '$2b$10$7vNIm6VlZf3l.uE3Xy5u/.X/g0/nE4jH8kG.U6/wH7p6V6m3G5.Kq', '관리자', 1, 'local');

/* 2. 슬랭 테이블 생성 */
CREATE TABLE slangs (
    slang_id INT NOT NULL AUTO_INCREMENT,
    word VARCHAR(100) NOT NULL UNIQUE,
    definition_en TEXT,
    definition_ko TEXT,
    example_en TEXT,
    example_ko TEXT,
    category VARCHAR(50) DEFAULT 'Etc',
    emoji varchar(50) DEFAULT '👍',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (slang_id)
);

/* 슬랭 초기 데이터 삽입 */
INSERT INTO slangs (word, definition_en, definition_ko, example_en, example_ko) VALUES
('Ghosting', 'Suddenly cutting off all communication with someone.', '상대방의 연락을 갑자기 끊고 잠수 타는 것을 의미해요.', 'I thought we had a great date, but then he started ghosting me.', '데이트 잘 했다고 생각했는데, 그 사람이 갑자기 잠수 탔어.'),
('Sus', 'Short for suspicious; giving the impression that something is questionable.', '수상쩍거나 의심스러울 때 쓰는 표현이에요.', 'That deal seems a bit sus, don’t you think?', '그 거래 좀 수상해 보이지 않아?'),
('No cap', 'To emphasize that you are telling the truth; no lie.', '진심으로, 거짓말 아니고 진짜라는 뜻이에요.', 'I just saw a celebrity at the convenience store, no cap!', '나 방금 편의점에서 연예인 봤어, 진짜 구라 아니야!'),
('Rizz', 'Ability to attract a romantic partner; charisma.', '이성을 끄는 매력이나 끼를 부리는 능력.', 'He’s got so much rizz, everyone is looking at him.', '그 사람 진짜 리즈가 넘쳐서 다들 쳐다보더라.'),
('Vibe check', 'Assessing the energy or mood of a person or place.', '분위기 파악이나 기분 체크.', 'Hold on, we need a quick vibe check before we start the party.', '잠깐, 파티 시작하기 전에 분위기 체크 좀 하고 가자.'),
('Flex', 'To show off your belongings or success.', '자신의 부나 성공을 뽐낼 때 써요.', 'Stop trying to flex with your new watch.', '새 시계 샀다고 너무 뽐내지 마.'),
('Slay', 'Doing something exceptionally well; being impressive.', '완전 죽여준다, 찢었다라는 뜻.', 'You absolutely slayed that presentation!', '너 이번 발표 진짜 찢었어!'),
('Stan', 'To be an extremely devoted fan of someone.', '덕질을 의미해요.', 'I totally stan this new K-pop group.', '나 이 신인 아이돌 그룹 완전 덕질 중이야.'),
('Tea', 'Gossip or interesting news.', '가십이나 뒷담화. "Spill the tea"는 "썰 풀어봐"라는 뜻.', 'Did you hear the tea about their breakup?', '걔네 헤어졌다는 썰 들었어?'),
('Bet', 'A term used to express agreement or confirmation.', '어, 그래!, 당연하지! 처럼 쿨한 동의.', 'A: Want to go grab some pizza? B: Bet!', 'A: 피자 먹으러 갈래? B: 콜!'),
('Main character energy', 'Someone who behaves like they are the protagonist.', '인생의 주인공인 것처럼 자신감 넘치는 에너지.', 'She walked into the room with major main character energy.', '그녀는 주인공 포스를 풍기며 방으로 들어왔어.'),
('Rent free', 'When you can’t stop thinking about something.', '머릿속에서 떠나질 않을 때 써요.', 'That song has been living in my head rent free all day.', '그 노래가 하루 종일 머릿속에서 계속 맴돌아.');

/*SET FOREIGN_KEY_CHECKS = 1; 이것도 위에거랑 같은것임 */