"use server";

import { revalidatePath } from "next/cache";
import {
  AccountantSchema,
  AnnouncementSchema,
  AssignmentSchema,
  AttendanceSchema,
  ClassSchema,
  EventSchema,
  ExamSchema,
  ExpenseSchema,
  FeePaymentSchema,
  FeeStructureSchema,
  GradingScaleSchema,
  IncomeSchema,
  LessonSchema,
  OwnerSchema,
  ParentSchema,
  RefundSchema,
  ResultSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  WaiverSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient, auth } from "@clerk/nextjs/server";
import { logAudit } from "./audit";

type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    const subject = await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });
    await logAudit("CREATE", "Subject", subject.id, data);

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });
    await logAudit("UPDATE", "Subject", data.id!, data);

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });
    await logAudit("DELETE", "Subject", id);

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    const classItem = await prisma.class.create({
      data,
    });
    await logAudit("CREATE", "Class", classItem.id, data);

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });
    await logAudit("UPDATE", "Class", data.id!, data);

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });
    await logAudit("DELETE", "Class", id);

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"teacher"}
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    await logAudit("CREATE", "Teacher", user.id, { ...data, password: undefined });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    await logAudit("UPDATE", "Teacher", data.id, { ...data, password: undefined });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });
    await logAudit("DELETE", "Teacher", id);

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"student"}
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    await logAudit("CREATE", "Student", user.id, { ...data, password: undefined });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    await logAudit("UPDATE", "Student", data.id, { ...data, password: undefined });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });
    await logAudit("DELETE", "Student", id);

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    const exam = await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    await logAudit("CREATE", "Exam", exam.id, data);

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    await logAudit("UPDATE", "Exam", data.id!, data);

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });
    await logAudit("DELETE", "Exam", id);

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- PARENT ----------

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent" },
    });

    await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || "",
        address: data.address,
      },
    });
    await logAudit("CREATE", "Parent", user.id, { ...data, password: undefined });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.parent.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || "",
        address: data.address,
      },
    });
    await logAudit("UPDATE", "Parent", data.id, { ...data, password: undefined });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);
    await prisma.parent.delete({ where: { id } });
    await logAudit("DELETE", "Parent", id);

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- OWNER ----------

export const createOwner = async (
  currentState: CurrentState,
  data: OwnerSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "owner" },
    });

    await prisma.owner.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
      },
    });
    await logAudit("CREATE", "Owner", user.id, { ...data, password: undefined });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateOwner = async (
  currentState: CurrentState,
  data: OwnerSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.owner.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
      },
    });
    await logAudit("UPDATE", "Owner", data.id, { ...data, password: undefined });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteOwner = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);
    await prisma.owner.delete({ where: { id } });
    await logAudit("DELETE", "Owner", id);

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- ACCOUNTANT ----------

