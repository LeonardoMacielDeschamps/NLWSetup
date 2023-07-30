-- CreateTable
CREATE TABLE "habit_week_day" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "habitId" TEXT NOT NULL,
    "weekDay" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "day" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "day_habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayId" TEXT NOT NULL,
    "habitId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "habit_week_day_habitId_weekDay_key" ON "habit_week_day"("habitId", "weekDay");

-- CreateIndex
CREATE UNIQUE INDEX "day_date_key" ON "day"("date");

-- CreateIndex
CREATE UNIQUE INDEX "day_habit_dayId_habitId_key" ON "day_habit"("dayId", "habitId");
