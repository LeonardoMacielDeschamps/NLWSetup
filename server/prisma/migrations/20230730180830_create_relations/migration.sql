-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_habit_week_day" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "habitId" TEXT NOT NULL,
    "weekDay" INTEGER NOT NULL,
    CONSTRAINT "habit_week_day_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_habit_week_day" ("habitId", "id", "weekDay") SELECT "habitId", "id", "weekDay" FROM "habit_week_day";
DROP TABLE "habit_week_day";
ALTER TABLE "new_habit_week_day" RENAME TO "habit_week_day";
CREATE UNIQUE INDEX "habit_week_day_habitId_weekDay_key" ON "habit_week_day"("habitId", "weekDay");
CREATE TABLE "new_day_habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayId" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    CONSTRAINT "day_habit_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "day_habit_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "day" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_day_habit" ("dayId", "habitId", "id") SELECT "dayId", "habitId", "id" FROM "day_habit";
DROP TABLE "day_habit";
ALTER TABLE "new_day_habit" RENAME TO "day_habit";
CREATE UNIQUE INDEX "day_habit_dayId_habitId_key" ON "day_habit"("dayId", "habitId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
