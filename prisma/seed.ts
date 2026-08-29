import { Day, PrismaClient, SchoolSection, UserSex } from "@prisma/client";
const prisma = new PrismaClient();

const SECTION_LABEL: Record<SchoolSection, string> = {
  PRIMARY: "Primary",
  JSS: "JSS",
  SSS: "SS",
};

const armsFor = (section: SchoolSection) =>
  section === "SSS" ? ["Science", "Art", "Commercial"] : ["A", "B", "C"];

async function main() {
  // ADMIN
  await prisma.admin.create({
    data: {
      id: "admin1",
      username: "admin1",
    },
  });
  await prisma.admin.create({
    data: {
      id: "admin2",
      username: "admin2",
    },
  });

  // GRADES: Primary 1-6, JSS 1-3, SS 1-3
  const gradeDefs: { section: SchoolSection; level: number }[] = [
    ...[1, 2, 3, 4, 5, 6].map((level) => ({ section: "PRIMARY" as SchoolSection, level })),
    ...[1, 2, 3].map((level) => ({ section: "JSS" as SchoolSection, level })),
    ...[1, 2, 3].map((level) => ({ section: "SSS" as SchoolSection, level })),
  ];

  const grades = [];
  for (const def of gradeDefs) {
    grades.push(await prisma.grade.create({ data: def }));
  }

  // CLASSES: arms A/B/C for Primary+JSS, Science/Art/Commercial for SS
  const classes = [];
  for (const grade of grades) {
    for (const arm of armsFor(grade.section)) {
      const label = SECTION_LABEL[grade.section];
      const name =
        grade.section === "SSS"
          ? `${label} ${grade.level} ${arm}`
          : `${label} ${grade.level}${arm}`;
      classes.push(
        await prisma.class.create({
          data: {
            name,
            arm,
            gradeId: grade.id,
            capacity: Math.floor(Math.random() * (35 - 20 + 1)) + 20,
          },
        })
      );
    }
  }

  // SUBJECT
  const subjectData = [
    { name: "Mathematics" },
    { name: "Science" },
    { name: "English" },
    { name: "History" },
    { name: "Geography" },
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "Computer Science" },
    { name: "Art" },
  ];

  for (const subject of subjectData) {
    await prisma.subject.create({ data: subject });
  }

  // TEACHER
  for (let i = 1; i <= 15; i++) {
    await prisma.teacher.create({
      data: {
        id: `teacher${i}`, // Unique ID for the teacher
        username: `teacher${i}`,
        name: `TName${i}`,
        surname: `TSurname${i}`,
        email: `teacher${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
        bloodType: "A+",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        subjects: { connect: [{ id: (i % 10) + 1 }] },
        classes: { connect: [{ id: classes[i % classes.length].id }] },
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
      },
    });
  }

  // LESSON
  for (let i = 1; i <= 30; i++) {
    await prisma.lesson.create({
      data: {
        name: `Lesson${i}`, 
        day: Day[
          Object.keys(Day)[
            Math.floor(Math.random() * Object.keys(Day).length)
          ] as keyof typeof Day
        ], 
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
        endTime: new Date(new Date().setHours(new Date().getHours() + 3)), 
        subjectId: (i % 10) + 1,
        classId: classes[i % classes.length].id,
        teacherId: `teacher${(i % 15) + 1}`,
      },
    });
  }

  // PARENT
  for (let i = 1; i <= 25; i++) {
    await prisma.parent.create({
      data: {
        id: `parentId${i}`,
        username: `parentId${i}`,
        name: `PName ${i}`,
        surname: `PSurname ${i}`,
        email: `parent${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
      },
    });
  }

  // STUDENT
  for (let i = 1; i <= 50; i++) {
    const studentClass = classes[i % classes.length];
    await prisma.student.create({
      data: {
        id: `student${i}`,
        username: `student${i}`,
        name: `SName${i}`,
        surname: `SSurname ${i}`,
        email: `student${i}@example.com`,
        phone: `987-654-321${i}`,
        address: `Address${i}`,
        bloodType: "O-",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        parentId: `parentId${Math.ceil(i / 2) % 25 || 25}`,
        gradeId: studentClass.gradeId,
        classId: studentClass.id,
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 10)),
      },
    });
  }

  // EXAM
  for (let i = 1; i <= 10; i++) {
    await prisma.exam.create({
      data: {
        title: `Exam ${i}`, 
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)), 
        lessonId: (i % 30) + 1, 
      },
    });
  }

  // ASSIGNMENT
  for (let i = 1; i <= 10; i++) {
    await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`, 
        startDate: new Date(new Date().setHours(new Date().getHours() + 1)), 
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), 
        lessonId: (i % 30) + 1, 
      },
    });
  }

  // RESULT
  for (let i = 1; i <= 10; i++) {
    await prisma.result.create({
      data: {
        score: 90, 
        studentId: `student${i}`, 
        ...(i <= 5 ? { examId: i } : { assignmentId: i - 5 }), 
      },
    });
  }

  // ATTENDANCE
  for (let i = 1; i <= 10; i++) {
    await prisma.attendance.create({
      data: {
        date: new Date(), 
        present: true, 
        studentId: `student${i}`, 
        lessonId: (i % 30) + 1, 
      },
    });
  }

  // EVENT
  for (let i = 1; i <= 5; i++) {
    await prisma.event.create({
      data: {
        title: `Event ${i}`, 
        description: `Description for Event ${i}`, 
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
        classId: classes[i % classes.length].id,
      },
    });
  }

  // ANNOUNCEMENT
  for (let i = 1; i <= 5; i++) {
    await prisma.announcement.create({
      data: {
        title: `Announcement ${i}`,
        description: `Description for Announcement ${i}`,
        date: new Date(),
        classId: classes[i % classes.length].id,
      },
    });
  }

  // GRADING SCALE (WAEC-style default bands)
  const gradingBands = [
    { grade: "A1", minScore: 75, maxScore: 100, remark: "Excellent", order: 1 },
    { grade: "B2", minScore: 70, maxScore: 74, remark: "Very Good", order: 2 },
    { grade: "B3", minScore: 65, maxScore: 69, remark: "Good", order: 3 },
    { grade: "C4", minScore: 60, maxScore: 64, remark: "Credit", order: 4 },
    { grade: "C5", minScore: 55, maxScore: 59, remark: "Credit", order: 5 },
    { grade: "C6", minScore: 50, maxScore: 54, remark: "Credit", order: 6 },
    { grade: "D7", minScore: 45, maxScore: 49, remark: "Pass", order: 7 },
    { grade: "E8", minScore: 40, maxScore: 44, remark: "Pass", order: 8 },
    { grade: "F9", minScore: 0, maxScore: 39, remark: "Fail", order: 9 },
  ];
  for (const band of gradingBands) {
    await prisma.gradingScale.create({ data: band });
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
