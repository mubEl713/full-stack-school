import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { formatGradeName } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const FeeStructureListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const canWrite = role === "admin" || role === "owner" || role === "accountant";

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
    { header: "Term / Session", accessor: "term", className: "hidden md:table-cell" },
    { header: "Amount", accessor: "amount", className: "hidden md:table-cell" },
    ...(canWrite ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.FeeStructureWhereInput = {};
  if (queryParams?.search) {
    query.name = { contains: queryParams.search, mode: "insensitive" };
  }

  const [data, count] = await prisma.$transaction([
    prisma.feeStructure.findMany({
      where: query,
      include: { grade: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { createdAt: "desc" },
    }),
    prisma.feeStructure.count({ where: query }),
  ]);

  const renderRow = (item: (typeof data)[number]) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>
      <td className="hidden md:table-cell">
        {formatGradeName(item.grade.section, item.grade.level)}
      </td>
      <td className="hidden md:table-cell">
        {item.term} / {item.session}
      </td>
      <td className="hidden md:table-cell">
        ₦{item.amount.toLocaleString()}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {canWrite && (
            <>
              <FormContainer table="feeStructure" type="update" data={item} />
              <FormContainer table="feeStructure" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Fee Structures
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            {canWrite && <FormContainer table="feeStructure" type="create" />}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default FeeStructureListPage;
