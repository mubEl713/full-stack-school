import { SchoolSection } from "@prisma/client";

export const ARMS_BY_SECTION: Record<SchoolSection, string[]> = {
  PRIMARY: ["A", "B", "C"],
  JSS: ["A", "B", "C"],
  SSS: ["Science", "Art", "Commercial"],
};

const SECTION_LABEL: Record<SchoolSection, string> = {
  PRIMARY: "Primary",
  JSS: "JSS",
  SSS: "SS",
};

export const formatGradeName = (section: SchoolSection, level: number) =>
  `${SECTION_LABEL[section]} ${level}`;

export const getGradeForScore = <
  T extends { minScore: number; maxScore: number; grade: string; remark: string }
>(
  score: number,
  scales: T[]
): T | undefined => scales.find((s) => score >= s.minScore && score <= s.maxScore);

// IT APPEARS THAT BIG CALENDAR SHOWS THE LAST WEEK WHEN THE CURRENT DAY IS A WEEKEND.
// FOR THIS REASON WE'LL GET THE LAST WEEK AS THE REFERENCE WEEK.
// IN THE TUTORIAL WE'RE TAKING THE NEXT WEEK AS THE REFERENCE WEEK.

const getLatestMonday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const latestMonday = today;
  latestMonday.setDate(today.getDate() - daysSinceMonday);
  return latestMonday;
};

export const adjustScheduleToCurrentWeek = (
  lessons: { title: string; start: Date; end: Date }[]
): { title: string; start: Date; end: Date }[] => {
  const latestMonday = getLatestMonday();

  return lessons.map((lesson) => {
    const lessonDayOfWeek = lesson.start.getDay();

    const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;

    const adjustedStartDate = new Date(latestMonday);

    adjustedStartDate.setDate(latestMonday.getDate() + daysFromMonday);
    adjustedStartDate.setHours(
      lesson.start.getHours(),
      lesson.start.getMinutes(),
      lesson.start.getSeconds()
    );
    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(
      lesson.end.getHours(),
      lesson.end.getMinutes(),
      lesson.end.getSeconds()
    );

    return {
      title: lesson.title,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
  });
};
