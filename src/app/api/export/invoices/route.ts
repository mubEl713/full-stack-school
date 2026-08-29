import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const csvEscape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (!role || !["admin", "owner", "accountant"].includes(role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const invoices = await prisma.invoice.findMany({
    include: {
      student: { select: { name: true, surname: true } },
      feeStructure: { select: { name: true, category: true, session: true, term: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "Student",
    "Fee",
    "Category",
    "Session",
    "Term",
    "Amount Due",
    "Amount Paid",
    "Outstanding",
    "Status",
    "Due Date",
  ];
  const rows = invoices.map((inv) => [
    `${inv.student.name} ${inv.student.surname}`,
    inv.feeStructure.name,
    inv.feeStructure.category,
    inv.feeStructure.session,
    inv.feeStructure.term,
    inv.amountDue,
    inv.amountPaid,
    Math.max(inv.amountDue - inv.amountPaid, 0),
    inv.status,
    inv.dueDate.toISOString().split("T")[0],
  ]);

  const csv = [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="invoices.csv"`,
    },
  });
}
