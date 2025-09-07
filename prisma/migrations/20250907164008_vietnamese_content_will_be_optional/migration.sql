-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chapters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "novel_id" TEXT NOT NULL,
    "raw_content" TEXT NOT NULL,
    "vietnamese_content" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "chapters_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_chapters" ("id", "novel_id", "order", "raw_content", "vietnamese_content") SELECT "id", "novel_id", "order", "raw_content", "vietnamese_content" FROM "chapters";
DROP TABLE "chapters";
ALTER TABLE "new_chapters" RENAME TO "chapters";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
