import prisma from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";

const MyClassFeesCard = async ({ teacherId }: { teacherId: string }) => {
  const supervisedClass = await prisma.class.findFirst({
    where: { supervisorId: teacherId },
    include: { students: { select: { id: true } } },
  });

  if (!supervisedClass) return null;

  const studentIds = supervisedClass.students.map((s) => s.id);
  const invoices = await prisma.invoice.findMany({
    where: { studentId: { in: studentIds } },
  });

  const totalDue = invoices.reduce((s, i) => s + i.amountDue, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.amountPaid, 0);
  const rate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 100;
  const defaulters = new Set(
    invoices
      .filter((i) => i.status !== "PAID" && i.status !== "WAIVED" && i.amountDue > i.amountPaid)
      .map((i) => i.studentId)
  ).size;

  return (
    <div className="bg-white p-4 rounded-md">
      <h1 className="text-lg font-semibold mb-2">
        {supervisedClass.name} — Fee Status
      </h1>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <span className="text-gray-400 block text-xs">Collection Rate</span>
          <span className="font-semibold">{rate}%</span>
        </div>
        <div>
          <span className="text-gray-400 block text-xs">Outstanding</span>
          <span className="font-semibold">
            {formatNaira(Math.max(totalDue - totalPaid, 0))}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block text-xs">Defaulters</span>
          <span className="font-semibold">{defaulters}</span>
        </div>
      </div>
    </div>
  );
};

export default MyClassFeesCard;
