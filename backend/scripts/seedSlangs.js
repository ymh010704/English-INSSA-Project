// 슬랭 데이터(JSON 파일) db에 넣어주기
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../src/repositories/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 다른 json 파일 업로드 할거면 jsonPath 변경해주면 됩닏너
const jsonPath = path.join(__dirname, "../../data_pipeline/output/service_public_approved.json");
const rawData = fs.readFileSync(jsonPath, "utf-8");
const slangs = JSON.parse(rawData);

async function seedSlangs() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const item of slangs) {
      const {
        word,
        definition_en,
        definition_ko,
        example_en,
        example_ko,
        category = "Etc",
        emoji = "👍",
        shorts_url = null,
      } = item;

      const categoryValue = Array.isArray(category)
        ? category[0] || "Etc"
        : category || "Etc";

      const emojiValue = emoji || "👍";

      await connection.execute(
        `
        INSERT INTO slangs
          (
            word,
            definition_en,
            definition_ko,
            example_en,
            example_ko,
            category,
            emoji,
            shorts_url
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          definition_en = VALUES(definition_en),
          definition_ko = VALUES(definition_ko),
          example_en = VALUES(example_en),
          example_ko = VALUES(example_ko),
          category = VALUES(category),
          emoji = VALUES(emoji),
          shorts_url = VALUES(shorts_url)
        `,
        [
          word,
          definition_en,
          definition_ko,
          example_en,
          example_ko,
          categoryValue,
          emojiValue,
          shorts_url,
        ]
      );
    }

    await connection.commit();
    console.log(`${slangs.length}개의 슬랭 데이터가 저장되었습니다.`);
  } catch (error) {
    await connection.rollback();
    console.error("슬랭 데이터 저장 실패:", error);
  } finally {
    connection.release();
    process.exit();
  }
}

seedSlangs();