-- CreateTable
CREATE TABLE "api_lm_studio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "api_endpoint" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "novels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "novel_id" TEXT NOT NULL,
    "raw_content" TEXT NOT NULL,
    "vietnamese_content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "chapters_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "api_lm_studio_api_endpoint_key" ON "api_lm_studio"("api_endpoint");
