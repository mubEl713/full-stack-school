import { FeeCategory, SchoolSection } from "@prisma/client";

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

export const FEE_CATEGORY_LABEL: Record<FeeCategory, string> = {
  TUITION: "Tuition",
  PTA_LEVY: "PTA Levy",
  DEVELOPMENT_LEVY: "Development Levy",
  EXAM_FEE: "Exam Fee",
  TEXTBOOK: "Textbook",
  UNIFORM: "Uniform",
  FEEDING: "Feeding",
  BOARDING: "Boarding",
  TRANSPORT: "Transport",
  SPORTS_LEVY: "Sports Levy",
  ICT_LEVY: "ICT Levy",
  OTHER: "Other",
};

export const formatNaira = (amount: number) =>
  `₦${amount.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;

type FeeStructureLike = {
  earlyDiscountPercent?: number | null;
  earlyDiscountDeadline?: Date | null;
  latePenaltyPercent?: number | null;
  latePenaltyGraceDays?: number | null;
  dueDate?: Date | null;
};

/**
 * Computes what a student effectively owes on an invoice as of a given date,
 * applying the fee structure's early-payment discount or late-payment
 * penalty. This is a DISPLAY calculation only — the stored Invoice.amountDue
 * stays the canonical post-waiver base amount; this never mutates it.
 */
export const getEffectiveAmountOwed = (
  baseAmountDue: number,
  feeStructure: FeeStructureLike,
  asOfDate: Date = new Date()
): { amount: number; note?: string } => {
  const {
    earlyDiscountPercent,
    earlyDiscountDeadline,
    latePenaltyPercent,
    latePenaltyGraceDays,
    dueDate,
  } = feeStructure;

  if (
    earlyDiscountPercent &&
    earlyDiscountDeadline &&
    asOfDate <= earlyDiscountDeadline
  ) {
    const discounted = baseAmountDue * (1 - earlyDiscountPercent / 100);
    return {
      amount: Math.round(discounted * 100) / 100,
      note: `${earlyDiscountPercent}% early-payment discount applied`,
    };
  }

  if (latePenaltyPercent && dueDate) {
    const graceMs = (latePenaltyGraceDays || 0) * 24 * 60 * 60 * 1000;
    const penaltyStart = new Date(dueDate.getTime() + graceMs);
    if (asOfDate > penaltyStart) {
      const penalized = baseAmountDue * (1 + latePenaltyPercent / 100);
      return {
        amount: Math.round(penalized * 100) / 100,
        note: `${latePenaltyPercent}% late-payment penalty applied`,
      };
    }
  }

  return { amount: baseAmountDue };
};

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
