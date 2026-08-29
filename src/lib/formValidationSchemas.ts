import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  arm: z.string().min(1, { message: "Arm/stream is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

const staffLoginFields = {
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
};

export const parentSchema = z.object(staffLoginFields);
export type ParentSchema = z.infer<typeof parentSchema>;

export const ownerSchema = z.object(staffLoginFields);
export type OwnerSchema = z.infer<typeof ownerSchema>;

export const accountantSchema = z.object(staffLoginFields);
export type AccountantSchema = z.infer<typeof accountantSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Lesson name is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], {
    message: "Day is required!",
  }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  classId: z.coerce.number({ message: "Class is required!" }),
  teacherId: z.string({ message: "Teacher is required!" }),
});
export type LessonSchema = z.infer<typeof lessonSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  startDate: z.coerce.date({ message: "Start date is required!" }),
  dueDate: z.coerce.date({ message: "Due date is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});
export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  score: z.coerce
    .number()
    .min(0, { message: "Score must be at least 0!" })
    .max(100, { message: "Score must be at most 100!" }),
  studentId: z.string().min(1, { message: "Student is required!" }),
  examId: z.coerce.number().optional(),
  assignmentId: z.coerce.number().optional(),
});
export type ResultSchema = z.infer<typeof resultSchema>;

export const attendanceSchema = z.object({
  id: z.coerce.number().optional(),
  date: z.coerce.date({ message: "Date is required!" }),
  present: z.coerce.boolean(),
  studentId: z.string().min(1, { message: "Student is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});
export type AttendanceSchema = z.infer<typeof attendanceSchema>;

export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  classId: z.coerce.number().optional(),
});
export type EventSchema = z.infer<typeof eventSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  date: z.coerce.date({ message: "Date is required!" }),
  classId: z.coerce.number().optional(),
});
export type AnnouncementSchema = z.infer<typeof announcementSchema>;

const FEE_CATEGORY_VALUES = [
  "TUITION",
  "PTA_LEVY",
  "DEVELOPMENT_LEVY",
  "EXAM_FEE",
  "TEXTBOOK",
  "UNIFORM",
  "FEEDING",
  "BOARDING",
  "TRANSPORT",
  "SPORTS_LEVY",
  "ICT_LEVY",
  "OTHER",
] as const;

export const feeStructureSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required!" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive!" }),
  session: z.string().min(1, { message: "Session is required!" }),
  term: z.enum(["FIRST", "SECOND", "THIRD"], { message: "Term is required!" }),
  category: z.enum(FEE_CATEGORY_VALUES, { message: "Category is required!" }),
  dueDate: z.coerce.date({ message: "Due date is required!" }),
  earlyDiscountPercent: z.coerce.number().min(0).max(100).optional(),
  earlyDiscountDeadline: z.coerce.date().optional(),
  latePenaltyPercent: z.coerce.number().min(0).max(100).optional(),
  latePenaltyGraceDays: z.coerce.number().int().min(0).optional(),
  gradeId: z.coerce.number({ message: "Grade is required!" }),
});
export type FeeStructureSchema = z.infer<typeof feeStructureSchema>;

export const feePaymentSchema = z.object({
  id: z.coerce.number().optional(),
  amount: z.coerce.number().positive({ message: "Amount must be positive!" }),
  date: z.coerce.date({ message: "Date is required!" }),
  method: z.enum(["CASH", "BANK_TRANSFER", "CARD", "ONLINE"], {
    message: "Method is required!",
  }),
  notes: z.string().optional(),
  invoiceId: z.coerce.number({ message: "Invoice is required!" }),
});
export type FeePaymentSchema = z.infer<typeof feePaymentSchema>;

export const generateInvoicesSchema = z.object({
  feeStructureId: z.coerce.number({ message: "Fee structure is required!" }),
});
export type GenerateInvoicesSchema = z.infer<typeof generateInvoicesSchema>;

export const installmentPlanSchema = z.object({
  invoiceId: z.coerce.number({ message: "Invoice is required!" }),
  parts: z.coerce.number().int().min(2).max(12),
});
export type InstallmentPlanSchema = z.infer<typeof installmentPlanSchema>;

export const waiverSchema = z.object({
  id: z.coerce.number().optional(),
  studentId: z.string().min(1, { message: "Student is required!" }),
  type: z.enum(["SCHOLARSHIP", "STAFF_DISCOUNT", "BURSARY", "OTHER"], {
    message: "Type is required!",
  }),
  percent: z.coerce.number().min(0).max(100).optional(),
  fixedAmount: z.coerce.number().positive().optional(),
  reason: z.string().min(1, { message: "Reason is required!" }),
  session: z.string().min(1, { message: "Session is required!" }),
});
export type WaiverSchema = z.infer<typeof waiverSchema>;

export const refundSchema = z.object({
  id: z.coerce.number().optional(),
  feePaymentId: z.coerce.number({ message: "Payment is required!" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive!" }),
  reason: z.string().min(1, { message: "Reason is required!" }),
});
export type RefundSchema = z.infer<typeof refundSchema>;

export const expenseSchema = z.object({
  id: z.coerce.number().optional(),
  category: z.string().min(1, { message: "Category is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive!" }),
  date: z.coerce.date({ message: "Date is required!" }),
});
export type ExpenseSchema = z.infer<typeof expenseSchema>;

export const incomeSchema = z.object({
  id: z.coerce.number().optional(),
  source: z.string().min(1, { message: "Source is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive!" }),
  date: z.coerce.date({ message: "Date is required!" }),
});
export type IncomeSchema = z.infer<typeof incomeSchema>;

export const gradingScaleSchema = z.object({
  id: z.coerce.number().optional(),
  grade: z.string().min(1, { message: "Grade label is required!" }),
  minScore: z.coerce.number().min(0).max(100),
  maxScore: z.coerce.number().min(0).max(100),
  remark: z.string().min(1, { message: "Remark is required!" }),
  order: z.coerce.number(),
});
export type GradingScaleSchema = z.infer<typeof gradingScaleSchema>;
