import prisma from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";

const MyChildrenFeesCard = async ({ parentId }: { parentId: string }) => {
  const students = await prisma.student.findMany({
    where: { parentId },
    include: { invoices: true },
  });

  if (students.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-md">
      <h1 className="text-lg font-semibold mb-2">My Children&apos;s Fees</h1>
      <div className="flex flex-col gap-3">
        {students.map((student) => {
          const due = student.invoices.reduce((s, i) => s + i.amountDue, 0);
          const paid = student.invoices.reduce((s, i) => s + i.amountPaid, 0);
          const outstanding = Math.max(due - paid, 0);
          return (
            <div
              key={student.id}
              className="flex items-center justify-between text-sm border-b border-gray-100 pb-2"
            >
              <span>
                {student.name} {student.surname}
              </span>
              <span
                className={outstanding > 0 ? "text-red-500 font-medium" : "text-green-600"}
              >
                {outstanding > 0 ? formatNaira(outstanding) + " due" : "Paid up"}
              </span>
              <Link
                href={`/statements/${student.id}`}
                className="text-blue-500 underline text-xs"
              >
                Statement
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyChildrenFeesCard;
