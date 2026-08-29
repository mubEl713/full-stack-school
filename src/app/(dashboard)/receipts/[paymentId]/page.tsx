import prisma from "@/lib/prisma";
import { FEE_CATEGORY_LABEL, formatNaira } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import PrintButton from "@/components/PrintButton";

const ReceiptPage = async ({
  params,
}: {
  params: { paymentId: string };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const payment = await prisma.feePayment.findUnique({
    where: { id: parseInt(params.paymentId) },
    include: {
      student: { include: { parent: true, class: true } },
      feeStructure: true,
    },
  });

  if (!payment) return notFound();

  if (role === "student" && payment.studentId !== userId) return notFound();
  if (role === "parent" && payment.student.parentId !== userId) return notFound();

  return (
    <div className="p-4 flex justify-center print:p-0">
      <div className="bg-white p-8 rounded-md max-w-xl w-full print:shadow-none print:rounded-none">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={32} height={32} />
            <h1 className="text-xl font-bold">SchooLama</h1>
          </div>
          <h2 className="text-lg font-semibold text-gray-500">RECEIPT</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <span className="text-gray-400 block">Receipt No.</span>
            <span className="font-medium">#{payment.id.toString().padStart(6, "0")}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Date</span>
            <span className="font-medium">
              {new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
                payment.date
              )}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block">Student</span>
            <span className="font-medium">
              {payment.student.name} {payment.student.surname}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block">Class</span>
            <span className="font-medium">{payment.student.class.name}</span>
          </div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="py-2">Description</th>
              <th className="py-2">Category</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2">{payment.feeStructure.name}</td>
              <td className="py-2">
                {FEE_CATEGORY_LABEL[payment.feeStructure.category]}
              </td>
              <td className="py-2 text-right">{formatNaira(payment.amount)}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="text-right">
            <span className="text-gray-400 block text-sm">Amount Paid</span>
            <span className="text-2xl font-bold">
              {formatNaira(payment.amount)}
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-500 flex justify-between border-t border-gray-200 pt-4">
          <span>Payment Method: {payment.method.replace("_", " ")}</span>
          {payment.notes && <span>Note: {payment.notes}</span>}
        </div>

        <PrintButton />
      </div>
    </div>
  );
};

export default ReceiptPage;
