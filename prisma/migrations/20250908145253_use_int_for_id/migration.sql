/*
  Warnings:

  - The primary key for the `api_lm_studio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `api_lm_studio` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `chapters` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `chapters` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `novel_id` on the `chapters` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `novels` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `novels` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_api_lm_studio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "api_endpoint" TEXT NOT NULL
);
INSERT INTO "new_api_lm_studio" ("api_endpoint", "id") SELECT "api_endpoint", "id" FROM "api_lm_studio";
DROP TABLE "api_lm_studio";
ALTER TABLE "new_api_lm_studio" RENAME TO "api_lm_studio";
CREATE UNIQUE INDEX "api_lm_studio_api_endpoint_key" ON "api_lm_studio"("api_endpoint");
CREATE TABLE "new_chapters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "novel_id" INTEGER NOT NULL,
    "raw_content" TEXT NOT NULL,
    "vietnamese_content" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "chapters_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_chapters" ("id", "novel_id", "order", "raw_content", "vietnamese_content") SELECT "id", "novel_id", "order", "raw_content", "vietnamese_content" FROM "chapters";
DROP TABLE "chapters";
ALTER TABLE "new_chapters" RENAME TO "chapters";
CREATE TABLE "new_novels" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL
);
INSERT INTO "new_novels" ("id", "title") SELECT "id", "title" FROM "novels";
DROP TABLE "novels";
ALTER TABLE "new_novels" RENAME TO "novels";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
