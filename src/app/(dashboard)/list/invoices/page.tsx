import FormContainer from "@/components/FormContainer";
import InstallmentPlanButton from "@/components/InstallmentPlanButton";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { FEE_CATEGORY_LABEL, formatNaira } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PARTIAL: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  WAIVED: "bg-gray-100 text-gray-700",
};

const InvoiceListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const canWrite = role === "admin" || role === "owner" || role === "accountant";

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Fee", accessor: "fee", className: "hidden md:table-cell" },
    { header: "Due", accessor: "due", className: "hidden md:table-cell" },
    { header: "Paid", accessor: "paid", className: "hidden md:table-cell" },
    { header: "Outstanding", accessor: "outstanding" },
    { header: "Status", accessor: "status" },
    { header: "Due Date", accessor: "dueDate", className: "hidden md:table-cell" },
    ...(canWrite ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.InvoiceWhereInput = {};
  const studentFilter: Prisma.StudentWhereInput = {};
  if (queryParams?.search) {
    studentFilter.name = { contains: queryParams.search, mode: "insensitive" };
  }
  if (queryParams?.status) {
    query.status = queryParams.status as any;
  }

  switch (role) {
    case "student":
      query.studentId = userId!;
      break;
    case "parent":
      studentFilter.parentId = userId!;
      break;
    case "teacher": {
      const supervised = await prisma.class.findMany({
        where: { supervisorId: userId! },
        select: { id: true },
      });
      studentFilter.classId = { in: supervised.map((c) => c.id) };
      break;
    }
    default:
      break;
  }
  if (Object.keys(studentFilter).length > 0) {
    query.student = studentFilter;
  }

  const [data, count] = await prisma.$transaction([
    prisma.invoice.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        feeStructure: { select: { name: true, category: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.count({ where: query }),
  ]);

  const renderRow = (item: (typeof data)[number]) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        {item.student.name} {item.student.surname}
      </td>
      <td className="hidden md:table-cell">
        {item.feeStructure.name} ({FEE_CATEGORY_LABEL[item.feeStructure.category]})
      </td>
      <td className="hidden md:table-cell">{formatNaira(item.amountDue)}</td>
      <td className="hidden md:table-cell">{formatNaira(item.amountPaid)}</td>
      <td>{formatNaira(Math.max(item.amountDue - item.amountPaid, 0))}</td>
      <td>
        <span
          className={`px-2 py-1 rounded-full text-xs ${STATUS_STYLE[item.status]}`}
        >
          {item.status}
        </span>
      </td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.dueDate)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/statements/${item.studentId}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {canWrite && item.status !== "PAID" && item.status !== "WAIVED" && (
            <InstallmentPlanButton invoiceId={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Invoices</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {canWrite && <FormContainer table="feePayment" type="create" />}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default InvoiceListPage;
