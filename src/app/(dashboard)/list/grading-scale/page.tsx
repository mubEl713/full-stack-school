import FormContainer from "@/components/FormContainer";
import Table from "@/components/Table";
import prisma from "@/lib/prisma";
import { GradingScale } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const GradingScalePage = async () => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "Grade", accessor: "grade" },
    { header: "Score Range", accessor: "range" },
    { header: "Remark", accessor: "remark" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const data = await prisma.gradingScale.findMany({
    orderBy: { order: "asc" },
  });

  const renderRow = (item: GradingScale) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4 font-semibold">{item.grade}</td>
      <td>
        {item.minScore} - {item.maxScore}
      </td>
      <td>{item.remark}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="gradingScale" type="update" data={item} />
              <FormContainer table="gradingScale" type="delete" id={item.id} />
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
          Grading Scale
        </h1>
        {role === "admin" && <FormContainer table="gradingScale" type="create" />}
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
    </div>
  );
};

export default GradingScalePage;