export const createAccountant = async (
  currentState: CurrentState,
  data: AccountantSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "accountant" },
    });

    await prisma.accountant.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
      },
    });
    await logAudit("CREATE", "Accountant", user.id, { ...data, password: undefined });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAccountant = async (
  currentState: CurrentState,
  data: AccountantSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.accountant.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
      },
    });
    await logAudit("UPDATE", "Accountant", data.id, { ...data, password: undefined });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAccountant = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);
    await prisma.accountant.delete({ where: { id } });
    await logAudit("DELETE", "Accountant", id);

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- LESSON ----------

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    const lesson = await prisma.lesson.create({ data });
    await logAudit("CREATE", "Lesson", lesson.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.lesson.update({ where: { id: data.id }, data });
    await logAudit("UPDATE", "Lesson", data.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.lesson.delete({ where: { id: parseInt(id) } });
    await logAudit("DELETE", "Lesson", id);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- ASSIGNMENT ----------

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    const assignment = await prisma.assignment.create({ data });
    await logAudit("CREATE", "Assignment", assignment.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.assignment.update({ where: { id: data.id }, data });
    await logAudit("UPDATE", "Assignment", data.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.assignment.delete({ where: { id: parseInt(id) } });
    await logAudit("DELETE", "Assignment", id);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- RESULT ----------

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    const result = await prisma.result.create({
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
      },
    });
    await logAudit("CREATE", "Result", result.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.result.update({
      where: { id: data.id },
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
      },
    });
    await logAudit("UPDATE", "Result", data.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.result.delete({ where: { id: parseInt(id) } });
    await logAudit("DELETE", "Result", id);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- ATTENDANCE ----------

export const createAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    const attendance = await prisma.attendance.create({ data });
    await logAudit("CREATE", "Attendance", attendance.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.attendance.update({ where: { id: data.id }, data });
    await logAudit("UPDATE", "Attendance", data.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.attendance.delete({ where: { id: parseInt(id) } });
    await logAudit("DELETE", "Attendance", id);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- EVENT ----------

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    const event = await prisma.event.create({
      data: { ...data, classId: data.classId || null },
    });
    await logAudit("CREATE", "Event", event.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.event.update({
      where: { id: data.id },
      data: { ...data, classId: data.classId || null },
    });
    await logAudit("UPDATE", "Event", data.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.event.delete({ where: { id: parseInt(id) } });
    await logAudit("DELETE", "Event", id);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- ANNOUNCEMENT ----------

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    const announcement = await prisma.announcement.create({
      data: { ...data, classId: data.classId || null },
    });
    await logAudit("CREATE", "Announcement", announcement.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.announcement.update({
      where: { id: data.id },
      data: { ...data, classId: data.classId || null },
    });
    await logAudit("UPDATE", "Announcement", data.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    await logAudit("DELETE", "Announcement", id);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- FEE STRUCTURE ----------

export const createFeeStructure = async (
  currentState: CurrentState,
  data: FeeStructureSchema
) => {
  try {
    const fee = await prisma.feeStructure.create({ data });
    await logAudit("CREATE", "FeeStructure", fee.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateFeeStructure = async (
  currentState: CurrentState,
  data: FeeStructureSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.feeStructure.update({ where: { id: data.id }, data });
    await logAudit("UPDATE", "FeeStructure", data.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteFeeStructure = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.feeStructure.delete({ where: { id: parseInt(id) } });
    await logAudit("DELETE", "FeeStructure", id);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- FEE PAYMENT ----------

const recomputeInvoiceStatus = (amountDue: number, amountPaid: number) => {
  if (amountPaid <= 0) return "PENDING" as const;
  if (amountPaid >= amountDue) return "PAID" as const;
  return "PARTIAL" as const;
};

export const createFeePayment = async (
  currentState: CurrentState,
  data: FeePaymentSchema
) => {
  try {
    const { userId } = auth();
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: { student: true, feeStructure: true },
    });
    if (!invoice) return { success: false, error: true };

    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.feePayment.create({
        data: {
          amount: data.amount,
          date: data.date,
          method: data.method,
          notes: data.notes,
          studentId: invoice.studentId,
          feeStructureId: invoice.feeStructureId,
          invoiceId: invoice.id,
          recordedById: userId || "unknown",
        },
      });

      const newAmountPaid = invoice.amountPaid + data.amount;
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newAmountPaid,
          status: recomputeInvoiceStatus(invoice.amountDue, newAmountPaid),
        },
      });

      await tx.notification.create({
        data: {
          userId: invoice.student.parentId,
          title: "Payment received",
          message: `A payment of ₦${data.amount.toLocaleString()} was recorded for ${invoice.student.name} ${invoice.student.surname} (${invoice.feeStructure.name}).`,
          type: "PAYMENT_CONFIRMATION",
          link: `/statements/${invoice.studentId}`,
        },
      });
      await tx.notification.create({
        data: {
          userId: invoice.studentId,
          title: "Payment received",
          message: `Your payment of ₦${data.amount.toLocaleString()} for ${invoice.feeStructure.name} was recorded.`,
          type: "PAYMENT_CONFIRMATION",
          link: `/statements/${invoice.studentId}`,
        },
      });

      return created;
    });

    await logAudit("CREATE", "FeePayment", payment.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateFeePayment = async (
  currentState: CurrentState,
  data: FeePaymentSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    const existing = await prisma.feePayment.findUnique({
      where: { id: data.id },
    });
    if (!existing) return { success: false, error: true };

    await prisma.$transaction(async (tx) => {
      await tx.feePayment.update({
        where: { id: data.id },
        data: {
          amount: data.amount,
          date: data.date,
          method: data.method,
          notes: data.notes,
        },
      });

      if (existing.invoiceId) {
        const invoice = await tx.invoice.findUnique({
          where: { id: existing.invoiceId },
        });
        if (invoice) {
          const newAmountPaid =
            invoice.amountPaid - existing.amount + data.amount;
          await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              amountPaid: newAmountPaid,
              status: recomputeInvoiceStatus(invoice.amountDue, newAmountPaid),
            },
          });
        }
      }
    });

    await logAudit("UPDATE", "FeePayment", data.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteFeePayment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const existing = await prisma.feePayment.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) return { success: false, error: true };

    await prisma.$transaction(async (tx) => {
      await tx.feePayment.delete({ where: { id: parseInt(id) } });

      if (existing.invoiceId) {
        const invoice = await tx.invoice.findUnique({
          where: { id: existing.invoiceId },
        });
        if (invoice) {
          const newAmountPaid = Math.max(
            invoice.amountPaid - existing.amount,
            0
          );
          await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              amountPaid: newAmountPaid,
              status: recomputeInvoiceStatus(invoice.amountDue, newAmountPaid),
            },
          });
        }
      }
    });

    await logAudit("DELETE", "FeePayment", id);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- INVOICE GENERATION ----------

export const generateInvoices = async (
  currentState: CurrentState,
  data: { feeStructureId: number }
) => {
  try {
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: data.feeStructureId },
      include: { grade: { include: { students: true } } },
    });
    if (!feeStructure) return { success: false, error: true };

    let created = 0;
    for (const student of feeStructure.grade.students) {
      const existing = await prisma.invoice.findUnique({
        where: {
          studentId_feeStructureId: {
            studentId: student.id,
            feeStructureId: feeStructure.id,
          },
        },
      });
      if (existing) continue;

      const waiver = await prisma.waiver.findFirst({
        where: { studentId: student.id, session: feeStructure.session },
      });

      let amountDue = feeStructure.amount;
      if (waiver?.percent) {
        amountDue = amountDue * (1 - waiver.percent / 100);
      } else if (waiver?.fixedAmount) {
        amountDue = Math.max(amountDue - waiver.fixedAmount, 0);
      }

      const invoice = await prisma.invoice.create({
        data: {
          studentId: student.id,
          feeStructureId: feeStructure.id,
          amountDue: Math.round(amountDue * 100) / 100,
          dueDate: feeStructure.dueDate || new Date(),
          status: waiver && amountDue === 0 ? "WAIVED" : "PENDING",
        },
      });
      await logAudit("CREATE", "Invoice", invoice.id, {
        studentId: student.id,
        feeStructureId: feeStructure.id,
      });
      created++;
    }

    return { success: true, error: false, created };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- INSTALLMENT PLAN ----------

export const createInstallmentPlan = async (
  currentState: CurrentState,
  data: { invoiceId: number; parts: number }
) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });
    if (!invoice) return { success: false, error: true };

    const outstanding = invoice.amountDue - invoice.amountPaid;
    const partAmount = Math.round((outstanding / data.parts) * 100) / 100;
    const daySpacing = 30;

    await prisma.$transaction(
      Array.from({ length: data.parts }).map((_, i) =>
        prisma.installment.create({
          data: {
            invoiceId: invoice.id,
            amount:
              i === data.parts - 1
                ? Math.round((outstanding - partAmount * i) * 100) / 100
                : partAmount,
            dueDate: new Date(
              invoice.dueDate.getTime() + i * daySpacing * 24 * 60 * 60 * 1000
            ),
            order: i + 1,
          },
        })
      )
    );

    await logAudit("CREATE", "InstallmentPlan", invoice.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- WAIVER ----------

export const createWaiver = async (
  currentState: CurrentState,
  data: WaiverSchema
) => {
  try {
    const { userId } = auth();
    const waiver = await prisma.waiver.create({
      data: { ...data, approvedById: userId || "unknown" },
    });
    await logAudit("CREATE", "Waiver", waiver.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateWaiver = async (
  currentState: CurrentState,
  data: WaiverSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.waiver.update({ where: { id: data.id }, data });
    await logAudit("UPDATE", "Waiver", data.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteWaiver = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.waiver.delete({ where: { id: parseInt(id) } });
    await logAudit("DELETE", "Waiver", id);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- REFUND ----------

export const createRefund = async (
  currentState: CurrentState,
  data: RefundSchema
) => {
  try {
    const { userId } = auth();
    const refund = await prisma.$transaction(async (tx) => {
      const created = await tx.refund.create({
        data: { ...data, approvedById: userId || "unknown" },
      });
      const payment = await tx.feePayment.findUnique({
        where: { id: data.feePaymentId },
      });
      if (payment?.invoiceId) {
        const invoice = await tx.invoice.findUnique({
          where: { id: payment.invoiceId },
        });
        if (invoice) {
          const newAmountPaid = Math.max(
            invoice.amountPaid - data.amount,
            0
          );
          await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              amountPaid: newAmountPaid,
              status: recomputeInvoiceStatus(invoice.amountDue, newAmountPaid),
            },
          });
        }
      }
      return created;
    });
    await logAudit("CREATE", "Refund", refund.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateRefund = async (
  currentState: CurrentState,
  data: RefundSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.refund.update({
      where: { id: data.id },
      data: { amount: data.amount, reason: data.reason },
    });
    await logAudit("UPDATE", "Refund", data.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteRefund = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.refund.delete({ where: { id: parseInt(id) } });
    await logAudit("DELETE", "Refund", id);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- NOTIFICATIONS ----------

export const markNotificationRead = async (id: number) => {
  try {
    await prisma.notification.update({ where: { id }, data: { read: true } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const { userId } = auth();
    if (!userId) return { success: false, error: true };
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- REMINDERS ----------

const LOW_COLLECTION_THRESHOLD = 0.5;

export const sendOverdueReminders = async () => {
  try {
    const now = new Date();
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["PENDING", "PARTIAL"] },
        dueDate: { lt: now },
      },
      include: { student: true, feeStructure: true },
    });

    let remindersSent = 0;
    for (const invoice of overdueInvoices) {
      const daysOverdue = Math.floor(
        (now.getTime() - invoice.dueDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      const outstanding = invoice.amountDue - invoice.amountPaid;
      const tone =
        daysOverdue > 14
          ? "This is a firm notice"
          : "This is a friendly reminder";

      await prisma.notification.create({
        data: {
          userId: invoice.student.parentId,
          title: `Overdue: ${invoice.feeStructure.name}`,
          message: `${tone} that ₦${outstanding.toLocaleString()} for ${
            invoice.student.name
          } ${invoice.student.surname}'s ${
            invoice.feeStructure.name
          } is ${daysOverdue} day(s) overdue.`,
          type: "OVERDUE_REMINDER",
          link: `/statements/${invoice.studentId}`,
        },
      });
      remindersSent++;
    }

    // Low-collection alert per grade
    const grades = await prisma.grade.findMany({
      include: {
        feeStructures: {
          include: { invoices: true },
        },
      },
    });
    for (const grade of grades) {
      const invoices = grade.feeStructures.flatMap((fs) => fs.invoices);
      if (invoices.length === 0) continue;
      const totalDue = invoices.reduce((s, i) => s + i.amountDue, 0);
      const totalPaid = invoices.reduce((s, i) => s + i.amountPaid, 0);
      const rate = totalDue > 0 ? totalPaid / totalDue : 1;
      if (rate < LOW_COLLECTION_THRESHOLD) {
        const staff = await prisma.owner.findMany({ select: { id: true } });
        const accountants = await prisma.accountant.findMany({
          select: { id: true },
        });
        for (const person of [...staff, ...accountants]) {
          await prisma.notification.create({
            data: {
              userId: person.id,
              title: `Low collection: ${formatGradeNameServer(grade)}`,
              message: `Collection rate for ${formatGradeNameServer(
                grade
              )} is ${Math.round(rate * 100)}%, below the ${Math.round(
                LOW_COLLECTION_THRESHOLD * 100
              )}% threshold.`,
              type: "LOW_COLLECTION_ALERT",
              link: "/accounting",
            },
          });
        }
      }
    }

    return { success: true, error: false, remindersSent };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const sendSingleReminder = async (invoiceId: number) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { student: true, feeStructure: true },
    });
    if (!invoice) return { success: false, error: true };

    const outstanding = invoice.amountDue - invoice.amountPaid;
    await prisma.notification.create({
      data: {
        userId: invoice.student.parentId,
        title: `Reminder: ${invoice.feeStructure.name}`,
        message: `Please note ₦${outstanding.toLocaleString()} is still outstanding for ${invoice.student.name} ${invoice.student.surname}'s ${invoice.feeStructure.name}.`,
        type: "OVERDUE_REMINDER",
        link: `/statements/${invoice.studentId}`,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

const SECTION_LABEL_SERVER: Record<string, string> = {
  PRIMARY: "Primary",
  JSS: "JSS",
  SSS: "SS",
};
const formatGradeNameServer = (grade: { section: string; level: number }) =>
  `${SECTION_LABEL_SERVER[grade.section]} ${grade.level}`;

// ---------- EXPENSE ----------

export const createExpense = async (
  currentState: CurrentState,
  data: ExpenseSchema
) => {
  try {
    const { userId } = auth();
    const expense = await prisma.expense.create({
      data: { ...data, recordedById: userId || "unknown" },
    });
    await logAudit("CREATE", "Expense", expense.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExpense = async (
  currentState: CurrentState,
  data: ExpenseSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.expense.update({ where: { id: data.id }, data });
    await logAudit("UPDATE", "Expense", data.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExpense = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.expense.delete({ where: { id: parseInt(id) } });
    await logAudit("DELETE", "Expense", id);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- INCOME ----------

export const createIncome = async (
  currentState: CurrentState,
  data: IncomeSchema
) => {
  try {
    const { userId } = auth();
    const income = await prisma.income.create({
      data: { ...data, recordedById: userId || "unknown" },
    });
    await logAudit("CREATE", "Income", income.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateIncome = async (
  currentState: CurrentState,
  data: IncomeSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.income.update({ where: { id: data.id }, data });
    await logAudit("UPDATE", "Income", data.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteIncome = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.income.delete({ where: { id: parseInt(id) } });
    await logAudit("DELETE", "Income", id);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------- GRADING SCALE ----------

export const createGradingScale = async (
  currentState: CurrentState,
  data: GradingScaleSchema
) => {
  if (data.minScore > data.maxScore) {
    return { success: false, error: true };
  }
  try {
    const scale = await prisma.gradingScale.create({ data });
    await logAudit("CREATE", "GradingScale", scale.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateGradingScale = async (
  currentState: CurrentState,
  data: GradingScaleSchema
) => {
  if (!data.id) return { success: false, error: true };
  if (data.minScore > data.maxScore) {
    return { success: false, error: true };
  }
  try {
    await prisma.gradingScale.update({ where: { id: data.id }, data });
    await logAudit("UPDATE", "GradingScale", data.id, data);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteGradingScale = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.gradingScale.delete({ where: { id: parseInt(id) } });
    await logAudit("DELETE", "GradingScale", id);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
