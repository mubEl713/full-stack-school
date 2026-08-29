import prisma from "@/lib/prisma";
import { FEE_CATEGORY_LABEL, formatNaira } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";

const StatementPage = async ({
  params,
}: {
  params: { studentId: string };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const student = await prisma.student.findUnique({
    where: { id: params.studentId },
    include: { class: true, parent: true },
  });
  if (!student) return notFound();

  if (role === "student" && student.id !== userId) return notFound();
  if (role === "parent" && student.parentId !== userId) return notFound();
  if (role === "teacher") {
    const supervises = await prisma.class.findFirst({
      where: { id: student.classId, supervisorId: userId! },
    });
    if (!supervises) return notFound();
  }

  const invoices = await prisma.invoice.findMany({
    where: { studentId: student.id },
    include: {
      feeStructure: true,
      payments: { orderBy: { date: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  const totalDue = invoices.reduce((s, i) => s + i.amountDue, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.amountPaid, 0);

  return (
    <div className="p-4 flex justify-center print:p-0">
      <div className="bg-white p-8 rounded-md max-w-2xl w-full print:shadow-none print:rounded-none">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={32} height={32} />
            <h1 className="text-xl font-bold">SchooLama</h1>
          </div>
          <h2 className="text-lg font-semibold text-gray-500">
            FEE STATEMENT
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <span className="text-gray-400 block">Student</span>
            <span className="font-medium">
              {student.name} {student.surname}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block">Class</span>
            <span className="font-medium">{student.class.name}</span>
          </div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="py-2">Fee</th>
              <th className="py-2">Due</th>
              <th className="py-2">Paid</th>
              <th className="py-2 text-right">Outstanding</th>
              <th className="py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-200">
                <td className="py-2">
                  {inv.feeStructure.name} (
                  {FEE_CATEGORY_LABEL[inv.feeStructure.category]})
                </td>
                <td className="py-2">{formatNaira(inv.amountDue)}</td>
                <td className="py-2">{formatNaira(inv.amountPaid)}</td>
                <td className="py-2 text-right">
                  {formatNaira(Math.max(inv.amountDue - inv.amountPaid, 0))}
                </td>
                <td className="py-2 text-right">{inv.status}</td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-400">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-end gap-8 mb-6">
          <div className="text-right">
            <span className="text-gray-400 block text-sm">Total Due</span>
            <span className="text-lg font-semibold">{formatNaira(totalDue)}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 block text-sm">Total Paid</span>
            <span className="text-lg font-semibold">{formatNaira(totalPaid)}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 block text-sm">Outstanding</span>
            <span className="text-lg font-bold">
              {formatNaira(Math.max(totalDue - totalPaid, 0))}
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-sm mb-2 print:hidden">
          Payment History
        </h3>
        <table className="w-full text-sm mb-6 print:hidden">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="py-2">Date</th>
              <th className="py-2">Fee</th>
              <th className="py-2">Method</th>
              <th className="py-2 text-right">Amount</th>
              <th className="py-2 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {invoices.flatMap((inv) =>
              inv.payments.map((p) => (
                <tr key={p.id} className="border-b border-gray-200">
                  <td className="py-2">
                    {new Intl.DateTimeFormat("en-US").format(p.date)}
                  </td>
                  <td className="py-2">{inv.feeStructure.name}</td>
                  <td className="py-2">{p.method.replace("_", " ")}</td>
                  <td className="py-2 text-right">{formatNaira(p.amount)}</td>
                  <td className="py-2 text-right">
                    <Link
                      href={`/receipts/${p.id}`}
                      className="text-blue-500 underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <PrintButton />
      </div>
    </div>
  );
};

export default StatementPage;
