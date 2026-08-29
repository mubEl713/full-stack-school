import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";
import { formatGradeName } from "@/lib/utils";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "owner"
    | "accountant"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "feeStructure"
    | "feePayment"
    | "expense"
    | "income"
    | "gradingScale";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "class":
        const classGradesRaw = await prisma.grade.findMany({
          select: { id: true, section: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = {
          teachers: classTeachers,
          grades: classGradesRaw.map((g) => ({
            id: g.id,
            name: formatGradeName(g.section, g.level),
          })),
        };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      case "student":
        const studentGradesRaw = await prisma.grade.findMany({
          select: { id: true, section: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = {
          classes: studentClasses,
          grades: studentGradesRaw.map((g) => ({
            id: g.id,
            name: formatGradeName(g.section, g.level),
          })),
        };
        break;
      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: examLessons };
        break;
      case "lesson":
        const [lessonSubjects, lessonClasses, lessonTeachers] =
          await Promise.all([
            prisma.subject.findMany({ select: { id: true, name: true } }),
            prisma.class.findMany({ select: { id: true, name: true } }),
            prisma.teacher.findMany({
              select: { id: true, name: true, surname: true },
            }),
          ]);
        relatedData = {
          subjects: lessonSubjects,
          classes: lessonClasses,
          teachers: lessonTeachers,
        };
        break;
      case "assignment":
        const assignmentLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: assignmentLessons };
        break;
      case "result":
        const [resultStudents, resultExams, resultAssignments] =
          await Promise.all([
            prisma.student.findMany({
              select: { id: true, name: true, surname: true },
            }),
            prisma.exam.findMany({ select: { id: true, title: true } }),
            prisma.assignment.findMany({ select: { id: true, title: true } }),
          ]);
        relatedData = {
          students: resultStudents,
          exams: resultExams,
          assignments: resultAssignments,
        };
        break;
      case "attendance":
        const [attendanceStudents, attendanceLessons] = await Promise.all([
          prisma.student.findMany({
            select: { id: true, name: true, surname: true },
          }),
          prisma.lesson.findMany({ select: { id: true, name: true } }),
        ]);
        relatedData = {
          students: attendanceStudents,
          lessons: attendanceLessons,
        };
        break;
      case "event":
        const eventClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: eventClasses };
        break;
      case "announcement":
        const announcementClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: announcementClasses };
        break;
      case "feeStructure":
        const feeGradesRaw = await prisma.grade.findMany({
          select: { id: true, section: true, level: true },
        });
        relatedData = {
          grades: feeGradesRaw.map((g) => ({
            id: g.id,
            name: formatGradeName(g.section, g.level),
          })),
        };
        break;
      case "feePayment":
        const [feePaymentStudents, feeStructures] = await Promise.all([
          prisma.student.findMany({
            select: { id: true, name: true, surname: true },
          }),
          prisma.feeStructure.findMany({
            select: { id: true, name: true, amount: true },
          }),
        ]);
        relatedData = {
          students: feePaymentStudents,
          feeStructures,
        };
        break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
