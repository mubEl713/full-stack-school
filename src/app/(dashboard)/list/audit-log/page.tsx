import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { AuditLog, Prisma } from "@prisma/client";

const AuditLogPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const columns = [
    { header: "When", accessor: "when" },
    { header: "Who", accessor: "who" },
    { header: "Action", accessor: "action" },
    { header: "Entity", accessor: "entity" },
    { header: "Record", accessor: "record", className: "hidden md:table-cell" },
  ];

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.AuditLogWhereInput = {};
  if (queryParams?.model) {
    query.model = queryParams.model;
  }

  const [data, count] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count({ where: query }),
  ]);

  const renderRow = (item: AuditLog) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">
        {new Intl.DateTimeFormat("en-US", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(item.createdAt)}
      </td>
      <td>
        {item.performedByName}{" "}
        <span className="text-xs text-gray-400">({item.performedByRole})</span>
      </td>
      <td>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            item.action === "CREATE"
              ? "bg-green-100 text-green-700"
              : item.action === "UPDATE"
              ? "bg-blue-100 text-blue-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.action}
        </span>
      </td>
      <td>{item.model}</td>
      <td className="hidden md:table-cell">{item.recordId}</td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Audit Log</h1>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AuditLogPage;
