import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { formatNaira } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const WaiverListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const canWrite = role === "admin" || role === "owner" || role === "accountant";

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Type", accessor: "type" },
    { header: "Discount", accessor: "discount", className: "hidden md:table-cell" },
    { header: "Reason", accessor: "reason", className: "hidden md:table-cell" },
    { header: "Session", accessor: "session", className: "hidden md:table-cell" },
    ...(canWrite ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.WaiverWhereInput = {};
  if (queryParams?.search) {
    query.student = { name: { contains: queryParams.search, mode: "insensitive" } };
  }

  const [data, count] = await prisma.$transaction([
    prisma.waiver.findMany({
      where: query,
      include: { student: { select: { name: true, surname: true } } },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { createdAt: "desc" },
    }),
    prisma.waiver.count({ where: query }),
  ]);

  const renderRow = (item: (typeof data)[number]) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        {item.student.name} {item.student.surname}
      </td>
      <td>{item.type.replace("_", " ")}</td>
      <td className="hidden md:table-cell">
        {item.percent ? `${item.percent}%` : formatNaira(item.fixedAmount || 0)}
      </td>
      <td className="hidden md:table-cell">{item.reason}</td>
      <td className="hidden md:table-cell">{item.session}</td>
      <td>
        <div className="flex items-center gap-2">
          {canWrite && (
            <>
              <FormContainer table="waiver" type="update" data={item} />
              <FormContainer table="waiver" type="delete" id={item.id} />
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
          Waivers &amp; Scholarships
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            {canWrite && <FormContainer table="waiver" type="create" />}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default WaiverListPage;
