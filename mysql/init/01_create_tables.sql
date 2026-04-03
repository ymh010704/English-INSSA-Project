/* docker 같은 환경 유지하려고 하는 초기화 테이블이라는데 음,,  */
/* mysql_data 볼륨이 이미 생성되면 실행 안된다니(초기에만 1회 실행) 알아두십소 */

/* ★ DB 구조나 내용 바뀌면 $ docker compose down -v 하고 다시 up 시키면 됩니다  // -v 옵션이 볼륨 지워줌 */
SET NAMES 'utf8mb4';
SET CHARACTER SET utf8mb4;

CREATE TABLE users (
  user_id int NOT NULL AUTO_INCREMENT,
  email varchar(100) NOT NULL unique,
  password varchar(100) NOT NULL,
  nickname varchar(50) DEFAULT NULL,
  is_verified tinyint(1) DEFAULT '0', /* 일단 요게 어드민 여부 확인할거.. */
  created_at datetime DEFAULT current_timestamp,
  updated_at datetime DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
);

/* 비밀번호 1234 */
INSERT INTO users (email, password, nickname, is_verified) VALUES
('yun@google.com', '$2b$10$7vNIm6VlZf3l.uE3Xy5u/.X/g0/nE4jH8kG.U6/wH7p6V6m3G5.Kq', '윤민혁', 1),
('doodoo@google.com', '$2b$10$7vNIm6VlZf3l.uE3Xy5u/.X/g0/nE4jH8kG.U6/wH7p6V6m3G5.Kq', '김두현', 1),
('lee@google.com', '$2b$10$7vNIm6VlZf3l.uE3Xy5u/.X/g0/nE4jH8kG.U6/wH7p6V6m3G5.Kq', '이경현', 0),
('kim@google.com', '$2b$10$7vNIm6VlZf3l.uE3Xy5u/.X/g0/nE4jH8kG.U6/wH7p6V6m3G5.Kq', '김민우', 1),
('che@google.com', '$2b$10$7vNIm6VlZf3l.uE3Xy5u/.X/g0/nE4jH8kG.U6/wH7p6V6m3G5.Kq', '이채영', 0);


/* 슬랭 테이블 생성 */
CREATE TABLE slangs (
    slang_id INT NOT NULL AUTO_INCREMENT,
    word VARCHAR(100) NOT NULL UNIQUE,
    definition_en TEXT,
    definition_ko TEXT,
    example_en TEXT,
    example_ko TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (slang_id)
);

/* 슬랭 초기 데이터 삽입 */
INSERT INTO slangs (word, definition_en, definition_ko, example_en, example_ko) VALUES
('Ghosting', 'Suddenly cutting off all communication with someone.', '상대방의 연락을 갑자기 끊고 잠수 타는 것을 의미해요.', 'I thought we had a great date, but then he started ghosting me.', '데이트 잘 했다고 생각했는데, 그 사람이 갑자기 잠수 탔어.'),
('Sus', 'Short for suspicious; giving the impression that something is questionable.', '수상쩍거나 의심스러울 때 쓰는 표현이에요.', 'That deal seems a bit sus, don’t you think?', '그 거래 좀 수상해 보이지 않아?'),
('No cap', 'To emphasize that you are telling the truth; no lie.', '진심으로, 거짓말 아니고 진짜라는 뜻이에요. 예전엔 거짓말을 "Cap"이라고 불렀던 데서 유래했어요.', 'I just saw a celebrity at the convenience store, no cap!', '나 방금 편의점에서 연예인 봤어, 진짜 구라 아니야!'),
('Rizz', 'Ability to attract a romantic partner; charisma.', '이성을 끄는 매력이나 끼를 부리는 능력을 말해요. Charisma의 중간 글자에서 따온 신조어입니다.', 'He’s got so much rizz, everyone is looking at him.', '그 사람 진짜 리즈가 넘쳐서 다들 쳐다보더라.'),
('Vibe check', 'Assessing the energy or mood of a person or place.', '분위기 파악이나 기분 체크를 뜻해요. 갑자기 분위기를 띄우거나 확인할 때 쓰기도 합니다.', 'Hold on, we need a quick vibe check before we start the party.', '잠깐, 파티 시작하기 전에 분위기 체크 좀 하고 가자.'),
('Flex', 'To show off your belongings or success.', '자신의 부나 성공을 뽐낼 때 써요. 한국에서도 이미 많이 쓰이는 단어죠!', 'Stop trying to flex with your new watch.', '새 시계 샀다고 너무 뽐내지 마.'),
('Slay', 'Doing something exceptionally well; being impressive.', '완전 죽여준다, 찢었다라는 뜻이에요. 멋진 성과를 냈거나 옷을 잘 입었을 때 써요.', 'You absolutely slayed that presentation!', '너 이번 발표 진짜 찢었어!'),
('Stan', 'To be an extremely devoted fan of someone.', '누군가의 열렬한 팬, 즉 "덕질"을 의미해요. 에미넴의 노래 제목에서 유래됐죠.', 'I totally stan this new K-pop group.', '나 이 신인 아이돌 그룹 완전 덕질 중이야.'),
('Tea', 'Gossip or interesting news.', '가십이나 흥미로운 뒷담화, 소문을 말해요. "Spill the tea"라고 하면 "썰 좀 풀어봐"라는 뜻입니다.', 'Did you hear the tea about their breakup?', '걔네 헤어졌다는 썰 들었어?'),
('Bet', 'A term used to express agreement or confirmation.', '어, 그래!, 당연하지! 처럼 수락이나 동의를 할 때 쿨하게 쓰는 표현이에요.', 'A: Want to go grab some pizza? B: Bet!', 'A: 피자 먹으러 갈래? B: 콜!'),
('Main character energy', 'Someone who behaves like they are the protagonist of their own life.', '자기가 인생의 주인공인 것처럼 자신감 넘치게 행동하는 긍정적인 에너지를 말해요.', 'She walked into the room with major main character energy.', '그녀는 주인공 포스를 팍팍 풍기며 방으로 들어왔어.'),
('Rent free', 'When you can’t stop thinking about something or someone.', '머릿속에서 떠나질 않을 때 써요. "내 머릿속에 월세도 안 내고 살고 있다"는 뜻이죠.', 'That song has been living in my head rent free all day.', '그 노래가 하루 종일 머릿속에서 계속 맴돌아.');