import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { formatNaira } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const RefundListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const canWrite = role === "admin" || role === "owner" || role === "accountant";

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Amount", accessor: "amount" },
    { header: "Reason", accessor: "reason", className: "hidden md:table-cell" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    ...(canWrite ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.RefundWhereInput = {};
  if (queryParams?.search) {
    query.feePayment = {
      student: { name: { contains: queryParams.search, mode: "insensitive" } },
    };
  }

  const [data, count] = await prisma.$transaction([
    prisma.refund.findMany({
      where: query,
      include: {
        feePayment: {
          include: { student: { select: { name: true, surname: true } } },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { createdAt: "desc" },
    }),
    prisma.refund.count({ where: query }),
  ]);

  const renderRow = (item: (typeof data)[number]) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        {item.feePayment.student.name} {item.feePayment.student.surname}
      </td>
      <td>{formatNaira(item.amount)}</td>
      <td className="hidden md:table-cell">{item.reason}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.createdAt)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {canWrite && (
            <>
              <FormContainer table="refund" type="update" data={item} />
              <FormContainer table="refund" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Refunds</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {canWrite && <FormContainer table="refund" type="create" />}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default RefundListPage;
