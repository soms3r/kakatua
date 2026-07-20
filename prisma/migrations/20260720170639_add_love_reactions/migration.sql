-- CreateTable
CREATE TABLE "culture_card_likes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "culture_card_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "culture_card_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "culture_card_likes_culture_card_id_fkey" FOREIGN KEY ("culture_card_id") REFERENCES "culture_cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_culture_cards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "detailed_content" TEXT,
    "love_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "culture_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_culture_cards" ("created_at", "data", "detailed_content", "id", "updated_at", "user_id") SELECT "created_at", "data", "detailed_content", "id", "updated_at", "user_id" FROM "culture_cards";
DROP TABLE "culture_cards";
ALTER TABLE "new_culture_cards" RENAME TO "culture_cards";
CREATE UNIQUE INDEX "culture_cards_user_id_key" ON "culture_cards"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "culture_card_likes_user_id_culture_card_id_key" ON "culture_card_likes"("user_id", "culture_card_id");
