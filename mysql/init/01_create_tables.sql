/* docker 같은 환경 유지하려고 하는 초기화 테이블이라는데 음,,  */
/* mysql_data 볼륨이 이미 생성되면 실행 안된다니(초기에만 1회 실행) 알아두십소 */

/* ★ DB 구조나 내용 바뀌면 $ docker compose down -v 하고 다시 up 시키면 됩니다  // -v 옵션이 볼륨 지워줌 */

CREATE TABLE users (
  user_id int NOT NULL AUTO_INCREMENT,
  email varchar(100) NOT NULL unique,
  password varchar(100) NOT NULL,
  nickname varchar(50) DEFAULT NULL,
  is_verified tinyint(1) DEFAULT '0',
  created_at datetime DEFAULT current_timestamp,
  updated_at datetime DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
);